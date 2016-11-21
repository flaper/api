import app from '../../server/server';
import co from 'co';

const User = app.models.user;

let main = co.wrap(function*() {
  let total = 0;
  let bunch = 0;
  do {
    let users = yield User.find({offset: total});
    console.log('next group', users.length);
    bunch = users.length;
    total += users.length;
    let i = 0;
    for (let user of users) {
      let level = yield User.calcLevel({userId: user.id});
      i++;
      if (user.level != level) {
        console.log(`for user ${user.id} set level ${level}`);
        user.level = level;
        try {
          yield user.save();
        }
        catch (e) {
          console.log('exception', e);
        }
      }

    }
  } while (bunch > 0);
  process.exit();
});
main().then((res, err)=> {
  console.log('err', err);
});
