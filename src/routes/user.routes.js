const r = require('express').Router(),
    c = require('../controllers/users.controller'),
    auth = require('../middleware/authenticate'),
    role = require('../middleware/authorize'),
    v = require('../middleware/validate'),
    id = require('../middleware/validateId'),
    s = require('../validators/schemas');
r.use(auth);
r.get('/me', c.me);
r.patch('/me', v(s.profile), c.updateMe);
r.get('/', role('admin'), v(s.listQuery, 'query'), c.list);
r.get('/:id', id(), c.getById);
r.patch('/:id/role', role('admin'), id(), v(s.role), c.updateRole);
r.patch('/:id/status', role('admin'), id(), v(s.userStatus), c.updateStatus);
module.exports = r;