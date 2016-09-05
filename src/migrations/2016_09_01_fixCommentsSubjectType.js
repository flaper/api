import app from '../server/server';
let idToType = app.models.IdToType;
let Comment = app.models.Comment;
import co from 'co';

let main = co.wrap(function*() {
  // simple query to establish mongodb connection
  let total = yield (Comment.count());
  console.log('total records', total);
  let collection = Comment.dataSource.connector.collection('Comment');
  let comments = yield (collection.find().toArray());
  console.log('total to do', comments.length);
  for (let c of comments) {
    let comment = yield (Comment.findByIdRequired(c._id));
    let ITT = yield (idToType.findByIdRequired(c.subjectId));
    let subjectType = ITT.type;
    comment.subjectType = subjectType;
    yield (comment.save({skipIgnore: {subjectType: true}}));
  }
  process.exit();
});
main();
