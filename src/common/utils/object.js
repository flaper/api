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
  let names = Object.getOwnPropertyNames(object);
  return filterNames(names, filter);
}

export function propertiesFilter(object, filter) {
  let names = [];
  for (let name in object) {
    //noinspection JSUnfilteredForInLoop
    names.push(name);
  }
  return filterNames(names, filter);
}

function filterNames(names, filter) {
  let lowerCaseFilter = filter.toLowerCase();

  return names.filter(name => {
    let lowerCaseName = name.toLowerCase();
    return lowerCaseName.indexOf(lowerCaseFilter) > -1;
  })
}

