export function initSyncUser(Like) {
  Like.syncUser = syncUser;
  Like.syncUserFromStory = syncUserFromStory;

  function syncUserFromStory(storyId) {
    let Story = Like.app.models.Story;
    return Story.findByIdRequired(storyId)
      .then(story => Like.syncUser(story.userId));
  }

  function syncUser(userId) {
    let User = Like.app.models.user;

    let count;
    return countLikes(userId)
      .then(c => count = c)
      .then((count) => User.updateAll({id: userId}, {likesNumber: count},
        {skipIgnore: {likesNumber: true}}))
      .then((data) => User.findByIdRequired(userId))
      .then(() => count);
  }

  function countLikes(userId) {
    let Story = Like.app.models.Story;
    let query = {userId: userId, status: Story.STATUS.ACTIVE};
    let collection = Story.dataSource.connector.collection('Story');
    return new Promise((resolve, reject) => {
      collection.aggregate([
        {$match: query},
        {
          $group: {
            _id: null,
            total: {$sum: "$likesNumber"}
          }
        }
      ], (err, data) => {
        let total = data.length === 1 ? data[0].total : 0;
        if (err) return reject(err);
        return resolve(total);
      });
    })
  }
}
