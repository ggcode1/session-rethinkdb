# session-rethinkdb

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js Version][node-image]][node-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][dependencies-image]][dependencies-url]
[![Coverage Status][coveralls-image]][coveralls-url]

### RethinkDBRethinkDB session store for Express and Connect.

## Installation

```npm install session-rethinkdb```

## Getting started

You must already have Express Session or Connect installed (```npm install express express-session```).

```javascript
const express = require('express');
const app = express();

const session = require('express-session');
const RDBStore = require('session-rethinkdb')(session);

const store = new RDBStore({
  flushOldSessIntvl: 60000,
  clientOptions: {
    db: 'test'
    host: 'localhost',
    port: '28015'
  }
  table: 'session'
});

app.use(session({
  secret: 'keyboard cat',
  cookie: {
    maxAge: 10000
  },
  store: store
}));
```

## Constructor options

### flushOldSessIntvl
Flush expired sessions periodically. This defines the amount of time between two flushes.
*Defaults to 60 seconds*

### clientOptions
We need these to connect to our DB. Used only when no ```clientPromise``` is provided.
*See [RethinkDB's doc](http://rethinkdb.com/api/#js:accessing_rql-connect).*

### table
Name of the table in which session data will be stored.
*Defaults to 'session'*

### browserSessionsMaxAge
If you do not set ```cookie.maxAge``` in ```session``` middleware, sessions will last until the user closes his/her browser. However we cannot keep the session data infinitely (for size and security reasons). In this case, this setting defines the maximum length of a session, even if the user doesn't close his/her browser.
*Defaults to 1 day*

## Changelog



[npm-version-image]: https://img.shields.io/npm/v/session-rethinkdb.svg
[npm-downloads-image]: https://img.shields.io/npm/dm/session-rethinkdb.svg
[npm-image]: https://nodei.co/npm/session-rethinkdb.png?downloads=true&downloadRank=true&stars=true
[npm-url]: https://npmjs.org/package/session-rethinkdb
[travis-image]: https://img.shields.io/travis/llambda/session-rethinkdb/master.svg
[travis-url]: https://travis-ci.org/llambda/session-rethinkdb
[dependencies-image]: https://david-dm.org/llambda/session-rethinkdb.svg?style=flat
[dependencies-url]: https://david-dm.org/llambda/session-rethinkdb
[coveralls-image]: https://img.shields.io/coveralls/llambda/session-rethinkdb/master.svg
[coveralls-url]: https://coveralls.io/r/llambda/session-rethinkdb?branch=master
[node-image]: https://img.shields.io/node/v/session-rethinkdb.svg
[node-url]: http://nodejs.org/download/
[gitter-join-chat-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-channel-url]: https://gitter.im/llambda/session-rethinkdb
[express-session-url]: https://github.com/expressjs/session
[io-url]: https://iojs.org
