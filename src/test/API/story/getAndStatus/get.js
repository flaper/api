import {api, user1, user1Promise, user2, user2Promise, adminPromise} from '../../../helpers/api';
import {updateTimeouts} from '../../timeout';
import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import {Sanitize} from '../../../../../src/libs/sanitize/Sanitize';

let Story = app.models.Story;
const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/@get`, function () {
  updateTimeouts(this);

  it('Anonymous - should return only denied stories', () => {
    return api.get(COLLECTION_URL)
      .query({filter: {where: {status: Story.STATUS.DENIED}}})
      .expect(200)
      .expect((res) => {
        let stories = res.body;
        stories.length.should.at.least(1);
        stories.forEach(story => story.status.should.eq(Story.STATUS.DENIED));
      })
  });

  it('Anonymous - should return denied and active stories', () => {
    return api.get(COLLECTION_URL)
      .query({filter: {where: {or: {0: {status: Story.STATUS.ACTIVE}, 1: {status: Story.STATUS.DENIED}}}}})
      .expect(200)
      .expect((res) => {
        let stories = res.body;
        stories.length.should.at.least(2);
        let activeFound = stories.find(story => story.status === Story.STATUS.ACTIVE);
        let deniedFound = stories.find(story => story.status === Story.STATUS.DENIED);
        should.exist(activeFound);
        should.exist(deniedFound);
        stories.forEach(story => {
          [Story.STATUS.DENIED, Story.STATUS.ACTIVE].should.include(story.status);
        });
      })
  });

  it('User - should not return deleted stories', () => {
    return user1Promise.then(({agent}) => {
      return agent.get(COLLECTION_URL)
        .query({filter: {where: {status: Story.STATUS.DELETED}}})
        .expect(200)
        .expect((res) => {
          let stories = res.body;
          stories.length.should.eq(0);
        })
    })
  });
});
