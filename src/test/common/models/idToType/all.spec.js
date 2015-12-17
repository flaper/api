import {user1} from '../../../helpers/api';
import app from '../../../../server/server';
let should = require('chai').should();
let IdToType = app.models.IdToType;
let Story = app.models.Story;
import STORIES from  '../../../fixtures/story';
import COMMENTS from  '../../../fixtures/comment';
let STORY1 = STORIES.test1;
let COMMENT1 = COMMENTS.comment1;

describe('IdToType', function () {
  it('Story should have idToType', () => {
    return IdToType.findByIdRequired(STORY1.id);
  });

  it('User should have idToType', () => {
    return IdToType.findByIdRequired(user1.id);
  });

  it('Comment should have idToType', () => {
    return IdToType.findByIdRequired(COMMENT1.id);
  });
});
