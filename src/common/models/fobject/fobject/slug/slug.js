import {ERRORS} from '../../../../utils/errors'

export function initSlug(FObject) {
  FObject.slugFilter = slugFilter;
  FObject.slugSuffix = slugSuffix;
  FObject.disableRemoteMethod('actionFindBySlug', true);
  FObject.findBySlug = findBySlug;

  FObject.remoteMethod(
    'findBySlug',
    {
      description: `Find an object by slug`,
      http: {path: '/bySlug', verb: 'get'},
      accepts: [
        {arg: 'mainDomain', type: 'string', required: true},
        {arg: 'region', type: 'string', required: false},
        {arg: 'slug', type: 'string', required: true}
      ],
      returns: {root: true},
      rest: {after: ERRORS.convertNullToNotFoundError}
    }
  );

  function slugFilter(model) {
    let filter = {status: FObject.STATUS.ACTIVE, mainDomain: model.mainDomain};
    if (model.mainDomain === FObject.DOMAINS.PLACES) {
      filter.region = model.region;
    }
    return filter;
  }

  function slugSuffix(model) {
    let adds = [];
    if (model.mainDomain === FObject.DOMAINS.PLACES) {
      if (model.fields && model.fields.address) {
        let address = model.fields.address;
        ['street', 'houseNumber'].forEach((property) => {
          if (address[property]) {
            adds.push(address[property]);
          }
        })
      }
    } else if (model.fields) {
      let fields = model.fields;
      if (fields['год']) {
        adds.push(fields['год']);
      }
    }
    return adds;
  }

  function findBySlug(mainDomain, region, slug) {
    let query = {slugLowerCase: slug.toLocaleLowerCase(), mainDomain: mainDomain, status: FObject.STATUS.ACTIVE};
    if (region) {
      query.region = region;
    }
    let filter = {where: query};
    return FObject.findOne(filter);
  }
}
