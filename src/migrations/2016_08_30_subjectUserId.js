import app from '../server/server';
let Like = app.models.Like;
let IdToType = app.models.IdToType;
import co from 'co';

let main = co.wrap(function*() {
  // simple query to establish mongodb connection
  let total = yield (Like.count());
  console.log('total records', total);
  let collection = Like.dataSource.connector.collection('Like');
  let likes = yield (collection.find({subjectUserId: {$exists: false}}).toArray());
  console.log('total to do', likes.length);
  for (let i = 0; i < likes.length; i++) {
    let data = likes[i];
    let like = yield (Like.findByIdRequired(data._id));
    let idToType = yield (IdToType.findByIdRequired(like.subjectId));
    let subject = yield (idToType.findSubject());
    like.subjectUserId = subject.userId;
    yield (like.save());
    console.log(`processing ${i}`);
  }
  process.exit();
});
main();

