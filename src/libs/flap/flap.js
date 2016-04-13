let rp = require('request-promise');
import app from '../../server/server';
import * as _ from 'lodash';
import {FlapMap} from './map';
import {REGIONS, PROPERTIES} from './consts';

const API_URL = 'http://api.flap.biz';

const regionNameById = {
  [REGIONS.CITY_ID]: {
    isCity: false,
    slug: 'города'
  }
};

export class FlapAPI {
  static getObject(id) {
    let FObject = app.models.FObject;
    let data = null;
    return FlapAPI.request(`object/${id}`)
      .then(res => {
        data = res;
        data.properties = _.keyBy(data.properties, 'id');
        return FlapAPI.getRegionName(data.cityId)
      })
      .then(region => {
        if (region.isCity) {
          data.mainDomain = FObject.DOMAINS.PLACES;
          data.region = region.slug;
        } else {
          data.mainDomain = region.slug;
        }
        delete data.cityId;
        return data;
      })
  }

  static getRegionName(regionId) {
    if (regionNameById[regionId]) {
      return Promise.resolve(regionNameById[regionId]);
    } else {
      return FlapAPI.getObject(regionId)
        .then(region => {
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
        })
    }
  }

  static request(path) {
    let url = `${API_URL}/${path}?lang=ru`;
    return rp(url).then(body => {
      let data = null;
      try {
        data = JSON.parse(body);
      }
      catch (e) {
        return Promise.reject('Cannot parse response: ', body);
      }
      return data;
    })
  }
}

export class Flap {
  static syncObject(flapId) {
    let FObject = app.models.FObject;
    let id = parseInt(flapId);
    if (!id) {
      return Promise.reject('Wrong ID');
    }

    let data = [];
    let obj = null;
    let p1 = FlapAPI.getObject(id)
      .then(res => data = res);
    let p2 = FObject.findOne({where: {'flap.id': id}})
      .then(res => obj = res);

    return Promise.all([p1, p2])
      .then(() => {
        if (!obj) {
          obj = new app.models.FObject();
          obj.flap = {id: id};
        }
        return FlapMap.mapObject(obj, data);
      })
      .then(() => obj.save())
  }
}
