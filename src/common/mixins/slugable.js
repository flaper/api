module.exports = (Model, options) => {
  Model.defineProperty('slug', {type: "string", required: true});
}
