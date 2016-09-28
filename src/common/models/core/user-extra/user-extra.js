import _ from 'lodash';

module.exports = (UserExtra) => {
  UserExtra.commonInit(UserExtra);
  UserExtra.PROPERTIES = {
    premiumSupport: 'premiumSupport',
    flapId: 'flapId',
    objects: 'objects'
  };
  let PROPS = UserExtra.PROPERTIES;
  UserExtra.PROPERTIES_FOR_API = [PROPS.premiumSupport, PROPS.objects];

  UserExtra.updateValue = updateValue;
  UserExtra.updateValueToLeast = updateValueToLeast;
  UserExtra.addObject = addObject;
  UserExtra.removeObject = removeObject;
  UserExtra.getObjectsIds = getObjectsIds;

  function updateValue(userId, name, value) {
    let id = userId.toString();
    return new Promise((resolve, reject) => {
      let collection = getCollection();
      collection.findOneAndUpdate({userId: id},
        {$set: {userId: id, [name]: value}},
        {upsert: true, returnOriginal: false}, (err, result) => {
          if (err) return reject(err);
          resolve(result.value[name]);
        })
    })
  }
  
  // обновить значение до value, если текущее меньше или не задано
  function* updateValueToLeast(userId, name, value) {
    let extra = yield (UserExtra.findOne({where: {userId}}));
    let current = _.get(extra, name);
    if (!current || current < value) return yield (updateValue(userId, name, value));
    return current;
  }

  function* addObject(userId, objectId) {
    let id = userId.toString();
    let objId = objectId.toString();
    const PROP_OBJECT = UserExtra.PROPERTIES.objects;
    let objs = yield (getObjectsIds(userId));
    if (objs.includes(objId)) return objs;
    return yield (new Promise((resolve, reject) => {
      let collection = getCollection();
      collection.findOneAndUpdate({userId: id}, {$push: {[PROP_OBJECT]: objId}},
	{upsert: true, returnOriginal: false}, (err, result) => {
	  if (err) return reject(err);
	  resolve(result.value.objects);
	})})
    );
  }

  function removeObject(userId, objId) {
    let id = userId.toString();
    const PROP_OBJECT = UserExtra.PROPERTIES.objects;
    return new Promise((resolve, reject) => {
      let collection = getCollection();
      collection.findOneAndUpdate({userId: id},
        {$pull: {[PROP_OBJECT]: objId}},
        {upsert: true, returnOriginal: false}, (err, result) => {
          if (err) return reject(err);
          let objects = _.get(result.value, 'objects', []);
          resolve(objects);
        })
    })
  }

  function* getObjectsIds(id) {
    let extra = yield (UserExtra.findOne({where: {userId: id}}));
    return _.get(extra, 'objects', []);
  }

  function getCollection() {
    return UserExtra.dataSource.connector.collection(UserExtra.sharedClass.name);
  }
};
