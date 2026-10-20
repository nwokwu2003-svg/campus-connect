const mongoose = require('mongoose');
module.exports = async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing');
  mongoose.set('strictQuery', true);
  await mongoose.connect(process.env.MONGODB_URI);
};
