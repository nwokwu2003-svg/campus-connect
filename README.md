# CampusConnect REST API

A Node.js/Express/MongoDB REST API for student profiles, campus announcements, and complaints.

## Requirements
- Node.js 20+
- MongoDB local or MongoDB Atlas
- npm

## Setup
1. Extract the ZIP and open the `CampusConnect` folder in VS Code.
2. Run `npm install`.
3. Copy `.env.example` to `.env` (PowerShell: `Copy-Item .env.example .env`).
4. Set `MONGODB_URI` and a random `JWT_SECRET` of at least 32 characters.
5. Run `npm run dev`.
6. Health check: `GET http://localhost:5000/api/health`.

## Tests
Run `npm test`. Tests use mongodb-memory-server and may download a MongoDB binary on first run. Capture the actual output as test evidence; don't claim tests passed until they run.

## Roles
- Student: own profile and complaints, read announcements.
- Support: work on complaints; no user administration.
- Admin: user management, announcements, assignments, dashboard.

Public registration always creates students. Bootstrap the first admin through a controlled local database operation, not a public endpoint.

## Routes
Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `PATCH /api/auth/change-password`, `POST /api/auth/logout`.
Users: `GET/PATCH /api/users/me`, `GET /api/users` (admin), `GET /api/users/:id`, `PATCH /api/users/:id/role`, `PATCH /api/users/:id/status`.
Announcements: `GET /api/announcements`, `GET /api/announcements/:id`, admin `POST/PATCH/DELETE /api/announcements`.
Complaints: `POST /api/complaints`, `GET /api/complaints/my`, admin/support `GET /api/complaints`, `GET /api/complaints/:id`, `PATCH /api/complaints/:id/status`, admin `PATCH /api/complaints/:id/assign`, `POST /api/complaints/:id/responses`.
Admin: `GET /api/admin/dashboard`.

## Security design
Passwords are bcrypt-hashed. JWTs expire and include a subject and token version. Middleware reloads the user on each request, checks suspension and token version, and uses the current database role. Profile validation strips unapproved fields. Complaint reads for students filter by both ID and `submittedBy`, preventing IDOR. Logout increments tokenVersion, invalidating older tokens on their next request.

For defense, log in as a student and request `/api/admin/dashboard`: expected HTTP 403. Then try to access another student's complaint ID: expected HTTP 404.

## Production hardening
Review thoroughly before production. Add audit logs, email verification, refresh-token rotation, stricter CORS configuration, and operational monitoring as needed.
