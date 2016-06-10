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

  SupportMessage.getDialog = getDialog;
  SupportMessage.postMessage = postMessage;

  SupportMessage.remoteMethod('getDialog', {
    http: {verb: 'get', path: '/:userId'},
    description: 'Get support dialog',
    accessType: 'READ',
    accepts: [
      {arg: 'userId', type: 'string', description: 'client userId', required: true}
    ],
    returns: {root: true}
  });

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

  function getDialog(dialog) {
    let userId = App.getCurrentUserId();
    return checkAccessToDialog(userId, dialog)
      .then(hasAccess => {
        if (!hasAccess) throw ERRORS.forbidden();
        return SupportMessage.find({where: {dialog: dialog}});
      })
  }

  function checkAccessToDialog(userId, dialog) {
    let id = userId.toString();
    return App.isSales(id)
      .then(isSales => {
        if (isSales) return true;
        if (dialog === id) {
          return hasPremiumSupport(id);
        }
        return false;
      });
  }

  function postMessage(toId, message) {
    let userId = App.getCurrentUserId();
    return checkAccessToSend(userId, toId)
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

  function checkAccessToSend(userId, toId) {
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
