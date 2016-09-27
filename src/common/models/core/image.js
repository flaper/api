import {setCurrentUserId} from '../../behaviors/currentUser'
import {ImageService} from '../../services/ImageService.js'
import {applyIdToType} from '../../behaviors/idToType';
import {App} from '../../services/App';
import {ERRORS} from '../../utils/errors';
import co from 'co';
import _ from 'lodash';
const ObjectID = require('mongodb').ObjectID;

module.exports = (Image) => {
  Image.commonInit(Image);
  applyIdToType(Image);
  Image.disableAllRemotesExcept(Image, ['find', 'findById', 'count', 'exists']);
  Image.disableRemoteMethod('__get__object', false);
  Image.disableRemoteMethod('__get__user', false);

  Image.observe('before save', setCurrentUserId);

  Image.TYPE = {
    CREATE_STORY: 'StoryCreate',
    STORY: 'Story'
  };
  Image.TYPES = _.values(Image.TYPE);

  // create-story type deprecated and should be removed in favor of StoryCreate
  const UPLOAD_ALLOWED_TYPES = [Image.TYPE.CREATE_STORY, 'create-story'];

  Image.upload = upload;
  Image.updateObject = updateObject;
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
    if (!UPLOAD_ALLOWED_TYPES.includes(type)) {
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

  function updateObject({ids, objectId, type }) {
    ids = _.uniq(ids);
    return co.wrap(function *() {
      if (!ids.length) return;
      let mongoIds = ids.map(id=>new ObjectID(id));
      let collection = Image.dataSource.connector.collection('Image');
      yield (collection.update({_id: {$in: mongoIds}, objectId: {$exists: false}}, {
        $set: {
          objectId,
          type
        }
      }));
    })();
  }


};
