import {ERRORS} from '../../utils/errors';
import {App} from '../../services/App';
import {FlaperMark} from '@flaper/markdown';
import {ignoreProperties, setProperty} from '../../behaviors/propertiesHelper'
import _ from 'lodash';

module.exports = (SupportMessage) => {
  SupportMessage.commonInit(SupportMessage);

  SupportMessage.STATUS = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };
  SupportMessage.STATUSES = _.values(SupportMessage.STATUS);

  SupportMessage.disableAllRemotesExcept(SupportMessage);

  SupportMessage.observe('before save', ignoreProperties({
    status: {newDefault: SupportMessage.STATUS.ACTIVE}
  }));

  SupportMessage.getDialogs = getDialogs;
  SupportMessage.getDialog = getDialog;
  SupportMessage.postMessage = postMessage;
  SupportMessage.removeMessage = removeMessage;

  SupportMessage.remoteMethod('getDialogs', {
    http: {verb: 'get', path: '/dialogs'},
    description: 'Get last dialogs',
    accessType: 'READ',
    returns: {root: true}
  });

  SupportMessage.remoteMethod('getDialog', {
    http: {verb: 'get', path: '/dialogs/:userId'},
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

  SupportMessage.remoteMethod('removeMessage', {
    http: {verb: 'delete', path: '/:id'},
    description: 'Remove message',
    accessType: 'WRITE',
    accepts: [
      {arg: 'id', type: 'string', description: 'Message id', required: true}
    ],
    returns: {root: true}
  });


  function getDialogs() {
    return new Promise((resolve, reject) => {
      var collection = SupportMessage.dataSource.connector.collection('SupportMessage');
      collection.aggregate(
        {$match: {status: 'active'}},
        {$sort: {created: -1}},
        {
          $group: {
            _id: {dialog: "$dialog"},
            last: {$first: "$$ROOT"},
            created: {$max: "$created"}
          }
        },
        {$sort: {created: -1}},
        function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data.map(row => row.last));
        });
    });
  }

  function getDialog(dialog) {
    let userId = App.getCurrentUserId();
    return checkAccessToDialog(userId, dialog)
      .then(hasAccess => {
        if (!hasAccess) throw ERRORS.forbidden();
        return SupportMessage.find({where: {dialog: dialog, status: 'active'}});
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
        supportMessage.messageHTML = FlaperMark.toHTML(message);
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

  function removeMessage(id) {
    let userId = App.getCurrentUserId().toString();
    let isSuper = false;
    return App.isSuper(userId)
      .then((value) => {
        isSuper = value;
        return SupportMessage.findByIdRequired(id)
      })
      .then(message => {
        if (isSuper || message.fromId.toString() === userId) {
          message.status = SupportMessage.STATUS.DELETED;
          return message.save({skipIgnore: {status: true}});
        }
        throw ERRORS.forbidden();
      })
  }
};
