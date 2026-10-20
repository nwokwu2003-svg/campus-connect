require('dotenv').config();
const app = require('./app'),
    connect = require('./config/database');
async function start() {
    try {
        await connect();
        const port = Number(process.env.PORT) || 5000;
        app.listen(port, () => console.log(`CampusConnect API listening on ${port}`));
    } catch (e) {
        console.error('Startup failed:', e.message);
        process.exit(1);
    }
}
if (require.main === module) start();
module.exports = start;