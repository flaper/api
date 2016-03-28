import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import {VIEW_LOG_PATH} from '../../common/services/ViewService'
import {App} from '../../common/services/App'

module.exports = function (server) {
  if (!App.isTestEnv()) {
    let dir = path.dirname(VIEW_LOG_PATH);
    fs.stat(dir, (err, access) => {
      if (err) {
        if (err.code === 'ENOENT') {
          //no such file
          mkdirp(dir, (err) => {
            if (err) console.error(err);
          });
        } else {
          console.log(err);
        }
      }
    })
  }
};
