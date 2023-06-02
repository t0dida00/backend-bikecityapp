const Trip = require("../models/tripModel")
const formidable = require('formidable');
const { TripFile } = require("../services/fileReader")


module.exports = {
  tripsUpdate: async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, (err, fields, files) => {

      if (err) {
        next(err);
        return;
      }
      TripFile(files.file.filepath)
        .then(async data => {
          const trips = data.map(row => new Trip(row))
          console.log("Uploading trips to database !")
          await Trip.insertMany(trips)
          res.send(`Trips uploaded successfully: ${trips.length}`);
        })
        .catch(error => {
          console.log("error here")
          res.status(500).send(error)
        })
    })

  },
  tripList: async (req, res) => {
    try {

      var page_size = req.query.size || 50
      var current_page = (req.query.page - 1) * page_size || 1
      var sort = req.query.sort || "Departure"
      var order = req.query.order || 1

      if (order == "desc") {
        order = -1
      }
      if (sort == "Covered distance (km)") {
        sort = "Covered distance (m)"
      }
      if (sort == "Duration (m)") {
        sort = "Duration (sec)"
      }

      var indexFields = {};
      indexFields[sort] = order;
     
      const journey_list = await Trip.find()
        .limit(page_size)
        .skip(current_page)
        .sort(indexFields)


      var journey_length = await Trip.countDocuments()
      if (journey_list) {
        var list = []
        journey_list.map(journey => {
          journey = journey.toJSON()
          journey["Covered distance (km)"] = parseFloat((journey["Covered distance (m)"] / 1000).toFixed(3));
          journey["Duration (m)"] = parseFloat((journey["Duration (sec)"] / 60).toFixed(2));
          list.push(journey)
        })
        const data = {
          data: list,
          length: journey_length
        }
        console.log("Get journey list successful !")
        return res.send(data)
      }
      else {

        return res.status(404).send("journey not found!");
      }
    } catch (error) {

      return res.status(500).send("Internal Server Error");
    }
  },

}