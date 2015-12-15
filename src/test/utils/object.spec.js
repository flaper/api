let should = require('chai').should();
import {objectHasDeepKey} from '../../common/utils/object';

describe('object', () => {
  it('objectHasDeepKey', () => {
    true.should.eq(objectHasDeepKey({key1: 123}, 'key1'));

    let obj1 = {key1: 123, deep: {hh: 123, ll: [{array1: 123}, {array2: {deeper: '123'}}]}};
    false.should.eq(objectHasDeepKey(obj1, 'strange'));
    true.should.eq(objectHasDeepKey(obj1, 'deeper'));
    false.should.eq(objectHasDeepKey(null, 'key1'));
    false.should.eq(objectHasDeepKey("key1", 'key1'));
  })
});
