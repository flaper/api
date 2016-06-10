import {ERRORS} from '../../utils/errors';
import {App} from '../../services/App';
import _ from 'lodash';

module.exports = (SupportMessage) => {
  SupportMessage.commonInit(SupportMessage);

  SupportMessage.STATUS = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };
  SupportMessage.STATUSES = _.values(SupportMessage.STATUS);

  SupportMessage.disableAllRemotesExcept(SupportMessage);

  SupportMessage.postMessage = postMessage;
  SupportMessage.remoteMethod('postMessage', {
    http: {verb: 'post', path: '/'},
    description: 'Sent message',
    accessType: 'WRITE',
    accepts: [
      {arg: 'toId', type: 'string', description: 'toID', required: true},
      {arg: 'message', type: 'string', description: 'message', required: true}
    ],
    returns: {root: true}
  });

  function postMessage(toId, message) {
    let userId = App.getCurrentUserId();
    return checkAccess(userId, toId)
      .then(hasAccess => {
        if (!hasAccess) throw ERRORS.forbidden();
        //client sends message to toId = 0 and dialog equal to clientId
        let dialog = toId === '0' ? userId : toId;
        let supportMessage = new SupportMessage();
        supportMessage.dialog = dialog;
        supportMessage.fromId = userId;
        supportMessage.toId = toId;
        supportMessage.message = message;
        return supportMessage.save();
      })
  }

  function checkAccess(userId, toId) {
    return App.isSales(userId)
      .then(isSales => {
        if (isSales) return true;
        if (toId === '0') {
          return hasPremiumSupport(userId);
        }
        return false;
      });
  }

  function hasPremiumSupport(userId) {
    let User = SupportMessage.app.models.User;
    return User.getExtra(userId)
      .then(extra => {
        return extra.premiumSupport && extra.premiumSupport > new Date();
      })
  }
};
