import {applyIdToType} from '../../behaviors/idToType';
import {App} from '../../services/App';
import {setCurrentUserId} from '../../behaviors/currentUser';
import {ignoreUpdatedIfNoChanges, ignoreProperties, setProperty} from '../../behaviors/propertiesHelper.js';
import {ERRORS} from '../../utils/errors';
import _ from "lodash";

module.exports = (Vote) => {
  Vote.commonInit(Vote);
  applyIdToType(Vote);
  Vote.disableAllRemotesExcept(Vote, []);

  Vote.observe('before save', setCurrentUserId);
  Vote.observe('before save', pollObserver);

  Vote.actionCreate = actionCreate;
  Vote.actionResults = actionResults;
  Vote.actionDelete = actionDelete;
  Vote.actionExists = actionExists;

  Vote.remoteMethod(
    'actionCreate',
    {
      description: `Vote for an option`,
      http: {path: '/:targetId', verb: 'post'},
      accepts: [
        {arg: 'targetId', type: 'string', required: true},
        {arg: 'answer', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );
  Vote.remoteMethod(
    'actionDelete',
    {
      description: `Delete vote for an option`,
      http: {path: '/:targetId', verb: 'delete'},
      accepts: [
        {arg: 'targetId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );
  Vote.remoteMethod(
    'actionExists',
    {
      description: `Check if you voted in a poll`,
      http: {path: '/:targetId/exists', verb: 'get'},
      accepts: [
        {arg: 'targetId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );
  Vote.remoteMethod(
    'actionResults',
    {
      description: `Vote for an option`,
      http: {path: '/:targetId/results', verb: 'get'},
      accepts: [
        {arg: 'targetId', type: 'string', required: true}
      ],
      returns: {root: true}
    }
  );
  function* actionCreate(targetId, answer) {
    let Poll = Vote.app.models.Poll;
    let user = yield App.getCurrentUser(),
        userId = user.id,
        poll = yield Poll.findByIdRequired(targetId),
        vote = yield Vote.findOne({where:{targetId,userId}});
    if(!poll) {
      throw ERRORS.notFound(`Poll does not exist`);
    }
    if (!poll.answers || !poll.answers.some(option => option ===  answer )) {
      throw ERRORS.notFound(`No such answer in this poll`);
    }
    if (user.storiesNumber < 5) {
      throw ERRORS.badRequest(`You can not vote unless you have 5 stories`);
    }
    return yield Vote.create({targetId,answer,userId});
  }
  function* actionDelete(targetId) {
    let Poll = Vote.app.models.Poll;
    let userId = App.getCurrentUserId(),
        vote = yield Vote.findOne({where:{targetId,userId}}),
        poll = yield Poll.findByIdRequired(targetId);
    if(!poll) {
      throw ERRORS.notFound(`Poll does not exist`);
    }
    if (!vote) {
      throw ERRORS.notFound(`You did not vote in this poll`);
    }
    return yield Vote.deleteAll({targetId,userId});
  }
  function* actionExists(targetId) {
    let userId = App.getCurrentUserId(),
        vote = yield Vote.findOne({where:{targetId,userId}});
    return vote ? yield {voted:true} : yield {voted:false};
  }
  function* actionResults(targetId) {
    let Poll = Vote.app.models.Poll;
    let results = yield Vote.find({where:{targetId}}),
        poll = yield Poll.findByIdRequired(targetId);
    if(!poll) {
      throw ERRORS.notFound(`Poll does not exist`);
    }
    let answers = poll.answers,
        output = {};
        answers.forEach(answer => output[answer] = results.filter(result => result.answer === answer)
        );
    return output;
  }

  function* pollObserver(ctx) {
    if (ctx && ctx.instance) {
      let Poll = Vote.app.models.Poll,
          poll = yield Poll.findByIdRequired(ctx.instance.targetId),
          now = new Date();
      let answer = ctx.instance.answer;
      if (!poll) throw ERRORS.notFound(`Poll does not exist`);
      if (poll.openDate > now) throw ERRORS.badRequest(`You can not vote on poll that has not started yet`);
      if (poll.closeDate < now) throw ERRORS.badRequest(`You can not vote on closed poll`);
      if (poll.status === Poll.STATUS.CLOSED) throw ERRORS.badRequest(`You can not vote on closed poll`);
      if (poll.answers.indexOf(answer) === -1) throw ERRORS.notFound(`No such option in this poll`);
    }
  }



}
