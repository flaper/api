import app from '../../../../server/server';
let should = require('chai').should();
let Story = app.models.Story;

export function returnStatus(id, status) {
  return Story.findById(id)
    .then((story) => {
      story.status = status;
      return story.save({skipIgnore: 'status'});
    })
    .then((story) => {
      story.status.should.be.eq(status);
    })
}
