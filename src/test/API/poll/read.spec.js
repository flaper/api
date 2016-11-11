import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import POLLS from  "../../fixtures/poll";
let should = require('chai').should();
let expect = require('chai').expect;
let Poll = app.models.Poll;
const COLLECTION_URL = "Polls";
const NEW_POLL = {
  type: Poll.TYPE.POLL,
  id: "1a4000000000000000020061",
  answers: [
    {text:"ответ 1"},
    {text:"ответ 1"},
  ]
};
describe(`/${COLLECTION_URL}`, function() {
  updateTimeouts(this);

  describe('READ', () => {
    it('Anonymous should be able to get polls', function*(){
      let count = yield Poll.count({status:Poll.STATUS.ACTIVE});
      return api.get(COLLECTION_URL)
      .expect(200)
      .expect(res => {
        let data = res.body;
        return expect(data.length).to.be.equal(count);
      })
    });

    it('User should be able to get polls', function*() {
      let {agent} = yield user1Promise;
      let count = yield Poll.count({status:Poll.STATUS.ACTIVE});
      return agent.get(COLLECTION_URL)
      .expect(200)
      .expect(res => {
        let data = res.body;
        return expect(data.length).to.be.equal(count);
      })
    })

    it('Should check for existance', function*() {
      let existentId = POLLS.pollActive.id,
          nonExistentId="randomid";
      yield api.get(`${COLLECTION_URL}/${existentId}/exists`)
      .expect(200)
      .expect(res => expect(res.body.exists).to.be.equal(true));
      yield api.get(`${COLLECTION_URL}/${nonExistentId}/exists`)
      .expect(200)
      .expect(res => expect(res.body.exists).to.be.equal(false));
    })
  })
})
