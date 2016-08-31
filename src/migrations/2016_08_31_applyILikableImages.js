import app from '../server/server';
let idToType = app.models.IdToType;
let Image = app.models.Image;
import co from 'co';

let main = co.wrap(function*() {
  // simple query to establish mongodb connection
  let total = yield (Image.count());
  console.log('total records', total);
  let collection = Image.dataSource.connector.collection('Image');
  let images = yield (collection.find().toArray());
  console.log('total to do', images.length);
  for (let i of images) {
    yield (idToType.create({id: i._id ,type: 'Image'}));
  }
  process.exit();
});
main();
