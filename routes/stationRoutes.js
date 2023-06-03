const express = require("express")
const stationController = require("../controllers/stationController")

const router = express.Router();

router.get("/stations", stationController.stationList)
router.get("/station/:name", stationController.Station)

// router.post("/trips/upload", journeyController.tripsUpdate)

module.exports = router;
