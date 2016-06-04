import {api, user1, user1Promise, user2, user2Promise, adminPromise, superPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';

let Account = app.models.Account;
let StoryBest = app.models.StoryBest;

let STORY1 = STORIES.test1;
let STORY2 = STORIES.test2;

const COLLECTION_URL = 'StoryBests';

describe(`${COLLECTION_URL}`, function () {
  updateTimeouts(this);
  let moneyBefore;
  before(() => Account.getAccountById(STORY1.userId)
    .then(data => moneyBefore = data)
  );

  let PLACE1 = {
    place: 1,
    id: STORY1.id
  };

  let PLACE2 = {
    place: 2,
    id: STORY2.id
  };

  it('Get current winners', () => {
    return api.get(COLLECTION_URL)
      .expect(200)
      .expect(res => {
        let bests = res.body;
        bests.length.should.eq(0);
      })
  });

  it('User - deny to add', () => {
    return user1Promise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(PLACE1)
        .expect(401)
    })
  });

  it('Admin - deny to add', () => {
    return adminPromise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(PLACE1)
        .expect(401)
    })
  });

  it('Super - deny to add with wrong id', () => {
    return superPromise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send({place: 1, id: '000000000000000000000001'})
        .expect(404)
    })
  });

  it('Super - deny to add with wrong place', () => {
    return superPromise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send({place: 5, id: STORY1.id})
        .expect(400)
    })
  });

  it('Super - add best story', () => {
    return superPromise.then(({agent}) => {
        return agent.post(COLLECTION_URL)
          .send(PLACE1)
          .expect(200)
          .expect(res => {
            let data = res.body;
            PLACE1.id.should.eq(data.id);
          })
      })
      .then(() => Account.getAccountById(STORY1.userId))
      .then(amount => {
        amount.should.eq(moneyBefore + StoryBest.PRIZES[1])
      })
      .then(() => {
        return api.get(COLLECTION_URL)
          .expect(200)
          .expect(res => {
            let bests = res.body;
            bests.length.should.eq(1);
          })
      })
  });

  it('Super - cannot add same place twice', () => {
    return superPromise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send({id: STORY2.id, place: 1})
        .expect(400)
    })
  });

  it('Super - add second place', () => {
    return superPromise.then(({agent}) => {
      return agent.post(COLLECTION_URL)
        .send(PLACE2)
        .expect(200)
        .expect(res => {
          let data = res.body;
          PLACE2.id.should.eq(data.id);
        })
    })
  });

  it('Previous winners - 0 weeks ago', () => {
    return api.get(`${COLLECTION_URL}/0`)
      .expect(200)
      .expect(res => {
        let bests = res.body;
        bests.length.should.eq(2);
      })
  });

  it('Previous winners - 1 weeks ago', () => {
    return api.get(`${COLLECTION_URL}/1`)
      .expect(200)
      .expect(res => {
        let bests = res.body;
        bests.length.should.eq(0);
      })
  });

  after(()=> StoryBest.deleteAll());
});
