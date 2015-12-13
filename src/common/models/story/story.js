import {setCurrentUserId} from '../../behaviors/currentUser'

module.exports = (Story) => {
  Story.STATUSES = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };

  Story.disableRemoteMethod('createChangeStream', true);
  Story.disableRemoteMethod('upsert', true);
  Story.disableRemoteMethod('updateAll', true);
  Story.disableRemoteMethod('deleteById', true);

  Story.disableRemoteMethod('__get__user', false);
  Story.observe('before save', setCurrentUserId);
};
