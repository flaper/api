module.exports = (UserSettings) => {
  UserSettings.commonInit(UserSettings);
  UserSettings.disableAllRemotesExcept(UserSettings, ['find']);
  UserSettings.disableRemoteMethod('__get__user', false);
};
