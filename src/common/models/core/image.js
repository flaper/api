import {setCurrentUserId} from '../../behaviors/currentUser'
import {ImageService} from '../../services/ImageService.js'
import {applyIdToType} from '../../behaviors/idToType';
import {App} from '../../services/App';
import {ERRORS} from '../../utils/errors';

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
  applyIdToType(Image);
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

  function upload(type, req) {
    type = req.type;
    //if (!objectType || !objectId) {
    //  throw "objectType and objectId fields are required";
    //}
    if (ALLOWED_TYPES.indexOf(type) === -1) {
      throw ERRORS.badRequest(`Type "${type}" is not allowed`);
    }

    let file = req.file;
    if (!file) {
      throw ERRORS.badRequest("File is required");
    }

    //workaround as lwip inside cropImage was breaking loopback.getCurrentContext as Dec 2015
    let currentUserId = App.getCurrentUserId();

    // obtain an image object:
    return ImageService.makeImages(file)
      .then((buffers) => {
        return new Promise((resolve, reject) => {
          let image;
          //options for setCurrentUserId observer
          Image.create({type}, {currentUserId: currentUserId})
            .then((data) => {
              image = data;
              return ImageService.uploadToS3(data, buffers)

            })
            .then(s3Response => resolve(image), reject);
        })
      })
      .catch((error) => {
        let errorMessage = `Image object creation error: ${error}`;
        console.log(errorMessage);
        throw errorMessage;
      });
  }


};
