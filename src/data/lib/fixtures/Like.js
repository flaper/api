import app from '../../../server/server';
import _ from 'lodash';

export function countNumberOfLikes() {
  let Like = app.models.Like;
  return Like.find({fields: {subjectId: true, subjectType: true}})
    .then(result => {
      console.log('Count Likes started');
      let map = _.indexBy(result, 'subjectId');
      //unique now
      let ids = Object.keys(map);
      let promises = ids.map(id => Like.updateSubject(map[id].subjectType, id));
      return Promise.all(promises)
        .then(() => {
          console.log('Count Likes done');
        })
    })
}
