const Trip = require("../models/tripModel")
const formidable = require('formidable');
const { TripFile } = require("../services/fileReader")

function jorneySaver(trips) {
    const batchSize = 100000
    const numTrips = trips.length
    const numBatches = Math.ceil(numTrips / batchSize)
    const batches = Array.from({ length: numBatches }, (_, i) =>
      trips.slice(i * batchSize, (i + 1) * batchSize)
    )
    return Promise.all(
      batches.map(async (batch) => {
        try {
          const results = await Trip.insertMany(batch)
          console.log(`Inserted ${results.length} trips to MongoDB`)
        } catch (error) {
          throw error
        }
      })
    )
  }
  
module.exports = {
    tripsUpdate: async (req, res) => {
        const form = formidable({ multiples: true });
        form.parse(req, (err, fields, files) => {
        
          if (err) {
            next(err);
            return;
          }
          console.log("Reading dataset")
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
    
      }
  }