const r = require('express').Router(),
    c = require('../controllers/announcements.controller'),
    auth = require('../middleware/authenticate'),
    role = require('../middleware/authorize'),
    v = require('../middleware/validate'),
    id = require('../middleware/validateId'),
    s = require('../validators/schemas');
r.use(auth);
r.get('/', v(s.listQuery, 'query'), c.list);
r.get('/:id', id(), c.getOne);
r.post('/', role('admin'), v(s.announcement), c.create);
r.patch('/:id', role('admin'), id(), v(s.announcementPatch), c.update);
r.delete('/:id', role('admin'), id(), c.remove);
module.exports = r;