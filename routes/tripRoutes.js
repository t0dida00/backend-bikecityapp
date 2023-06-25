const express = require("express")
const journeyController = require("../controllers/tripController")

const router = express.Router();

router.get("/trips", journeyController.tripList)
router.post("/trips", journeyController.tripList)

router.post("/trips/upload", journeyController.tripsUpdate)

module.exports = router;
