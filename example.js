const express = require('express');
const app = express();

const session = require('express-session');
const RDBStore = require('session-rethinkdb')(session);

const options = {
    servers: [
        {host: 'localhost', port: 28015}
    ],
    cleanupInterval: 60000, // optional, default is 60000 (60 seconds)
    table: 'session' // optional, default is 'session'
};

const store = new RDBStore(options);

app.use(session({
    secret: 'keyboard cat',
    cookie: {
        maxAge: 10000 // ten seconds, for testing
    },
    store: store
}));

var count = 0;

app.use('/', function (req, res, next) {
    var n = req.session.views || 0;
    req.session.views = ++n;
    res.end(n + ' views')
});

app.listen(3000);
