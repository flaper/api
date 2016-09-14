import _ from 'lodash';

export function initSubscriptions(User) {
  User.disableRemoteMethod('__create__subscriptions', false);
  User.disableRemoteMethod('__link__subscriptions', false);
  User.disableRemoteMethod('__unlink__subscriptions', false);
  User.disableRemoteMethod('__exists__subscriptions', false);
  User.disableRemoteMethod('__destroyById__subscriptions', false);
  User.disableRemoteMethod('__findById__subscriptions', false);
  User.disableRemoteMethod('__updateById__subscriptions', false);
  User.disableRemoteMethod('__get__subscriptions', false);

  User.getSubscriptions = getSubscriptions;
  User.getSubscribers = getSubscribers;

  function getSubscriptions(id) {
    let Subscription = User.app.models['Subscription'];
    return User.findByIdRequired(id)
      .then((user) => Subscription.find({where: {userId: user.id}}));
  }

  function getSubscribers(id) {
    let Subscription = User.app.models['Subscription'];
    return User.findByIdRequired(id)
      .then((user) => Subscription.find({where: {targetId: user.id}}));
  }

  User.remoteMethod(
    'getSubscribers',
    {
      description: 'Get subscribers for a user',
      http: {path: '/:id/subscribers', verb: 'get'},
      accepts: [
        {arg: 'id', type: 'string', required: true},
      ],
      returns: {root: true}
    }
  );

  User.remoteMethod(
    'getSubscriptions',
    {
      description: 'Get subscriptions for a user',
      http: {path: '/:id/subscriptions', verb: 'get'},
      accepts: [
        {arg: 'id', type: 'string', required: true},
      ],
      returns: {root: true}
    }
  );
}
