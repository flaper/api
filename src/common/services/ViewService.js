import {App} from './App';
import fs from 'fs';

export let VIEW_LOG_PATH = '/var/log/flaper/view/view.log';
export class ViewService {
  static logView(d) {
    return new Promise((resolve, reject) => {
      let time = Math.round((new Date()).getTime() / 1000);
      let data = Object.assign({time: time}, d);
      return fs.appendFile(VIEW_LOG_PATH, JSON.stringify(data)+'\n', (err) => {
        resolve();
      })
    });
  }
}

