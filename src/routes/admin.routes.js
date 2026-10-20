const r = require('express').Router(),
    auth = require('../middleware/authenticate'),
    role = require('../middleware/authorize'),
    c = require('../controllers/admin.controller');
r.use(auth, role('admin'));
r.get('/dashboard', c.dashboard);
module.exports = r;