module.exports = (UserSettings) => {
  UserSettings.commonInit(UserSettings);
  UserSettings.NAMES = {
    SHOW_SOCIAL_LINKS: 'SHOW_SOCIAL_LINKS',
    SHOW_POINTS: 'SHOW_POINTS'
  };

  UserSettings.updateSetting = updateSetting;

  function updateSetting(userId, name, value) {
    return new Promise((resolve, reject) => {
      let collection = UserSettings.dataSource.connector.collection(UserSettings.sharedClass.name);
      collection.findOneAndUpdate({userId: userId, name: name},
        {userId: userId, name: name, value: value, updated: new Date()},
        {upsert: true, returnOriginal: false}, (err, result) => {
          if (err) return reject(err);
          resolve(result.value.value);
        })
    })
  }
};
