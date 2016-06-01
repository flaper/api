let AWS = require('aws-sdk');
let lwip = require('lwip');
import {App} from './App';

const S3_DOMAIN = 's3.eu-central-1.amazonaws.com';
const MAX_MIDDLE_HEIGHT = 1800;
const MAX_MIDDLE_WIDTH = 900;

export const TEST_IMAGE_ID = '1abc0000fffffff';


export const IMAGE_FORMAT = {
  middle: 'middle',
  thumb: 'thumb',
  main: 'main'
};

export class ImageService {
  static idToPath(id) {
    //once a ~ 0.5 year
    let p1 = id.substr(0, 2);
    //once a ~ 0.75 day
    let p2 = id.substr(2, 2);
    let p3 = id.substr(4);
    return `${p1}/${p2}/${p3}`;
  }

  static getPathAfterBucketById(imageId, imageFormat) {
    let id = App.isTestEnv() ? TEST_IMAGE_ID : imageId.toString();
    if (!imageFormat || !IMAGE_FORMAT[imageFormat]) throw `Unknown Image Format '${imageFormat}'`;
    let prefix = ImageService.idToPath(id);

    return `${prefix}_${imageFormat}.jpg`
  }

  static getBucketPath() {
    return `https://${S3_DOMAIN}/${this.getBucketName()}/`;
  }

  static getImageUrlById(id, imageFormat) {
    let bucket = ImageService.getBucketPath();
    let path = ImageService.getPathAfterBucketById(id, imageFormat);
    return `${bucket}${path}`;
  }

  static getBucketName() {
    let env = App.env();
    return `flaper.${env}.images`;
  }

  static makeImages(file) {
    return new Promise((resolve, reject)=> {
      let ready = 0;
      let buffers = {};
      let params = {quality: 80};
      lwip.open(file.path, (err, image) => {
        //middle
        image.clone((err, newImage) => {
          if (err) {
            return reject(`Image clone error: ${err} `);
          }
          newImage.batch()
            .cover(MAX_MIDDLE_WIDTH, MAX_MIDDLE_WIDTH / 1.5)
            .toBuffer('jpg', params, cbWrapper(IMAGE_FORMAT.middle));
        });

        image.clone((err, newImage) => {
          if (err) {
            return reject(`Image clone error: ${err} `);
          }
          let batch = newImage.batch();

          if (newImage.width() > MAX_MIDDLE_WIDTH) {
            //actually > 2
            let ratio = newImage.height() / newImage.width();
            let resizeHeight = ratio > MAX_MIDDLE_HEIGHT / MAX_MIDDLE_WIDTH;
            batch = !resizeHeight ? batch.resize(MAX_MIDDLE_WIDTH, ratio * MAX_MIDDLE_WIDTH)
              : batch.cover(MAX_MIDDLE_WIDTH, MAX_MIDDLE_HEIGHT);
          } else if (newImage.height() > MAX_MIDDLE_HEIGHT) {
            batch = batch.cover(newImage.width(), MAX_MIDDLE_HEIGHT);
          }

          batch.toBuffer('jpg', params, cbWrapper(IMAGE_FORMAT.main));
        });

        //thumb
        image.batch()
          .cover(225, 150)
          .toBuffer('jpg', params, cbWrapper(IMAGE_FORMAT.thumb));


      });

      function cbWrapper(imageFormat) {
        return (err, buffer) => {
          if (err) {
            return reject(`Image cropping error: ${err} `);
          }
          ready++;
          buffers[imageFormat] = buffer;
          if (ready >= 3) {
            return resolve(buffers);
          }
        }
      }
    });
  }

  static uploadToS3(imageObject, buffers) {
    if (App.isTestEnv()) {
      return Promise.resolve({});
    }

    return new Promise((resolve, reject) => {
      let bucket = new AWS.S3({params: {Bucket: ImageService.getBucketName()}});

      let ready = 0;
      let keys = Object.keys(buffers);
      let total = keys.length;
      keys.forEach(bufferName => {
        let path = ImageService.getPathAfterBucketById(imageObject.id, bufferName);
        bucket.upload({Key: path, Body: buffers[bufferName]}, cb);
      });

      function cb(err, data) {
        if (err) {
          return reject(`amazon uploading error ${err}`);
        }
        ready++;
        if (ready >= total) resolve(data);
      }
    });
  }
}

