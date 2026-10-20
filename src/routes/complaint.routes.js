const r = require('express').Router(),
    c = require('../controllers/complaints.controller'),
    auth = require('../middleware/authenticate'),
    role = require('../middleware/authorize'),
    v = require('../middleware/validate'),
    id = require('../middleware/validateId'),
    s = require('../validators/schemas');
r.use(auth);
r.post('/', role('student'), v(s.complaint), c.create);
r.get('/my', role('student'), v(s.listQuery, 'query'), c.mine);
r.get('/', role('admin', 'support'), v(s.listQuery, 'query'), c.list);
r.get('/:id', id(), c.getOne);
r.patch('/:id/status', role('admin', 'support'), id(), v(s.status), c.updateStatus);
r.patch('/:id/assign', role('admin'), id(), v(s.assign), c.assign);
r.post('/:id/responses', id(), v(s.response), c.addResponse);
module.exports = r;