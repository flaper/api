import {user1Promise, user1, user2, user2Promise, adminPromise} from '../../../helpers/api';
import app from '../../../../server/server';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import moment from 'moment-timezone';

let Story = app.models.Story;
const STORY1 = STORIES.test1;

describe(`Sluggable/Story`, function () {
  //start of the slug
  let slug1 = 'для-теста-slug';
  const NEW_DENIED_STORY = {
    id: '1a4000000000000000010001',
    title: "Для теста slug",
    content: STORY1.content,
    status: Story.STATUS.DENIED
  };
  const NEW_ACTIVE_STORY1 = {
    id: '1a4000000000000000010002',
    title: "Для теста slug",
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };
  const NEW_ACTIVE_STORY2 = {
    id: '1a4000000000000000010003',
    title: "Для теста slug",
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY3 = {
    id: '1a4000000000000000010004',
    title: "Для теста slug",
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY4 = {
    id: '1a4000000000000000010005',
    title: "Для теста slug",
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY5 = {
    id: '1a4000000000000000010006',
    title: "Для теста slug",
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  let ids = [NEW_DENIED_STORY.id, NEW_ACTIVE_STORY1.id, NEW_ACTIVE_STORY2.id, NEW_ACTIVE_STORY3.id,
    NEW_ACTIVE_STORY4.id, NEW_ACTIVE_STORY5.id];
  let m = moment().tz('Europe/Moscow');
  let year = m.year();
  let month = m.month() + 1;
  let date = m.date();

  before(() => {
    return Story.create(NEW_DENIED_STORY)
      .then(() => Story.create(NEW_ACTIVE_STORY1))
      .then(() => Story.create(NEW_ACTIVE_STORY2))
      .then(() => Story.create(NEW_ACTIVE_STORY3))
      .then(() => Story.create(NEW_ACTIVE_STORY4))
      .then(() => Story.create(NEW_ACTIVE_STORY5))
  });

  it('Delete slug', () => {
    return Story.findById(NEW_DENIED_STORY.id)
      .then((story) => {
        //it is not required, just current logic - slug will be generated, although it will not influence others
        story.slugLowerCase.should.eq(slug1);
      })
  });

  it('Active slug1', () => {
    return Story.findById(NEW_ACTIVE_STORY1.id)
      .then((story) => {
        story.slugLowerCase.should.eq(slug1);
      })
  });

  it('Active slug2', () => {
    return Story.findById(NEW_ACTIVE_STORY2.id)
      .then((story) => {
        story.slugLowerCase.should.eq(`${slug1}-${year}`);
      })
  });

  it('Active slug3', () => {
    return Story.findById(NEW_ACTIVE_STORY3.id)
      .then((story) => {
        story.slugLowerCase.should.eq(`${slug1}-${year}-${month}`);
      })
  });

  it('Active slug4', () => {
    return Story.findById(NEW_ACTIVE_STORY4.id)
      .then((story) => {
        story.slugLowerCase.should.eq(`${slug1}-${year}-${month}-${date}`);
      })
  });

  it('Active slug5', () => {
    return Story.findById(NEW_ACTIVE_STORY5.id)
      .then((story) => {
        story.slugLowerCase.should.eq(`${slug1}-${year}-${month}-${date}-2`);
      })
  });

  it('After active deleted', () => {
    return Story.actionActivate(NEW_DENIED_STORY.id)
      .then((story) => {
        story.status.should.eq(Story.STATUS.ACTIVE);
        story.slugLowerCase.should.eq(`${slug1}-${year}-${month}-${date}-3`);
      })
  });
  after(()=> Story.deleteAll({id: {inq: ids}}));
});
