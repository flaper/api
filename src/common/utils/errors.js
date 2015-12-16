export let ERRORS = {
  badRequest: (message = "Bad request") => {
    let error = new Error();
    error.status = 400;
    error.message = message;
    return error;
  },
  forbidden: (message = "Action not allowed") => {
    let error = new Error();
    error.status = 403;
    error.message = message;
    return error;
  },
  notFound: (message = "Not found") => {
    let error = new Error();
    error.status = 404;
    error.message = message;
    return error;
  }
};
