import {initGet} from "./get/get";
import {initCandidates} from "./candidates/candidates";
import {initStatusActions} from "./status/status";
import {App} from '../../services/App';
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
    LENGTH: {
      TITLE: {
        MIN: 10,
        MAX: 128
      }
    },
    LEVEL : {
      CREATE : {
        PROPOSAL: 2,
        CANDIDATE: 4
      },
      VOTE :  {
        VOTING: 3,
        PROPOSAL: 2,
        POLL: 0
      }
    },
    STORIES: {
      CREATE : {
        CANDIDATE : 10
      },
      VOTE : {
        VOTING: 5,
        PROPOSAL: 5,
        POLL: 5
      }
    },
    ANSWERS: {
      CREATE: {
        POLL : 2,
        PROPOSAL: 1,
        VOTING: 0
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
    PROPOSAL: "proposal",
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
  Poll.observe('before save', permissionObserver);
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
        case 'proposal':
            if (answers.length !== Poll.RESTRICTIONS.ANSWERS.CREATE.PROPOSAL)
            throw ERRORS.badRequest(`Proposal must have exactly ${Poll.RESTRICTIONS.ANSWERS.CREATE.PROPOSAL} answers`);
          return;
        case 'poll':
            if (answers.length < Poll.RESTRICTIONS.ANSWERS.CREATE.POLL)
            throw ERRORS.badRequest(`Poll must have at least ${Poll.RESTRICTIONS.ANSWERS.CREATE.POLL} answers`);
          return;
        default:
          break;
      }
    }
  }
  function* titleObserver(ctx) {
    if (ctx.instance && ctx.instance.title) {
      let title = ctx.instance.title;
      if (title.replace(" ","").length < Poll.RESTRICTIONS.LENGTH.TITLE.MIN) {
          throw ERRORS.badRequest(
            `Title is too short (min ${Poll.RESTRICTIONS.LENGTH.TITLE.MIN} characters)`
        );
      }
      if (title.replace(" ","").length > Poll.RESTRICTIONS.LENGTH.TITLE.MAX) {
          throw ERRORS.badRequest(
            `Title is too long (max ${Poll.RESTRICTIONS.LENGTH.TITLE.MAX} characters)`
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
  function* permissionObserver(ctx) {
    let user = App.getCurrentUser();
    let isAdmin = yield App.isAdmin();
    if (ctx.isNewInstance) {
      let poll = ctx.instance;
      switch (poll.type) {
        case 'poll':
          break;
        case 'proposal':
          if (user.level < 2)
            throw ERRORS.forbidden(
              `You need to be at least level ${Poll.RESTRICTIONS.LEVEL.CREATE.PROPOSAL}`
            );
          break;
        case 'voting':
            // if (!isAdmin)
            //   throw ERRORS.forbidden(`Only administrator is able to create voting`);
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
