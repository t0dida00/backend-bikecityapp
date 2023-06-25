const express = require('express')
const app = express()
const connectToMongoDB = require('./services/databaseConnection');
require("dotenv").config({path:'./.env'})
const DOTENV = process.env
const cors = require('cors');
const tripRoutes= require("./routes/tripRoutes")
const stationRoutes= require("./routes/stationRoutes")

app.use(cors());

connectToMongoDB()

app.get('/', function (req, res) {
  res.send('Welcome to Bike City APIs - The summer project OAMK 2023')
})

app.use("/",tripRoutes)
app.use("/",stationRoutes)

app.listen(DOTENV.SERVER_PORT, () => {
  console.log(`API server running at ${DOTENV.SERVER_HOST}:${DOTENV.SERVER_PORT}/`);
});
