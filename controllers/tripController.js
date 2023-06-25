const Trip = require("../models/tripModel")
const formidable = require('formidable');
const { TripFile } = require("../services/fileReader")
const {fieldParser} = require("../services/fieldParser")

module.exports = {
  tripsUpdate: async (req, res) => {
    const form = formidable({ multiples: true });
    form.parse(req, async (err, fields, files) => {

      if (err) {
        next(err);
        return;
      }
      if (files.file) {
        TripFile(files.file.filepath)
          .then(async data => {
            const trips = data.map(row => new Trip(row))
            console.log("Uploading trips to database !")
            await Trip.insertMany(trips)
            console.log(`Inserted journey list to succesfully`)
            return res.send(`Trips uploaded successfully: ${trips.length}`);
          })
          .catch(error => {
            console.log("Trip File upload error.")
            return res.status(500).send(error)
          })
      }
      else if (Object.keys(fields).length != 0) {
        var new_jorney = fields
        try {
          await Trip.create(new_jorney)
          console.log(`Inserted 1 jorney to succesfully`)
          return res.send(`Inserted 1 jorney succesfully`)
        } catch (error) {
          console.log("Single trip upload error.")
          return res.status(500).send(error)
        }
      }
      else {
        res.status(404).send("Something is wrong !!!")
      }

    })

  },
  tripList: async (req, res) => {
    var page_size = req.query.size || 50
    var current_page = (req.query.page - 1) * page_size || 0
    try {

      const form = formidable({ multiples: true });
      form.parse(req, async (err, fields, files) => {

        console.log(fields)
        const searchOptions = fieldParser(fields)
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
        const journey_list = await Trip.find(searchOptions)
          .limit(page_size)
          .skip(current_page)
          .sort(indexFields)

        var journey_length = await Trip.countDocuments(searchOptions)
        if (journey_list.length > 0) {
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
          return res.status(404).send("Journeys not found!");
        }
      })

    } catch (error) {

      return res.status(500).send("Internal Server Error");
    }
  },


}