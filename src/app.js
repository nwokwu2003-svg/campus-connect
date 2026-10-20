require('dotenv').config();
const express = require('express'),
    cors = require('cors'),
    helmet = require('helmet'),
    rateLimit = require('express-rate-limit');
const errors = require('./middleware/errors');
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : false }));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
}));
app.get('/api/health', (req, res) => res.json({
    success: true,
    message: 'CampusConnect API is running'
}));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/announcements', require('./routes/announcement.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use(errors.notFound);
app.use(errors.errorHandler);
module.exports = app;