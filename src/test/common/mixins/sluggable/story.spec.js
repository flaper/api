import app from '../../../helpers/app';
let should = require('chai').should();
import STORIES from  '../../../fixtures/story';
import moment from 'moment-timezone';
import _ from 'lodash';

let Story = app.models.Story;
const STORY1 = STORIES.test1;

describe(`Sluggable/Story`, function () {
  //start of the slug
  const SLUG1 = 'для-теста-slug';
  const TITLE1 = 'Для теста slug';
  const NEW_DENIED_STORY = {
    id: '1a4000000000000000010001',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.DENIED
  };
  const NEW_ACTIVE_STORY1 = {
    id: '1a4000000000000000010002',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };
  const NEW_ACTIVE_STORY2 = {
    id: '1a4000000000000000010003',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY3 = {
    id: '1a4000000000000000010004',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY4 = {
    id: '1a4000000000000000010005',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY5 = {
    id: '1a4000000000000000010006',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY10 = {
    id: '1a4000000000000000010010',
    type: 'article',
    title: 'Идеи для   творчества.',
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  let models = [NEW_DENIED_STORY, NEW_ACTIVE_STORY1, NEW_ACTIVE_STORY2, NEW_ACTIVE_STORY3,
    NEW_ACTIVE_STORY4, NEW_ACTIVE_STORY5, NEW_ACTIVE_STORY10];
  let m = moment().tz('Europe/Moscow');
  let year = m.year();
  let month = (m.month() + 1).toString();
  month = month.length === 1 ? '0' + month : month;
  let date = m.date().toString();
  date = date.length === 1 ? '0' + date : date;

  before(function*() {
    let options = {skipIgnore: {status: true}};
    for (let model of models) {
      yield (Story.create(model, options));
    }
  });

  it('Denied slug', function* () {
    let story = yield (Story.findById(NEW_DENIED_STORY.id));
    //it is not required, just current logic - slug will be generated, although it will not influence others
    story.slugLowerCase.should.eq(SLUG1);
  });

  it('Active slug1', function* () {
    let story = yield (Story.findById(NEW_ACTIVE_STORY1.id));
    story.slugLowerCase.should.eq(SLUG1);
  });

  it('Active slug2', function*() {
    let story = yield (Story.findById(NEW_ACTIVE_STORY2.id));
    story.slugLowerCase.should.eq(`${SLUG1}-${year}`);
  });

  it('Active slug3', function* () {
    let story = yield (Story.findById(NEW_ACTIVE_STORY3.id));
    story.slugLowerCase.should.eq(`${SLUG1}-${year}-${month}`);
  });

  it('Active slug4', () => {
    return Story.findById(NEW_ACTIVE_STORY4.id)
      .then((story) => {
        story.slugLowerCase.should.eq(`${SLUG1}-${year}-${month}-${date}`);
      })
  });

  it('Active slug5', () => {
    return Story.findById(NEW_ACTIVE_STORY5.id)
      .then((story) => {
        story.slugLowerCase.should.eq(`${SLUG1}-${year}-${month}-${date}-2`);
      })
  });

  it('After active deleted', () => {
    return Story.actionActivate(NEW_DENIED_STORY.id)
      .then((story) => {
        story.status.should.eq(Story.STATUS.ACTIVE);
        story.slugLowerCase.should.eq(`${SLUG1}-${year}-${month}-${date}-3`);
      })
  });

  it('Active slug6', () => {
    return Story.findById(NEW_ACTIVE_STORY10.id)
      .then((story) => {
        story.slug.should.eq('Идеи-для-творчества');
      })
  });
  after(()=> Story.deleteAll({id: {inq: _.map(models, 'id')}}));
});
