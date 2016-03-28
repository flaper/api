import {ERRORS} from '../../../utils/errors';
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


  StoryBest.addBestStory = addBestStory;

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

  function addBestStory(id, place) {
    if ([1, 2, 3, 4].indexOf(place) === -1) {
      throw ERRORS.badRequest('Place should be from 1 to 4');
    }
    let m = moment.utc().startOf('week').subtract(7, 'days');
    let day = m.format('YYYY MM DD');
    let data = {id: id, week: day, place: place};
    let MODELS = StoryBest.app.models;
    let Story = MODELS.Story;
    let Account = MODELS.Account;
    let Transaction = MODELS.Transaction;

    let story = null;
    let res = null;
    return Story.findByIdRequired(id)
      .then((data) => {
        story = data;
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
};
