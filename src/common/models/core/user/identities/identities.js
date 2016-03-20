import {App} from '../../../../services/App';
import {ERRORS} from '../../../../utils/errors';

export function initIdentities(User) {
  User.getIdentities = getIdentities;

  User.remoteMethod('getIdentities', {
    http: {verb: 'get', path: '/:id/identities'},
    description: 'Get Social Accounts',
    accessType: 'READ',
    accepts: [
      {arg: 'id', type: 'string', description: 'User Id', required: true}
    ],
    returns: {root: true}
  });

  function getIdentities(id) {
    console.log('get Identities');
    let UserIdentity = User.app.models.userIdentity;
    return User.findByIdRequired(id)
      .then(() => UserIdentity.find({userId: id}))
      .then((identities) => {
        return identities.map((row) => {
          let provider = row.provider.replace('-login', '');
          let id = row.externalId;
          let identity = {id: id, provider: provider, displayName: row.profile.displayName};
          switch (provider) {
            case 'google':
              identity['url'] = `https://plus.google.com/${id}`;
              break;
            case 'facebook':
              identity['url'] = `https://facebook.com/${id}`;
              break;
            case 'vk':
            case 'odnoklassniki':
              identity['url'] = row['profileUrl'];
              break;
            default:
              identity['url'] = row['profileUrl'];
              break;
          }
          console.log('identity', identity);
          return identity;
        });
      })
  }
}
