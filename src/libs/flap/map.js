import * as _ from 'lodash';

export class FlapMap {
  static mapObject(obj, data) {
    obj.title = data.title;
    obj.mainDomain = data.mainDomain;
    obj.region = data.region; //if null field will be skipped
    if (data.email) {
      if (data.email instanceof Array) {
        obj.emails = data.email;
      } else {
        obj.emails = [data.email];
      }
    }
    let fields = {};
    fields.website = data.website;
    if (data.street || data.houseNumber || data.addressExtra) {
      fields.address = data.street ? data.street : '';
      if (data.houseNumber) {
        fields.address = (fields.address + ' ' + data.houseNumber).trim();
      }
      if (data.addressExtra) {
        if (fields.address) {
          fields.address += '; '
        }
        fields.address += data.addressExtra;
      }
      fields.address = fields.address.trim();
    }
    if (data.latitude && data.longitude) {
      fields.location = {
        lat: data.latitude,
        lng: data.longitude
      }
    }
    if (data.phone) {
      obj.phones = data.phone.split(';').map(phone => phone.trim());
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

    return obj;
  }
}
