'use strict';
var r = require('rethinkdb');
var debug = require('debug')('session');

module.exports = function (connect) {

  var Store = (connect.session) ? connect.session.Store : connect.Store;

  function RethinkStore(options) {
    var self = this;

    options = options || {};
    options.clientOptions = options.clientOptions || {};
    Store.call(self, options); // Inherit from Store

    self.browserSessionsMaxAge = options.browserSessionsMaxAge || 86400000; // 1 day
    self.table = options.table || 'session';

    if (typeof self.options.clientOptions === 'function') {
      self.r = self.options.clientOptions;
    } else if (typeof self.options.clientOptions === 'object') {
      self.r = require('rethinkdbdash')(self.options.clientOptions);
    } else {
      throw new TypeError('Invalid options');
    }
    
    self.r.connect(options.clientOptions)
    .tap(function () {
      r.table('session')
      .indexStatus('expires')
      .run()
      .catch(function (err) {
        debug('INDEX STATUS %j', err);
        return r.table(self.table).indexCreate('expires').run();
      })
      .then(function (result) {
        debug('PRIOR STEP %j', result);
        self.emit('connect');
      });

      self.clearInterval = setInterval(function () {
        var now = Date.now();
        r.table(self.table)
        .between(0, now, {index: 'expires'})
        .delete()
        .run()
        .tap(function (result) {
          debug('DELETED EXPIRED %j', result);
        }).unref();
      }, options.clearInterval || 60000);
    });
  };

  RethinkStore.prototype = new Store();

  RethinkStore.prototype.get = function (sid, fn) {
    var self = this;

    debug('GETTING "%s" ...', sid);
    return self.r.table(self.table)
    .get(sid)
    .run()
    .then(function (data) {
      debug('GOT %j', data);
      data = data ? JSON.parse(data.session) : null;
      return data;
    }).asCallback(fn);
  };

  RethinkStore.prototype.set = function (sid, sess, fn) {
    var self = this;

    var sessionToStore = {
      id: sid,
      expires: Date.now() + (sess.cookie.originalMaxAge || this.browserSessionsMaxAge),
      session: JSON.stringify(sess)
    };
    debug('SETTING "%j" ...', sessionToStore);
    return self.r.table(self.table)
    .insert(sessionToStore, {
      conflict: 'update'
    })
    .run()
    .tap(function (data) {
      debug('SET %j', data);
    })
    .asCallback(fn);
  };

  RethinkStore.prototype.destroy = function (sid, fn) {
    var self = this;

    debug('DELETING "%s" ...', sid);
    return r.table(self.table)
    .get(sid)
    .delete()
    .run()
    .tap(function (data) {
      debug('DELETED %j', data);
    })
    .asCallback(fn);
  };

  return RethinkStore;
};
