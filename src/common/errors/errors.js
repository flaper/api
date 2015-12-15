export let ERRORS = {
  forbidden: (message = "Action not allowed") => {
    let error = new Error();
    error.status = 403;
    error.message = message;
    return error;
  }
};
