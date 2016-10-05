export function initAudit(Story) {
  Story.getAudit = getAudit;

  Story.remoteMethod(
    'getAudit',
    {
      http: {path: '/:id/audit', verb: 'get'},
      description: `Возвращает историю изменений`,
      accessType: 'READ',
      accepts: {
        arg: 'id',
        type: 'string'
      },
      returns: {root: true}
    }
  );

  function* getAudit(id) {
    let {Audit} = Story.app.models;
    return yield Audit.find({where: {subjectId: id}, order: 'created DESC'});
  }
}
