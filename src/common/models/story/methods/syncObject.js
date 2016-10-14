import co from 'co';
export function initSyncObject(Story) {
  Story.observe('after save', syncObject);

  Story.iSyncObject = iSyncObject;

  function iSyncObject(objectId) {
    return co(function *() {
      if (!objectId) throw 'iSyncObject всегда должен иметь objectId';

      // { rating: ..,, reviewsNumber: ...}
      let data = yield (countRatingData(objectId));
      let {FObject} = Story.app.models;
      yield (FObject.updateAll({id: objectId}, data));
    });
  }

  function* syncObject(ctx) {
    if (!(ctx.instance && ctx.isNewInstance && ctx.instance.type === Story.TYPE.REVIEW)) {
      return;
    }
    //for new review we sync object
    yield (Story.iSyncObject(ctx.instance.objectId));
  }

  function countRatingData(objectId) {
    return new Promise((resolve, reject)=> {
      let res = {};
      let collection = Story.dataSource.connector.collection('Story');
      let query = {objectId: objectId, status: Story.STATUS.ACTIVE};
      collection.find(query, {rating: true, userId: true}).toArray((err, rows)=> {
        if (err) return reject(err);
        res.reviewsNumber = rows.length;
        let sum = rows.reduce((a, row) => a + row.rating, 0);
        res.rating = res.reviewsNumber ? Math.round(sum * 10 / res.reviewsNumber) / 10 : 0;
        resolve(res);
      });
    });
  }

}
