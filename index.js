/*!
 * Connect RethinkDB
 * MIT Licensed
 */

var r = require('rethinkdb'),
  debug = require('debug')('connect:rethinkdb');

module.exports = function (connect) {

  var Store = (connect.session) ? connect.session.Store : connect.Store;

  function RethinkStore(options) {

    options = options || {};
    options.clientOptions = options.clientOptions || {};
    Store.call(this, options); // Inherit from Store

    this.browserSessionsMaxAge = options.browserSessionsMaxAge || 86400000; // 1 day
    this.table = options.table || 'session';
    
    this.connection = r.connect(options.clientOptions)
    .tap(function (conn) {
      this.emit('connect');

      r.table('session').indexStatus('expires').run(conn)
      .catch(function (err) {
        return r.table(this.table).indexCreate('expires').run(conn);
      }.bind(this))

      this.clearInterval = setInterval(function () {
        var now = Date.now();
        r.table(this.table)
        .between(0, now, {index: 'expires'})
        .delete()
        .run(conn)
        .tap(function (result) {
          debug('DELETED EXPIRED %j', result);
        });
      }.bind(this), options.flushOldSessIntvl || 60000);
    }.bind(this));
  }

  RethinkStore.prototype = new Store();

  RethinkStore.prototype.get = function (sid, fn) {
    debug('GETTING "%s" ...', sid);
    return this.connection.then(function (conn) {
      return r.table(this.table)
      .get(sid)
      .run(conn)
      .tap(function (data) {
        debug('GOT %j', data);
        data = data ? JSON.parse(data.session) : null;
        fn(null, data);
      })
      .catch(function (err) {
        fn(err);
        throw err;
      });
    }.bind(this))
  };

  RethinkStore.prototype.set = function (sid, sess, fn) {
    var sessionToStore = {
      id: sid,
      expires: Date.now() + (sess.cookie.originalMaxAge || this.browserSessionsMaxAge),
      session: JSON.stringify(sess)
    };
    debug('SETTING "%j" ...', sessionToStore);
    return this.connection.then(function (conn) {
      return r.table(this.table)
      .insert(sessionToStore, {
        conflict: 'update'
      })
      .run(conn)
      .tap(function (data) {
        debug('SET %j', data);
        fn();
      })
      .catch(function (err) {
        fn(err);
        throw err;
      });
    }.bind(this));
  }

  RethinkStore.prototype.destroy = function (sid, fn) {
    debug('DELETING "%s" ...', sid);
    return this.connection.then(function (conn) {
      return r.table(this.table)
      .get(sid)
      .delete()
      .tap(function (data) {
        debug('DELETED %j', data);
        fn();
      })
      .catch(function (err) {
        fn(err);
        throw err;
      });
    }.bind(this));
  }

  return RethinkStore;
};