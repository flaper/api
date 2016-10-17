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
    id: '1a4000000000000000020001',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.DENIED
  };
  const NEW_ACTIVE_STORY1 = {
    id: '1a4000000000000000020002',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };
  const NEW_ACTIVE_STORY2 = {
    id: '1a4000000000000000020003',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY3 = {
    id: '1a4000000000000000020004',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY4 = {
    id: '1a4000000000000000020005',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY5 = {
    id: '1a4000000000000000020006',
    type: 'article',
    title: TITLE1,
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const NEW_ACTIVE_STORY10 = {
    id: '1a4000000000000000020010',
    type: 'article',
    title: 'Идеи для   творчества.',
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const START_WITH_TILDA = {
    id: '1a7000000000000000020011',
    type: 'article',
    title: '  -хорошее--имя--',
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const START_WITH_TILDA2 = {
    id: '1a7000000000000000020012',
    type: 'article',
    title: '--',
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const SHORT_SLUG = {
    id: '1a7000000000000000020013',
    type: 'article',
    title: 'ab',
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  const TITLE_EQ_ID = {
    id: '1a7000000000000000020014',
    type: 'article',
    title: '568223c429f1cff2027d8d4e',
    content: STORY1.content,
    status: Story.STATUS.ACTIVE
  };

  let models = [NEW_DENIED_STORY, NEW_ACTIVE_STORY1, NEW_ACTIVE_STORY2, NEW_ACTIVE_STORY3, NEW_ACTIVE_STORY4,
    NEW_ACTIVE_STORY5, NEW_ACTIVE_STORY10, START_WITH_TILDA, START_WITH_TILDA2, SHORT_SLUG, TITLE_EQ_ID];
  let m = moment().tz('Europe/Moscow');
  let year = m.year();
  let month = (m.month() + 1).toString();
  month = month.length === 1 ? '0' + month : month;
  let date = m.date().toString();
  date = date.length === 1 ? '0' + date : date;
  const YEAR = (new Date()).getFullYear();

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

  it('Active slug4', function* () {
    let story = yield (Story.findById(NEW_ACTIVE_STORY4.id));
    story.slugLowerCase.should.eq(`${SLUG1}-${year}-${month}-${date}`);
  });

  it('Active slug5', function*() {
    let story = yield (Story.findById(NEW_ACTIVE_STORY5.id));
    story.slugLowerCase.should.eq(`${SLUG1}-${year}-${month}-${date}-2`);
  });

  it('After active deleted', function*() {
    let story = yield (Story.actionActivate(NEW_DENIED_STORY.id));
    story.status.should.eq(Story.STATUS.ACTIVE);
    story.slugLowerCase.should.eq(`${SLUG1}-${year}-${month}-${date}-3`);
  });

  it('Active slug6', function*() {
    let story = yield (Story.findById(NEW_ACTIVE_STORY10.id));
    story.slug.should.eq('Идеи-для-творчества');
  });

  it('Start with tilda', function*() {
    let obj = yield (Story.findById(START_WITH_TILDA.id));
    obj.slugLowerCase.should.eq(`хорошее-имя`);
  });

  it('Only tilda', function*() {
    let obj = yield (Story.findById(START_WITH_TILDA2.id));
    obj.slugLowerCase.should.include(YEAR);
  });

  it('Short slug', function*() {
    let obj = yield (Story.findById(SHORT_SLUG.id));
    obj.slugLowerCase.should.include(`${SHORT_SLUG.title}-${YEAR}`);
  });

  it('Title equal ObjectId', function*() {
    let obj = yield (Story.findById(TITLE_EQ_ID.id));
    obj.slugLowerCase.should.include(`${TITLE_EQ_ID.title}-${YEAR}`);
  });

  after(()=> Story.deleteAll({id: {inq: _.map(models, 'id')}}));
});
