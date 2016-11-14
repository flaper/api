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
        userId = App.getCurrentUserId();
    if (!poll) throw ERRORS.notFound(`Poll does not exist`);
    if (!poll.answers) poll.answers = [];
    console.log(poll.answers.indexOf(userId));
    if (poll.answers.indexOf(userId) !== -1) throw ERRORS.badRequest(`Candidate already registered`)
    poll.answers.push(userId);
    yield poll.save({});
    return poll;
  }

  function* removeCandidate(targetId) {
    let poll = yield Poll.findByIdRequired(targetId),
        userId = App.getCurrentUserId();
    if (!poll) throw ERRORS.notFound(`Poll does not exist`);
    if (!poll.answers) poll.answers = [];
    if (poll.answers.indexOf(userId) === -1) throw ERRORS.notFound(`Candidate not registered`);
    poll.answers.filter(val => val !== userId);
    yield poll.save();
    return poll;
  }
}
