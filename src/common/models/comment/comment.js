import {setCurrentUserId} from '../../behaviors/currentUser'
import {Sanitize} from '../../../libs/sanitize/Sanitize';
import {ERRORS} from '../../utils/errors';
import _ from 'lodash';

module.exports = (Comment) => {
  Comment.commonInit(Comment);

  Comment.STATUS = {
    ACTIVE: 'active',
    DELETED: 'deleted'
  };
  Comment.STATUSES = _.values(Comment.STATUS);

  Comment.validatesInclusionOf('status', {in: Comment.STATUSES});

  Comment.findByIdRequired = (id) => {
    return Comment.findById(id)
      .then((story) => {
        if (!story) {
          throw ERRORS.notFound(`Story with id ${id} not found`);
        }
        return story;
      });
  };

  Comment.disableRemoteMethod('deleteById', true);

  Comment.disableRemoteMethod('__get__user', false);
  Comment.observe('before save', setCurrentUserId);
  Comment.observe('before save', Sanitize.observer('content', Sanitize.text));

};
