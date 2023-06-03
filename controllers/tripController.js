const Trip = require("../models/tripModel")
const formidable = require('formidable');
const { TripFile } = require("../services/fileReader")

const parseFields = (fields) => {
  var searchOptions = {}
  if (fields["departureStationName"] != undefined) {
    searchOptions["Departure station name"] = {
      $regex: new RegExp(`^${fields["departureStationName"]}`, "i")
    };
  }
  if (fields["returnStationName"] != undefined) {
    searchOptions["Return station name"] = {
      $regex: new RegExp(`^${fields["returnStationName"]}`, "i")
    };
  }
  if (fields["durationMin"] || fields["durationMax"]) {
    searchOptions["Duration (sec)"] = {};

    if (fields["durationMin"]) {
      searchOptions["Duration (sec)"]["$gte"] = parseInt(fields["durationMin"]);
    }

    if (fields["durationMax"]) {
      searchOptions["Duration (sec)"]["$lte"] = parseInt(fields["durationMax"]);
    }
  }
  if (fields["coveredDistanceMin"] || fields["coveredDistanceMax"]) {
    searchOptions["Covered distance (m)"] = {};

    if (fields["coveredDistanceMin"]) {
      searchOptions["Covered distance (m)"]["$gte"] = parseInt(fields["coveredDistanceMin"]);
    }

    if (fields["coveredDistanceMax"]) {
      searchOptions["Covered distance (m)"]["$lte"] = parseInt(fields["coveredDistanceMax"]);
    }
  }

  
  return searchOptions
}
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
    try {

      const form = formidable({ multiples: true });
      form.parse(req, async (err, fields, files) => {

        const searchOptions = parseFields(fields)
        var page_size = req.query.size || 50
        var current_page = (req.query.page - 1) * page_size || 0
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
        console.log(searchOptions,indexFields)

        const journey_list = await Trip.find(searchOptions)
          .limit(page_size)
          .skip(current_page)
          .sort(indexFields)
        console.log(journey_list.length)
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