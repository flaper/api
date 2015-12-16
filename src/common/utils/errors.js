export let ERRORS = {
  badRequest: (message = "Bad request") => {
    return ERRORS.error(message, 400);
  },
  forbidden: (message = "Action not allowed") => {
    return ERRORS.error(message, 403);
  },
  notFound: (message = "Not found", code = null) => {
    return ERRORS.error(message, 404, code);
  },
  error: (message, statusCode, code = null) => {
    let error = new Error();
    error.message = message;
    error.statusCode = error.status = statusCode;
    error.code = code;
    return error;
  },
  convertNullToNotFoundError: /*!
   * code taken from persisted-model.js
   * Convert null callbacks to 404 error objects.
   * @param  {HttpContext} ctx
   * @param  {Function} cb
   */
    function convertNullToNotFoundError(ctx, cb) {
      if (ctx.result !== null) return cb();

      let modelName = ctx.method.sharedClass.name;
      let id = ctx.getArgByName('id');
      let msg = 'Unknown "' + modelName + '" id "' + id + '".';
      let error = ERRORS.notFound(msg, 'MODEL_NOT_FOUND');
      cb(error);
    }
};
