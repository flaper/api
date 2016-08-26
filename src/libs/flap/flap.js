import app from '../../server/server';
import {FlapMap} from './map';
import {FlapAPI} from './api';
import {ERRORS} from '../../common/utils/errors';

export class Flap {
  static * syncObject(flapId) {
    let FObject = app.models.FObject;
    let id = parseInt(flapId);
    if (!id) throw 'Wrong ID';

    let p1 = FlapAPI.getObject(id);
    let p2 = FObject.findOne({where: {'flap.id': id}});
    let [data, obj] = yield (Promise.all([p1, p2]));

    if (!obj) {
      if (!['opened', 'added'].includes(data.status)) throw ERRORS.badRequest('Cannot parse data');
      obj = new FObject();
      obj.flap = {id: id};
    }
    FlapMap.mapObject(obj, data);
    return yield (obj.save({skipTimestampCreated: true}));
  }
}
