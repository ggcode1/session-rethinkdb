'use strict';
var test = require('tape');
var session = require('express-session');
var r = require('rethinkdbdash')();
var RethinkStore = require('./index.js')(session);

var store = new RethinkStore(r, {
	table: 'automatedtest'
});

test('set then clear', function (t) {
    t.plan(3);
    store.set('1092348234', {cookie: {maxAge: 1000}, name: 'InsertThenClear'})
    .then(function () {
        store.clear(function(err, cleared) {
            t.error(err);

            store.length(function(err, len) {
                t.error(err, 'no error after clear');
                t.equal(len, 0, 'empty after clear');
            });
        })
    })
})


test('cleanup', function (t) {
    store.r.getPoolMaster().drain().then(t.end);
})
