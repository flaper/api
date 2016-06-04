module.exports = (UserExtra) => {
  UserExtra.commonInit(UserExtra);
  UserExtra.PROPERTIES = {
    premiumSupport: 'premiumSupport',
    flapId: 'flapId',
    objects: 'objects'
  };

  UserExtra.updateValue = updateValue;

  function updateValue(userId, name, value) {
    let id = userId.toString();
    return new Promise((resolve, reject) => {
      let collection = UserExtra.dataSource.connector.collection(UserExtra.sharedClass.name);
      collection.findOneAndUpdate({userId: id},
        {$set: {userId: id, [name]: value}},
        {upsert: true, returnOriginal: false}, (err, result) => {
          if (err) return reject(err);
          resolve(result);
        })
    })
  }
};
