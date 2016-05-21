import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
var yandexMoney = require("yandex-money-sdk");

module.exports = (Payment) => {
  Payment.commonInit(Payment);
  Payment.disableAllRemotesExcept(Payment);

  Payment.makePayment = makePayment;
  Payment.remoteMethod('makePayment', {
    http: {verb: 'post', path: '/'},
    description: 'Make Payment',
    accessType: 'EXECUTE',
    accepts: [],
    returns: {root: true}
  });

  function makePayment(ctx) {
    let userId = App.getCurrentUserId();
    return getInstanceId(userId);
  }

  function getInstanceId(userId) {
    let app = Payment.app;
    let UserExtra = app.models.UserExtra;
    return UserExtra.findOne({where: {userId}}).then((userExtra) => {
      if (userExtra && userExtra.ymInstanceId) {
        return userExtra.ymInstanceId;
      }
      let config = app.get('ym');
      let clientId = config.clientId;
      return new Promise((resolve, reject) => {
        yandexMoney.ExternalPayment.getInstanceId(clientId, (err, data) => {
          if (err) {
            return reject(err);
          }
          let instanceId = data.instance_id;
          UserExtra.updateValue(userId, 'ymInstanceId', instanceId);
          resolve(instanceId);
        });
      });
    })
  }
};
