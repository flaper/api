let AWS = require('aws-sdk');
let lwip = require('lwip');
import {App} from './App';

export class ImageService {
  static getServerPath(image) {
    let id = (App.env() !== 'test') ? image.id : 'test_image';
    return `${image.type}/${image.userId}/${id}.jpg`
  }

  //static getImageUrl(image) {
  //  let bucket = ImageService.getBucketName(image);
  //  let path = ImageService.getServerPath(image);
  //  return `https://s3-us-west-2.amazonaws.com/${bucket}/${path}`;
  //}

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

  static uploadToAmazon(imageObject, buffer) {
    return new Promise((resolve, reject) => {
      let path = ImageService.getServerPath(imageObject);
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

