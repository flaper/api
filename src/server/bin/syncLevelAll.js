import app from '../../server/server';
import co from 'co';

const User = app.models.user;

let main = co.wrap(function*() {
  // simple query to establish mongodb connection
  yield (User.count());

  let collection = User.dataSource.connector.collection('user');
  let users = yield collection.find().toArray();
  console.log('total', users.length);
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
main().then((res, err)=> {
  console.log('err', err);
});
