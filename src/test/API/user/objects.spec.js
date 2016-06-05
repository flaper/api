import {api, user1, user2, admin, salesPromise, superPromise, adminPromise, user1Promise} from '../../helpers/api';
import {updateTimeouts} from '../timeout';
import app from '../../helpers/app';
import _ from 'lodash';
let should = require('chai').should();
import OBJECTS from  '../../fixtures/fObject.js';

let User = app.models.User;

describe(`/users/:id/objects`, function () {
  updateTimeouts(this);

  function _url(id) {
    return `users/${id}/objects`;
  }

  function _getUrl(id) {
    return `users/${id}/objectsIds`;
  }

  before(() => {
    return user1Promise.then(({agent}) => {
      return agent.get(_getUrl(user1.id))
        .expect(200)
        .expect(res => {
          let objects = res.body;
          objects.length.should.eq(0);
        })
    })
  });

  describe('GET', () => {
    it('User - deny foreign access', () => {
      return user1Promise.then(({agent}) => {
        return agent.get(_getUrl(user2.id))
          .expect(401);
      });
    });

    it('User - allow access to his list', () => {
      return user1Promise.then(({agent}) => {
        return agent.get(_getUrl(user1.id))
          .expect(200);
      });
    });

    it('Sales - allow access to anyone list', () => {
      return salesPromise.then(({agent}) => {
        return agent.get(_getUrl(user1.id))
          .expect(200);
      });
    });

    it('Super - allow access to anyone list', () => {
      return superPromise.then(({agent}) => {
        return agent.get(_getUrl(user1.id))
          .expect(200);
      });
    })
  });

  describe('PUT', () => {
    it('Anonymous - deny', () => {
      return api.put(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(401)
    });

    it('User - deny to link himself', () => {
      return user1Promise.then(({agent}) => {
        return agent.put(_url(user1.id))
          .send({objectId: OBJECTS.obj1.id})
          .expect(403)
      })
    });

    it('Admin - deny to link himself', () => {
      return adminPromise.then(({agent}) => {
        return agent.put(_url(admin.id))
          .send({objectId: OBJECTS.obj1.id})
          .expect(403)
      })
    });

    it('Super - allow to link anyone, then object owner will be able to add another user', () => {
      return superPromise.then(({agent}) => {
          return agent.put(_url(user1.id))
            .send({objectId: OBJECTS.obj1.id})
            .expect(200)
        })
        .then(() => {
          return user1Promise.then(({agent}) => {
            return agent.put(_url(user2.id))
              .send({objectId: OBJECTS.obj1.id})
              .expect(200)
          })
        })
        .then(() => {
          return superPromise.then(({agent}) => {
            return agent.get(_getUrl(user2.id))
              .expect(200)
              .expect(res => {
                let objects = res.body;
                objects.should.include(OBJECTS.obj1.id);
              })
          })
        })
    });
  });

  describe('DELETE', () => {
    it('Anonymous - deny', () => {
      return api.del(_url(user1.id))
        .send({objectId: OBJECTS.obj1.id})
        .expect(401)
    });

    it('Super - allow to unlink anyone', () => {
      return superPromise.then(({agent}) => {
        return agent.del(_url(user1.id))
          .send({objectId: OBJECTS.obj1.id})
          .expect(200)
          .expect(res => {
            let objects = res.body;
            let obj1 = objects.find(id => OBJECTS.obj1.id);
            should.not.exist(obj1);
          })
      })
    });

    it('User - deny to unlink if not owner', () => {
      return user1Promise.then(({agent}) => {
        return agent.del(_url(user1.id))
          .send({objectId: OBJECTS.obj1.id})
          .expect(403)
      })
    });

    it('User - allow to unlink if owner', () => {
      return superPromise.then(({agent}) => {
          return agent.put(_url(user1.id))
            .send({objectId: OBJECTS.obj1.id})
            .expect(200)
        })
        .then(() => {
          return user1Promise.then(({agent}) => {
            return agent.del(_url(user1.id))
              .send({objectId: OBJECTS.obj1.id})
              .expect(200)
          })
        })
    });
  });

  after(() => {
    let promises = [];
    promises.push(User.updateExtraValue(user1.id, 'objects', []));
    promises.push(User.updateExtraValue(user2.id, 'objects', []));
    return Promise.all(promises);
  })
});
