export function initSlug(FObject) {
  FObject.slugFilter = slugFilter;
  FObject.slugSuffix = slugSuffix;

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
}
