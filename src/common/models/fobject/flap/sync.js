import {Flap} from '../../../../libs/flap/flap';

export function initFlapSync(FObject) {
  FObject.flapSync = flapSync;

  FObject.remoteMethod('flapSync', {
    http: {verb: 'post', path: '/flapSync'},
    description: 'Create or sync object based on flap id',
    accessType: 'EXECUTE',
    accepts: {arg: 'id', type: 'number', description: 'Flap Object ID'},
    returns: {root: true}
  });

  function flapSync(id) {
    return Flap.syncObject(id)
  }
}
