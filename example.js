const express = require('express');
const app = express();

const session = require('express-session');
const RDBStore = require('session-rethinkdb')(session);

const options = {
    servers: [
        {host: 'localhost', port: 28015},
    ],
    cleanupInterval: 60000,
    table: 'session'
};

const store = new RDBStore(options);

app.use(session({
  secret: 'keyboard cat',
  cookie: {
    maxAge: 10000
  },
  store: store
}));

var count = 0;

app.get('/', function (req, res, next) {
  req.session.count = count++;
  
  res.send(req.session);
})

app.listen(3000);