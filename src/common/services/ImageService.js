let AWS = require('aws-sdk');
let lwip = require('lwip');
let loopback = require('loopback');

export class ImageService {
  static getServerPath(image) {
    return `${image.type}/${image.userId}/${image.id}.jpg`
  }

  static getImageUrl(image) {
    let bucket = ImageService.getBucketName(image);
    let path = ImageService.getServerPath(image);
    return `https://s3-us-west-2.amazonaws.com/${bucket}/${path}`;
  }

  static getBucketName(image) {
    let env = process.env.NODE_ENV || "development";
    let type = image.type.toLowerCase();
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
      let bucket = new AWS.S3({params: {Bucket: ImageService.getBucketName(imageObject)}});
      bucket.upload({Key: path, Body: buffer}, (err, data) => {
        if (err) {
          return reject(`amazon uploading error ${err}`);
        }
        resolve(data);
      });
    });
  }
}

