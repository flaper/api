import app from '../../server/server';
import {FlapMap} from './map';
import {FlapAPI} from './api';
import {ERRORS} from '../../common/utils/errors';

export class Flap {
  static * syncObject(flapId) {
    let FObject = app.models.FObject;
    let id = parseInt(flapId);
    if (!id) throw 'Wrong ID';

    let data = yield (FlapAPI.getObject(id));
    let obj = yield (FObject.findOne({where: {'flap.id': id}}));

    if (!obj) {
      if (!['opened', 'added'].includes(data.status)) throw ERRORS.badRequest('Cannot parse data');
      obj = new FObject();
      obj.flap = {id: id};
    }
    FlapMap.mapObject(obj, data);
    return yield (obj.save({skipTimestampCreated: true}));
  }
}
