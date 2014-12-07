/*
  Copyright 2014, Marten de Vries

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

"use strict";

var nodify = require('promise-nodify');

exports.erase = function (opts, callback) {
  var db = this;
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  var docs = [];
  var busy = {
    //emulate enough of promise not to need an actual one
    then: function (cb) {
      return cb();
    }
  };
  function handleBatch() {
    var theDocs = docs;
    docs = [];
    //serialize calls to handleBatch
    busy = busy.then(function (resp) {
      return db.bulkDocs(theDocs);
    });
    return busy;
  }

  var changes = db.changes({returnDocs: false, descending: true});
  var batchSize = (opts || {}).batch_size || 100;

  changes.on('change', function (info) {
    docs.push({
      _id: info.id,
      _rev: info.changes[0].rev,
      _deleted: true
    });
    if (docs.length === batchSize) {
      handleBatch();
    }
  });
  var promise = changes.then(handleBatch).then(function () {
    return {ok: true};
  });
  nodify(promise, callback);

  return promise;
};
