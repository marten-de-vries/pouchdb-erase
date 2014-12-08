"use strict";

//ATTENTION: the npm package doesn't include the 'dbs/registry.orig'
//directory since it's very big. If you want to run the tests, download
//the source from github instead.

var Promise = require('bluebird');
var fse = Promise.promisifyAll(require('fs-extra'));
var PouchDB = require('pouchdb');
var assert = require('assert');

//require('pouchdb-erase')
PouchDB.plugin(require('../'));

var setup = fse.removeAsync(__dirname + '/dbs/registry').catch(function () {
  //directory probably just doesn't exist
  }).then(function () {
    return fse.copyAsync(__dirname + '/dbs/registry.orig', __dirname + '/dbs/registry');
  });

var db;
setup.then(function () {
  db = new PouchDB(__dirname + '/dbs/registry');

  return db.erase();
}).then(function (resp) {
  assert.ok(resp.ok, "db.erase() should return {ok: true}");

  return db.compact();
}).then(function () {
  return db.allDocs();
}).then(function (resp) {
  assert.equal(resp.total_rows, 0);
  assert.equal(resp.offset, 0);
  assert.equal(resp.rows.length, 0);
});

new PouchDB(__dirname + '/dbs/test').erase(function (err, resp) {
  //test using callback
  assert(!err);
  assert(resp.ok);
});
