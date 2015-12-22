import {setCurrentUserId} from '../../behaviors/currentUser'
import {ImageService} from '../../services/ImageService.js'
import {App} from '../../services/App';

//const ALLOWED_MODELS = ['Business'];
const ALLOWED_TYPES = ['create-story'];


module.exports = (Image) => {
  Image.commonInit(Image);
  Image.disableRemoteMethod('create', true);
  Image.disableRemoteMethod('upsert', true);
  Image.disableRemoteMethod('deleteById', true);
  Image.disableRemoteMethod('updateAttributes', false);
  Image.disableRemoteMethod('__get__object', false);
  Image.disableRemoteMethod('__get__user', false);

  Image.observe('before save', setCurrentUserId);

  Image.upload = upload;

  Image.remoteMethod(
    'upload',
    {
      http: {path: '/', verb: 'post'},
      description: "Upload image",
      accepts: [
        /*args file here just to display in explorer*/
        {arg: 'type', type: 'string', http: {source: 'form'}},
        //{arg: 'file', type: 'file', http: {source: 'form'}},
        {arg: 'req', type: 'Object', http: {source: 'req'}}
      ],
      returns: {root: true}
    }
  );

  function upload(type, req, cb) {
    type = req.type;
    //if (!objectType || !objectId) {
    //  throw "objectType and objectId fields are required";
    //}
    if (ALLOWED_TYPES.indexOf(type) === -1) {
      throw `Type "${type}" is not allowed`;
    }

    let file = req.file;
    if (!file) {
      throw "File is required";
    }

    //workaround as lwip inside cropImage was breaking loopback.getCurrentContext as Dec 2015
    let currentUserId = App.getCurrentUserId();

    // obtain an image object:
    return ImageService.cropImage(file)
      .then((buffer) => {
        return new Promise((resolve, reject) => {
          Image.create({type}, {currentUserId: currentUserId})
            .then((data) => ImageService.uploadToAmazon(data, buffer))
            .then(resolve, reject);
        })
      })
      .catch((error) => {
        let errorMessage = `Image object creation error: ${error}`;
        console.log(errorMessage);
        throw errorMessage;
      });
  }


};
