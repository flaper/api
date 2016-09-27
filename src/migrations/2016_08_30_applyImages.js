import app from '../server/server';
import {FlaperMark} from '@flaper/markdown';
let Story = app.models.Story;
import co from 'co';

let main = co.wrap(function*() {
  // simple query to establish mongodb connection
  let total = yield (Story.count());
  console.log('total records', total);
  let collection = Story.dataSource.connector.collection('Story');
  let stories = yield (collection.find({images: {$exists: false}}).toArray());
  console.log('total to do', stories.length);
  for (let s of stories) {
    let story = yield (Story.findByIdRequired(s._id));
    story.images = FlaperMark.getImages(story.content);
    yield (story.save({skipIgnore: {images: true}}));
  }
  process.exit();
});
main();

