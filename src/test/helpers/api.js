import app from '../../server/server';
import supertest from 'supertest';
import defaults from 'superagent-defaults';

const PORT = app.get('port');
const LOGIN_URL = 'users/login';
const API_URL = `http://0.0.0.0:${PORT}/api/`;
const USERS = require('../fixtures/allUsers');
export let api = supertest(API_URL);

export function userAgentPromise(user) {
  let request = defaults(supertest(API_URL));
  return new Promise((resolve, reject) => {
    //promise wrapper necessary here, as request doesn't return standard Promise
    api.post(LOGIN_URL)
      .send(user)
      .then((res) => {
        let body = res.body;
        if (body.error){
          return reject(`Authentication failed for ${user.id}`);
        }
        request.set('Authorization', body.id);
        //we need to wrap request in {} as it has then method which will not be resolved
        resolve({agent: request});
      }, reject);
  });
}

export let admin = USERS.testAdmin;
export let adminPromise = userAgentPromise(admin);
export let superUser = USERS.testSuper;
export let superPromise = userAgentPromise(USERS.testSuper);
export let sales = USERS.testSales;
export let salesPromise = userAgentPromise(sales);
export let user1 = USERS.user1;
export let user1Promise = userAgentPromise(user1);
export let user2 = USERS.user2;
export let user2Promise = userAgentPromise(user2);
export let user3 = USERS.user3;
export let user3Promise = userAgentPromise(user3);
