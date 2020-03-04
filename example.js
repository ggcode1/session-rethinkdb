'use strict';
const express = require('express');
const app = express();

const session = require('express-session');
const RDBStore = require('./index')(session);

const r = require('rethinkdbdash')({
    servers: [
        {host: 'localhost', port: 28015}
    ]
});

const store = new RDBStore(r,  {
    browserSessionsMaxAge: 5000, // optional, default is 60000 (60 seconds). Time between clearing expired sessions.
    table: 'session' // optional, default is 'session'. Table to store sessions in.
});

app.use(session({
    // https://github.com/expressjs/session#options
    secret: 'keyboard cat',
    cookie: {
        maxAge: 10000 // ten seconds, for testing
    },
    store: store,
    resave: true,
    saveUninitialized: true
}));

app.use('/', function (req, res, next) {
    var n = req.session.views || 0;
    req.session.views = ++n;
    res.end(n + ' views')
});

app.listen(3000);
