import request from 'request-promise';
import {disableAllRemotesExcept} from '../../models/core/common.js';

const URL = 'http://es:9200/flaper/object/_search?pretty=true';
module.exports = (Search) => {
  disableAllRemotesExcept(Search, []);
  Search.search = search;

  Search.remoteMethod(
    'search',
    {
      http: {path: '/', verb: 'get'},
      description: `Поиск`,
      accessType: 'READ',
      accepts: [
        {
          arg: 'filter',
          type: 'object',
          description: 'Filter defining where, order, offset, and limit'
        },
      ],
      returns: {root: true}
    }
  );

  function search(filter) {
    filter = filter || {};
    let where = filter.where || {};
    let {query, region, domain} = where;
    let q = {filter: [{term: {status: 'active'}}]};
    if (query)
      q.must = {match: {title: query}};
    if (region)
      q.filter.push({term: {region: region}});
    if (domain)
      q.filter.push({term: {mainDomain: domain}});
    q = {query: {bool: q}};
    let options = {
      method: 'GET',
      uri: URL,
      body: q,
      json: true
    };
    return request(options);
  }
};
