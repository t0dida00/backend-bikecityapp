require("dotenv").config({path:'./.env'})
const DOTENV = process.env
const uri = `mongodb+srv://${DOTENV.DATABASE_USER}:${DOTENV.DATABASE_PASSWORD}@${DOTENV.DATABASE_CLUSTER}.x6f8vvf.mongodb.net/${DOTENV.DATABASE_NAME}?retryWrites=true&w=majority`;
const mongoose = require('mongoose');
// connect to your database

function connectToMongoDB() {
mongoose.connect(uri,{ useUnifiedTopology: true,  keepAlive: true, });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to MongoDB');
});
}

module.exports = connectToMongoDB;
