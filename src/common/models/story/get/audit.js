import {disableRemoteRelation} from '../../core/common.js';
export function initAuditRest(Story) {
  disableRemoteRelation(Story, 'audit', ['get', 'count']);
}
