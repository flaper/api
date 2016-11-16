import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../fixtures/story';

let {Story} = app.models;

const COLLECTION_URL = 'stories';

describe(`/${COLLECTION_URL}/@flagCp`, function () {
  updateTimeouts(this);

  it('stories', function *() {
    let story = yield Story.findById(STORIES.test1.id);
    should.not.exist(story.cpFlap);
    story = yield Story.findById(STORIES.test2.id);
    should.not.exist(story.cpFlap);
    story = yield Story.findById(STORIES.test3.id);
    should.not.exist(story.cpFlap);
  });

  it('когда объект кино', function *() {
    let story = yield Story.findById(STORIES.review1.id);
    true.should.eq(story.flagCp);
  });

  it('когда текст подозрительный', function* () {
    let story = yield Story.findById(STORIES.story_flag_cp.id);
    true.should.eq(story.flagCp);
  })
});
