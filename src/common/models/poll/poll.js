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
  Poll.RESTRICTIONS = {
    TITLE_LENGTH : {
      MIN : 10,
      MAX : 128
    },
    STORIES_TO_CANDIDATE: {
      MIN:10
    },
    STORIES_TO_VOTE: {
      MIN:5
    },
    LEVEL_TO_VOTE: {
      MIN:1
    },
    ANSWERS: {
      POLL: {
        MIN:2,
        MAX:15
      }
    }
  }

  Poll.STATUS = {
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
  Poll.observe('before save', titleObserver);
  Poll.observe('before save', dateObserver);
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
            if (answers.length !== Poll.RESTRICTIONS.ANSWERS.POLL.MIN)
            throw ERRORS.badRequest(`Question must have exactly ${Poll.RESTRICTIONS.ANSWERS.POLL.MIN} answers`);
          return;
        case 'poll':
            if (answers.length < Poll.RESTRICTIONS.ANSWERS.POLL.MIN)
            throw ERRORS.badRequest(`Poll must have at least ${Poll.RESTRICTIONS.ANSWERS.POLL.MIN} answers`);
          return;
        default:
          break;
      }
    }
  }
  function* titleObserver(ctx) {
    if (ctx.instance && ctx.instance.title) {
      let title = ctx.instance.title;
      if (title.replace(" ","").length < Poll.RESTRICTIONS.TITLE_LENGTH.MIN) {
          throw ERRORS.badRequest(
            `Title is too short (min ${Poll.RESTRICTIONS.TITLE_LENGTH.MIN} characters)`
        );
      }
      if (title.replace(" ","").length > Poll.RESTRICTIONS.TITLE_LENGTH.MAX) {
          throw ERRORS.badRequest(
            `Title is too long (max ${Poll.RESTRICTIONS.TITLE_LENGTH.MAX} characters)`
          );
      }
    }
  }
  function* dateObserver(ctx) {
    if (ctx.instance && ctx.instance.openDate && ctx.instance.closeDate) {
      let openDate = ctx.instance.openDate,
          closeDate = ctx.instance.closeDate;
      if (openDate >= closeDate) {
        throw ERRORS.badRequest(`Close date must be after the open date`);
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
