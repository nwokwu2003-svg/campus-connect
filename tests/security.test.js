const mongoose = require('mongoose'),
    request = require('supertest'),
    { MongoMemoryServer } = require('mongodb-memory-server'),
    jwt = require('jsonwebtoken');
const app = require('../src/app'),
    User = require('../src/models/User'),
    Complaint = require('../src/models/Complaint');
let mongo, a, b, admin, support, tokenA, tokenB, adminToken, supportToken;

function token(u) { return jwt.sign({ sub: u._id.toString(), role: u.role, ver: u.tokenVersion }, process.env.JWT_SECRET, { expiresIn: '1h', issuer: 'campusconnect-api' }); }
async function signup(name, email) { return request(app).post('/api/auth/register').send({ name, email, password: 'StrongPass123!' }); }
beforeAll(async() => {
    process.env.JWT_SECRET = 'test_secret_for_campusconnect_tests_123456789';
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
});
afterEach(async() => { await Promise.all(Object.values(mongoose.connection.collections).map(c => c.deleteMany({}))); });
afterAll(async() => {
    await mongoose.disconnect();
    await mongo.stop();
});
beforeEach(async() => {
    const ra = await signup('Student A', 'a@example.com'),
        rb = await signup('Student B', 'b@example.com');
    a = await User.findById(ra.body.data.user._id);
    b = await User.findById(rb.body.data.user._id);
    tokenA = ra.body.data.token;
    tokenB = rb.body.data.token;
    admin = await User.create({ name: 'Admin', email: 'admin@example.com', password: 'StrongPass123!', role: 'admin' });
    support = await User.create({ name: 'Support', email: 'support@example.com', password: 'StrongPass123!', role: 'support' });
    adminToken = token(admin);
    supportToken = token(support);
});
test('public registration cannot elevate role and never returns hash', async() => {
    const r = await request(app).post('/api/auth/register').send({ name: 'Evil User', email: 'evil@example.com', password: 'StrongPass123!', role: 'admin' });
    expect(r.status).toBe(201);
    expect(r.body.data.user.role).toBe('student');
    expect(JSON.stringify(r.body)).not.toContain('$2');
});
test('missing and malformed tokens are rejected', async() => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);
    expect((await request(app).get('/api/auth/me').set('Authorization', 'Bearer nonsense')).status).toBe(401);
});
test('expired token is rejected', async() => {
    const expired = jwt.sign({ sub: a._id.toString(), ver: a.tokenVersion }, process.env.JWT_SECRET, { expiresIn: -1 });
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${expired}`)).status).toBe(401);
});
test('suspended account is blocked with old token', async() => {
    a.status = 'suspended';
    await a.save();
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokenA}`)).status).toBe(403);
});
test('student cannot read another student complaint', async() => {
    const c = await Complaint.create({ title: 'Private complaint', description: 'This complaint has a long enough description', category: 'Academic', submittedBy: b._id });
    expect((await request(app).get(`/api/complaints/${c._id}`).set('Authorization', `Bearer ${tokenA}`)).status).toBe(404);
});
test('student and support cannot access admin dashboard', async() => {
    expect((await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${tokenA}`)).status).toBe(403);
    expect((await request(app).get('/api/admin/dashboard').set('Authorization', `Bearer ${supportToken}`)).status).toBe(403);
});
test('invalid IDs rejected', async() => {
    expect((await request(app).get('/api/complaints/bad-id').set('Authorization', `Bearer ${tokenA}`)).status).toBe(400);
});
test('student cannot mark own complaint resolved', async() => {
    const c = await Complaint.create({ title: 'My complaint', description: 'This complaint has a long enough description', category: 'Finance', submittedBy: a._id });
    expect((await request(app).patch(`/api/complaints/${c._id}/status`).set('Authorization', `Bearer ${tokenA}`).send({ status: 'Resolved' })).status).toBe(403);
});
test('logout revokes the previous token', async() => {
    expect((await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${tokenA}`)).status).toBe(200);
    expect((await request(app).get('/api/auth/me').set('Authorization', `Bearer ${tokenA}`)).status).toBe(401);
});