import * as _ from 'lodash';

export class FlapMap {
  static mapObject(obj, data) {
    obj.title = data.title;
    obj.mainDomain = data.mainDomain;
    obj.region = data.region; //if null field will be skipped
    obj.created = data.created * 1000;
    if (data.email) {
      if (data.email instanceof Array) {
        obj.emails = data.email;
      } else {
        obj.emails = [data.email];
      }
    }
    let fields = {};
    if (data.website) {
      fields.urls = data.website.split(';').map(url => url.trim())
        .filter(url => url);
    }

    if (data.street || data.houseNumber || data.addressExtra) {
      fields.address = {
        street: data.street,
        houseNumber: data.houseNumber,
        extra: data.addressExtra
      };
    }
    if (data.latitude && data.longitude) {
      fields.location = {
        lat: data.latitude,
        lng: data.longitude
      }
    }
    if (data.phone) {
      fields.phones = data.phone.split(';').map(phone => phone.trim());
    }

    let days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    let hours = {};
    days.forEach(day => {
      if (data[day]) {
        hours[day] = data[day];
      }
    });
    if (!_.isEmpty(hours)) {
      fields.hours = hours;
    }
    obj.fields = fields;
    obj.flap.reviewsNumber = data.reviewsNumber;
    obj.flap.rating = data.rating;
    if (data.avatar) {
      let avatar = data.avatar;
      if (!avatar.match('avatar')) {
        avatar = avatar.replace('thumb', 'middle')
      }
      obj.flap.avatar = avatar;
    }
    obj.flap.images = data.photos.map(photo => +photo);
    if (data.creatorId) {
      obj.flap.creatorId = +data.creatorId;
    }

    return obj;
  }
}
