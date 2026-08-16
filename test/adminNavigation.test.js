import test from 'node:test'
import assert from 'node:assert/strict'
import { adminNavigation, canLoadMoreAudit, canSaveSettings, canShowAdminLink, mergeAuditItems } from '../src/services/adminPermissions.js'
test('admin navigation visibility follows permissions',()=>{assert.equal(canShowAdminLink([]),false);assert.equal(canShowAdminLink(['admin:access']),true);assert.equal(canSaveSettings(['settings:read']),false);assert.equal(canSaveSettings(['settings:write']),true);assert.deepEqual(adminNavigation(['admin:access','announcement:read','settings:read','audit:read']).map(x=>x[0]),['Genel Bakış','Duyurular','Ayarlar','Denetim Kaydı']);assert.deepEqual(adminNavigation(['admin:access','announcement:read']).map(x=>x[0]),['Genel Bakış','Duyurular'])})
test('audit pagination decisions do not duplicate records',()=>{assert.equal(canLoadMoreAudit(null),false);assert.equal(canLoadMoreAudit('next'),true);assert.deepEqual(mergeAuditItems([{id:'a'}],[{id:'a'},{id:'b'}]),[{id:'a'},{id:'b'}])})
