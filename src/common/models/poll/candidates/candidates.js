import {App} from '../../../services/App';
import {objectHasDeepKey} from '../../../utils/object';
import {ERRORS} from '../../../utils/errors'
import _ from 'lodash';

export function initCandidates(Poll) {
  Poll.disableRemoteMethod('find', true);
  Poll.disableRemoteMethod('count', true);

  Poll.commonDisableRemoteScope(Poll, 'scopePublic');
  Poll.commonDisableRemoteScope(Poll, 'scopeActive');

  Poll.createCandidate = createCandidate;
  Poll.removeCandidate = removeCandidate;

  Poll.remoteMethod(
    'createCandidate',
    {
      http: {path: '/:targetId/candidate', verb: 'post'},
      description: `Добавляет пользователя в список кандидатов`,
      accessType: 'WRITE',
      accepts: {
        arg: 'targetId',
        type: 'string',
        description: 'poll id'
      },
      returns: {root: true}
    }
  );

  Poll.remoteMethod(
    'removeCandidate',
    {
    http: {path: '/:targetId/candidate', verb: 'delete'},
    description: 'Удаляет пользователя из списка кандидатов',
    accessType: 'WRITE',
    accepts: {arg: 'targetId', type: 'string', description: 'poll id'},
    returns: {root: true}
  });

  function* createCandidate(targetId) {
    let poll = yield Poll.findByIdRequired(targetId),
        user = yield App.getCurrentUser(),
        now = new Date();
    if (!poll) throw ERRORS.notFound(`Poll does not exist`);
    if (!poll.answers) poll.answers = [];
    if (poll.answers.includes(user.id.toString())) throw ERRORS.badRequest(`Candidate already registered`);
    if (poll.status !== Poll.STATUS.ACTIVE) throw ERRORS.badRequest(`You can not be added to inactive poll`);
    if (poll.closeDate < now) throw ERRORS.badRequest(`You can not be added to closed Poll`);
    if (user.level < Poll.RESTRICTIONS.LEVEL.CREATE.CANDIDATE)
      throw ERRORS.badRequest(
        `You need at least ${Poll.RESTRICTIONS.LEVEL.CREATE.CANDIDATE} level to join as candidate`
      );
    if (user.id === undefined) throw ERRORS.badRequest(`Can not add undefined as option`);
    poll.answers.push(user.id);
    yield poll.save({});
    return poll;
  }

  function* removeCandidate(targetId) {
    let poll = yield Poll.findByIdRequired(targetId),
        userId = App.getCurrentUserId();
    if (!poll) throw ERRORS.notFound(`Poll does not exist`);
    if (!poll.answers) poll.answers = [];
    if (poll.answers.includes(userId)) throw ERRORS.notFound(`Candidate not registered`);
    poll.answers = poll.answers.filter(val => val !== userId);
    yield poll.save();
    return poll;
  }
}
