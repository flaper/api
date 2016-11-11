import {initGet} from "./get/get";
import {initCandidates} from "./candidates/candidates";
import {initStatusActions} from "./status/status";
import {applyIdToType} from '../../behaviors/idToType';
import {setCurrentUserId} from '../../behaviors/currentUser';
import {ignoreUpdatedIfNoChanges, ignoreProperties, setProperty} from '../../behaviors/propertiesHelper.js';
import {ERRORS} from '../../utils/errors';
import _ from "lodash";

module.exports = (Poll) => {
  Poll.commonInit(Poll);
  applyIdToType(Poll);
  Poll.disableAllRemotesExcept(Poll, ['find', 'findById', 'updateAttributes', 'count', 'exists', 'create']);


  Poll.STATUS = Poll.STATUSES = {
    ACTIVE: "active",
    DELETED: "deleted",
    DENIED: "denied",
    CLOSED: "closed"
  }
  Poll.TYPE = {
    POLL : "poll",
    QUESTION: "question",
    VOTING: "voting"
  }
  Poll.TYPES = _.values(Poll.TYPE);
  Poll.STATUSES = _.values(Poll.STATUS);

  Poll.observe('before save', ignoreUpdatedIfNoChanges(['title','answers']));
  Poll.observe('before save', setCurrentUserId);
  Poll.observe('before save', ignoreProperties({
    status: {newDefault: Poll.STATUS.ACTIVE},
    id: {},
    lastActive: {newDefault: (data) => data.created},
    commentsNumber: {newDefault: 0},
    responseNumber: {newDefault: 0},
    views: {newDefault: 0},
    // answers: {newDefault: []},
  }));
  Poll.observe('before save', typeObserver);
  Poll.observe('before save', answerObserver);

  initGet(Poll);
  initStatusActions(Poll);
  initCandidates(Poll);

  Poll.validatesInclusionOf('status', {in: Poll.STATUSES});
  function* answerObserver(ctx) {
    if (ctx.instance && ctx.instance.answers) {
      let answers = ctx.instance.answers;
      if (typeof answers !== "object") {
        throw ERRORS.badRequest(`Answers has wrong type: ${typeof answers}`)
      }
      switch (ctx.instance.type) {
        case 'question':
            if (answers.length !== 2) throw ERRORS.badRequest(`Question must have exactly 2 answers`);
          return;
        case 'poll':
            if (answers.length < 2) throw ERRORS.badRequest(`Poll must have at least 2 answers`);
          return;
        default:
          break;
      }
    }
  }
  function* typeObserver(ctx) {
    if (ctx.isNewInstance) {
      let type = ctx.instance.type;
      if (!Poll.TYPES.includes(type)) throw ERRORS.badRequest(`Wrong type "${type}" for Poll`);
      return;
    }
    if (ctx.instance) {
      delete ctx.instance.type;
    }
  }

}
