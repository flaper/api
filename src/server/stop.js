import app from './server';
import killport from 'killport';

let PORT = app.get('port');

function exit() {
  process.exit();
}

killport(PORT)
  .then(exit)
  .catch(exit);
