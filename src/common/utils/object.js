import _ from 'lodash';

//it works even for null / "asdf" etc
export function objectHasDeepKey(obj, key) {
  if (_.has(obj, key))
    return true;

  let res = false;
  _.forEach(obj, (v) => {
    if (typeof v === "object" && objectHasDeepKey(v, key))
      res = true;
  });
  return res;
}

export function getOwnPropertiesNamesFilter(object, filter) {
  let lowerCaseFilter = filter.toLowerCase();
  let names = Object.getOwnPropertyNames(object);
  return names.filter(name => {
    let lowerCaseName = name.toLowerCase();
    return lowerCaseName.indexOf(lowerCaseFilter) > -1;
  })
}
