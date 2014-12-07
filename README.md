pouchdb-erase
=============

A replicating db.destroy() alternative for PouchDB. Works by iterating
over all documents in the database and deleting them. Uses batches
and changes() internally. It's a drop-in replacement for db.destroy().

Example
-------

```bash
npm install pouchdb pouchdb-erase
```

```javascript
//index.js
var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-erase'));

var db = new PouchDB('test');
db.erase().then(function (resp) {
	console.log(resp) //{ok: true}
})
```

Browser usage
-------------

```html
<script src='dist/pouchdb-erase.min.js'></script>
<script>
  PouchDB.plugin(Erase);

  new PouchDB('test').erase();
</script>
```

API
---

- ``db.erase([options[, callback]])``

  the only option in ``options`` is at the moment batch_size, it
  determines how much documents are collected before they are removed
  all at once in one batch. ``callback`` is optional, as shown in the
  example a promise interface is also provided.
