import app from '../../helpers/app';
import _ from 'lodash';
let config = app.get('flap');
export const HAS_TOKEN = _.get(config, 'token', false);

