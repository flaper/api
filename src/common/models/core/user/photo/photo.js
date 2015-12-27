let app = require('../../../../../server/server');
let serverUrl = app.get('webApp').url;
const DEFAULT_PHOTO = `${serverUrl}/img/user/blue.png`;
const DEFAULT_PHOTO_LARGE = DEFAULT_PHOTO;
export function initPhotos(User) {
  User.observe('loaded', initPhotos);

  function initPhotos(ctx) {
    if (ctx.instance) {
      if (!ctx.instance.photo) {
        ctx.instance.photo = DEFAULT_PHOTO;
      }
      if (!ctx.instance.photoLarge) {
        ctx.instance.photoLarge = DEFAULT_PHOTO_LARGE;
      }
    }
    return Promise.resolve();
  }
}
