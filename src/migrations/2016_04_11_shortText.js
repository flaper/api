import app from '../server/server';
import {Sanitize} from '@flaper/markdown'
let Story = app.models.Story;
// simple query to establish mongodb connection
Story.count().then((total) => {
  console.log('total records', total);
  let collection = Story.dataSource.connector.collection('Story');
  collection.find({shortText: {$exists: false}}).toArray((err, stories) => {
    console.log('total to do', stories.length);
    let promise = (data) => {
      console.log('id' , data._id);
      return Story.findByIdRequired(data._id)
        .then(story => {
          console.log('story found');
          story.shortText = Sanitize.text(story.shortInline);
          return story.save({skipIgnore: {shortText: true}});
        })
    };
    let promises = stories.map(promise);
    Promise.all(promises)
      .then(() => {
        process.exit();
      })
  })
});

