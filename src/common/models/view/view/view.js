import {App} from '../../../services/App';
import {ERRORS} from '../../../utils/errors';
import {ViewService} from '../../../services/ViewService';

module.exports = (View) => {
  const ALLOWED_MODELS = ['Story'];

  View.commonInit(View);
  View.disableAllRemotesExcept(View);

  View.registerView = registerView;
  View.remoteMethod('registerView', {
    http: {verb: 'post', path: '/'},
    description: 'Register a view',
    accessType: 'WRITE',
    accepts: [
      {arg: 'id', type: 'string', description: 'Id', required: true},
      {arg: 'req', type: 'Object', 'http': {source: 'req'}}
    ],
    returns: {root: true}
  });

  function registerView(id, req) {
    let IdToType = View.app.models.IdToType;
    let subjectType;
    let userId = App.getCurrentUserId();
    return IdToType.findByIdRequired(id)
      .then(idToType => {
        subjectType = idToType.type;
        if (ALLOWED_MODELS.indexOf(subjectType) === -1) {
          throw ERRORS.badRequest(`Views are not allowed for type '${subjectType}'.`)
        }
        return idToType.findSubject();
      })
      .then((subject) => {
        let data = {
          id: id,
          ip: req.ip,
          //xhr: req.xhr ? 1 : 0,
          agent: req.get('User-Agent'),
          referer: req.get('Referer'),
          userId: userId,
          subjectUserId: subject.userId,
          subjectType: subjectType
        };
        ViewService.logView(data);
        return subject.updateAttributes({$inc: {viewsRecent: 1}})
      })
      .then(() => {
        return {result: 1};
      });
  }
};
