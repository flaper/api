import app from '../../server/server';
import {FlapMap} from './map';
import {FlapAPI} from './api';
import {ERRORS} from '../../common/utils/errors';


export class Flap {
  static syncObject(flapId) {
    let FObject = app.models.FObject;
    let id = parseInt(flapId);
    if (!id) {
      return Promise.reject('Wrong ID');
    }

    let data = [];
    let obj = null;
    let p1 = FlapAPI.getObject(id)
      .then(res => data = res);
    let p2 = FObject.findOne({where: {'flap.id': id}})
      .then(res => obj = res);

    return Promise.all([p1, p2])
      .then(() => {
        if (!obj) {
          if (['opened', 'added'].indexOf(data.status) === -1) {
            return Promise.reject(ERRORS.badRequest('Cannot parse data'));
          }
          obj = new app.models.FObject();
          obj.flap = {id: id};
        }
        return FlapMap.mapObject(obj, data);
      })
      .then(() => obj.save({skipTimestampCreated: true}))
  }
}
