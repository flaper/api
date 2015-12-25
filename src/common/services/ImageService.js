let AWS = require('aws-sdk');
let lwip = require('lwip');
import {App} from './App';

const S3_DOMAIN = 's3.eu-central-1.amazonaws.com';

export const TEST_IMAGE_ID = '1abc0000fffffff';

export class ImageService {
  static getPathAfterBucketById(imageId) {
    let id =  App.isTestEnv()? imageId : TEST_IMAGE_ID;
    return `${id}.jpg`
  }

  static getBucketPath() {
    return `https://${S3_DOMAIN}/${this.getBucketName()}/`;
  }

  static getImageUrlById(id) {
    let bucket = ImageService.getBucketPath();
    let path = ImageService.getPathAfterBucketById(id);
    return `${bucket}${path}`;
  }

  static getBucketName() {
    let env = App.env();
    return `flaper.${env}.images`;
  }

  static cropImage(file) {
    return new Promise((resolve, reject)=> {
      lwip.open(file.path, (err, image) => {
        image.batch()
          .crop(900, 600)
          .toBuffer('jpg', (err, buffer) => {
            if (err) {
              return reject(`Image cropping error: ${err} `);
            }
            return resolve(buffer);
          });
      });
    });
  }

  static uploadToS3(imageObject, buffer) {
    return new Promise((resolve, reject) => {
      let path = ImageService.getPathAfterBucketById(imageObject.id);
      let bucket = new AWS.S3({params: {Bucket: ImageService.getBucketName()}});
      bucket.upload({Key: path, Body: buffer}, (err, data) => {
        if (err) {
          return reject(`amazon uploading error ${err}`);
        }
        resolve(data);
      });
    });
  }
}

