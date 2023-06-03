const express = require("express")
const stationController = require("../controllers/stationController")

const router = express.Router();

router.get("/stations", stationController.stationList)
router.get("/station/:name", stationController.Station)
 router.post("/stations/upload", stationController.stationsUpdate)

module.exports = router;
