import {ERRORS} from '../../../utils/errors';
import {App} from '../../../services/App';
import moment from 'moment';

module.exports = (StoryBest) => {
  StoryBest.commonInit(StoryBest);
  StoryBest.disableAllRemotesExcept(StoryBest);

  StoryBest.PRIZES = {
    1: 100,
    2: 70,
    3: 50,
    4: 30
  };


  StoryBest.currentWinners = currentWinners;
  StoryBest.addBestStory = addBestStory;

  StoryBest.remoteMethod('currentWinners', {
    http: {verb: 'get', path: '/'},
    description: 'Get current winners',
    accessType: 'READ',
    returns: {root: true}
  });

  StoryBest.remoteMethod('addBestStory', {
    http: {verb: 'post', path: '/'},
    description: 'Add best story',
    accessType: 'WRITE',
    accepts: [
      {arg: 'id', type: 'string', description: 'ID', required: true},
      {arg: 'place', type: 'number', description: 'Place', required: true}
    ],
    returns: {root: true}
  });

  function currentWinners() {
    let day = lastWeekId();
    return StoryBest.find({where: {week: day}, order: "place ASC"});
  }

  function addBestStory(id, place) {
    if ([1, 2, 3, 4].indexOf(place) === -1) {
      throw ERRORS.badRequest('Place should be from 1 to 4');
    }
    let day = lastWeekId();
    let data = {id: id, week: day, place: place};
    let MODELS = StoryBest.app.models;
    let Story = MODELS.Story;
    let Account = MODELS.Account;
    let Transaction = MODELS.Transaction;

    //2 weeks period
    let periodStart = moment.utc().startOf('week').subtract(14, 'days').toDate();
    let periodEnd = moment.utc().startOf('week').toDate();
    let story = null;
    let res = null;
    return Story.findByIdRequired(id)
      .then((data) => {
        story = data;
        if (!App.isTestEnv() && (story.created < periodStart || story.created >= periodEnd)) {
          throw ERRORS.badRequest("Story doesn't fit to 2 weeks period")
        }
        return StoryBest.findOne({where: {week: day, place: place}})
      })
      .then((best) => {
        if (best) throw ERRORS.badRequest('Place already taken');
        return StoryBest.create(data);
      })
      .then(data => {
        res = data;
        let fromId = Account.ACCOUNTS.FUND_BEST;
        let toId = story.userId;
        let amount = StoryBest.PRIZES[place];
        let type = Transaction.TYPE.BEST_STORY;
        return Account.internalPayment({fromId, toId, amount, type});
      })
      .then(() => res)
  }

  function lastWeekId() {
    let m = moment.utc().startOf('week').subtract(7, 'days');
    return m.format('YYYY-MM-DD');
  }

};
