import app from '../../../../server/server';
let should = require('chai').should();
import {returnProperties} from '../../commonModel/helper'
let Story = app.models.Story;

export function returnStatus(id, status) {
  return returnProperties(Story, id, {status: status})
}
