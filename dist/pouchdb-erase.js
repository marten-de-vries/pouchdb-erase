!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Erase=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"promise-nodify":2}],2:[function(require,module,exports){
/*
  Copyright 2013-2014, Marten de Vries

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

module.exports = function nodify(promise, callback) {
  if (typeof callback === "function") {
    promise.then(function (resp) {
      callback(null, resp);
    }, function (err) {
      callback(err, null);
    });
  }
};

},{}]},{},[1])(1)
});