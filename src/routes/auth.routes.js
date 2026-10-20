const r = require('express').Router(),
    c = require('../controllers/auth.controller'),
    auth = require('../middleware/authenticate'),
    v = require('../middleware/validate'),
    s = require('../validators/schemas');
r.post('/register', v(s.register), c.register);
r.post('/login', v(s.login), c.login);
r.get('/me', auth, c.me);
r.patch('/change-password', auth, v(s.changePassword), c.changePassword);
r.post('/logout', auth, c.logout);
module.exports = r;