let rp = require('request-promise');
import app from '../../server/server';
import * as _ from 'lodash';
import {FlapMap} from './map';
import {REGIONS, PROPERTIES} from './consts';
import {ERRORS} from '../../common/utils/errors';

const API_URL = 'http://api.flap.biz';

const regionNameById = {
  [REGIONS.CITY_ID]: {
    isCity: false,
    slug: 'города'
  }
};

export class FlapAPI {
  static * getObject(id) {
    let FObject = app.models.FObject;
    let data = yield (FlapAPI.request(`object/${id}`));
    data.properties = _.keyBy(data.properties, 'id');
    let region = yield (FlapAPI.getRegionName(data.cityId));
    if (region.isCity) {
      data.mainDomain = FObject.DOMAINS.PLACES;
      data.region = region.slug;
    } else {
      data.mainDomain = region.slug;
    }
    delete data.cityId;
    return data;
  }

  static * getRegionName(regionId) {
    if (regionNameById[regionId]) {
      return yield (regionNameById[regionId]);
    }
    let region = yield (FlapAPI.getObject(regionId));
    let slug = region.title.toLowerCase();
    let isCity = false;
    if (region.properties && region.properties[PROPERTIES.PROPERTY_COUNTRY_ID_ID]) {
      isCity = region.properties[PROPERTIES.PROPERTY_COUNTRY_ID_ID].value !== 'sp';
    }
    regionNameById[regionId] = {
      slug: slug,
      isCity: isCity
    };
    return regionNameById[regionId];
  }

  static * getUser(id) {
    let data = yield (FlapAPI.request(`user/${id}`));
    if (data.domain === 'odnoklassniki.ru') {
      if (!data.link) throw ERRORS.error('FLAP API - user link should be provided');
      let matches = data.link.match(/\d+$/);
      if (matches) {
        // id в url соответствует id для passport js
        data.domainId = matches[0];
      }
    }
    return data;
  }

  static * getReviews(objectId) {
    return yield (FlapAPI.request(`object/${objectId}/reviews`));
  }

  static * request(path) {
    let config = app.get('flap');
    let token = _.get(config, 'token', '');
    let url = `${API_URL}/${path}?lang=ru&key=${token}`;
    let body = yield (rp(url));
    return JSON.parse(body);
  }

}
