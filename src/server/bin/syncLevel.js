import app from '../../server/server';
import co from 'co';
import _ from 'lodash';
const ObjectId = require('mongodb').ObjectId;

const User = app.models.user;
const {Story} = app.models;

co(function*() {
  // simple query to establish mongodb connection
  yield (User.count());

  let monthAgo = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
  let monthAgoLeft = new Date(new Date() - 31.1 * 24 * 60 * 60 * 1000); // 31.1 - один день раньше плюс запас в 0.1 дня
  let storyCollection = Story.dataSource.connector.collection('Story');
  let stories = yield storyCollection.find({created: {$gt: monthAgoLeft, $lt: monthAgo}}).toArray();
  console.log('stories', stories.length);
  let userIds = _.uniq(stories.map(s=>s.userId.toString()));
  userIds = userIds.map(id=> new ObjectId(id));
  console.log('users', userIds.length);

  let collection = User.dataSource.connector.collection('user');
  let users = yield collection.find({_id: {$in: userIds}}).toArray();
  console.log('found users', users.length);
  let i = 0;
  for (let u of users) {
    let level = yield User.calcLevel({userId: u._id});
    let currentLevel = +u.level;
    i++;
    if (currentLevel !== level) {
      let user = yield User.findByIdRequired(u._id);
      user.level = level;
      console.log(`for user ${user.id} set level ${level}`);
      try {
        yield user.save();
      }
      catch (e) {
        console.log('exception', e);
      }
    }
    if (i % 100 === 0)
      console.log(`${i} processed`);

  }
  process.exit();
});
