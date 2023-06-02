const express = require("express")
const journeyController = require("../controllers/tripController")

const router = express.Router();

 router.get("/trips",journeyController.tripList)
// router.get("/trip/:id",jorneyController.Jorney)
// router.post("/upload/trips",uploadController.jorneyUpload)
// router.post("/upload/trip",uploadController.jorneyFormUpload)
router.post("/trips/upload",journeyController.tripsUpdate)

module.exports = router;
