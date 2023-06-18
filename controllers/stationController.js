const Station = require("../models/stationModel")
const formidable = require('formidable');
const Trip = require("../models/tripModel")
const { fieldParser } = require("../services/fieldParser")
const { StationFile } = require("../services/fileReader")


// const parseFields = (fields) => {
//     var searchOptions = {}
//     if (fields["Name"] != undefined) {
//         searchOptions["$or"] = [
//             {
//                 "Name": {
//                     $regex: new RegExp(`^${fields["Name"]}`, "i")
//                 }
//             },
//             {
//                 "Nimi": {
//                     $regex: new RegExp(`^${fields["Name"]}`, "i")
//                 }
//             },
//             {
//                 "Namn": {
//                     $regex: new RegExp(`^${fields["Name"]}`, "i")
//                 }
//             }
//         ];
//     }
//     if (fields["Adress"] != undefined) {
//         searchOptions["$or"] = [
//             {
//                 "Adress": {
//                     $regex: new RegExp(`^${fields["Adress"]}`, "i")
//                 }
//             },
//             {
//                 "Osoite": {
//                     $regex: new RegExp(`^${fields["Adress"]}`, "i")
//                 }
//             }
//         ];
//     }

//     if (fields["departureStart"] || fields["departureEnd"]) {
//         searchOptions["Departure"] = {};
//         if (fields["departureStart"]) {
//             searchOptions["Departure"]["$gte"] = new Date(fields["departureStart"]);
//         }

//         if (fields["departureEnd"]) {
//             searchOptions["Departure"]["$lte"] = new Date(fields["departureEnd"]);
//         }
//     }
//     return searchOptions
// }

module.exports = {
    stationList: async (req, res) => {
        var page_size = req.query.size || 50
        var current_page = (req.query.page - 1) * page_size || 0
        
        try {
            const form = formidable({ multiples: true });
            form.parse(req, async (err, fields, files) => {
                const searchOptions = fieldParser(fields)
                console.log(searchOptions)
                const station_list = await Station.find(searchOptions)
                    .sort({ FID: 1 })
                    .limit(page_size)
                    .skip(current_page)
                var stations_length = await Station.countDocuments(searchOptions)

                if (station_list.length > 0) {
                    const data = {
                        data: station_list,
                        length: stations_length
                    }
                    console.log("Get station list successful !")
                    return res.send(data)
                }
                else {
                    return res.status(404).send("Station not found!");
                }
            })

        } catch (error) {

            return res.status(500).send("Internal Server Error");
        }
    },
    Station: async (req, res) => {
        try {
            var averageDistanceFrom = 0
            var averageDistanceEnd = 0
            var top5ReturnStations = []
            var top5DepartureStations = []
            const form = formidable({ multiples: true });
            form.parse(req, async (err, fields, files) => {
                var station = await Station.find({
                    $or: [
                        { Name: req.params.name },
                        { Nimi: req.params.name },
                        { Namn: req.params.name }
                    ]
                })

                var searchOptions = fieldParser(fields)

                if (station) {
                    //console.log(station[0]["Name"])
                    //Find all trips start from this station
                    //Assign "Departure station name" to searchOptions
                    searchOptions["Departure station name"] = station[0]["Name"]
                    const trips_from_this_station = await Trip.find(searchOptions);
                    //Delete "Departure station name" and reassign "Return station name" to searchOptions
                    delete searchOptions["Departure station name"]
                    searchOptions["Return station name"] = station[0]["Name"]

                    //Find all trips end at this station
                    const trips_end_this_station = await Trip.find(searchOptions)


                    if (trips_from_this_station.length > 0) {
                        let totalDistance = 0;
                        const returnStationCounts = {};

                        trips_from_this_station.forEach((trip) => {
                            //Get total distance from Departure from this station
                            totalDistance += trip["Covered distance (m)"];
                            const returnStationName = trip["Return station name"];
                            returnStationCounts[returnStationName] = (returnStationCounts[returnStationName] || 0) + 1;

                        });
                        averageDistanceFrom = parseFloat(((totalDistance / trips_from_this_station.length) / 1000).toFixed(3));
                        const sortedReturnStations = Object.keys(returnStationCounts).sort((a, b) => {
                            return returnStationCounts[b] - returnStationCounts[a];
                        });
                        top5ReturnStations = sortedReturnStations.slice(0, 5);

                    }
                    if (trips_end_this_station.length > 0) {
                        let totalDistance = 0;
                        const departureStationCounts = {};
                        trips_end_this_station.forEach((trip) => {
                            //Get total distance from Departure from this station
                            totalDistance += trip["Covered distance (m)"];
                            //Get departure station to count the where departures
                            const departureStationName = trip["Departure station name"];
                            departureStationCounts[departureStationName] = (departureStationCounts[departureStationName] || 0) + 1;

                        });
                        averageDistanceEnd = parseFloat(((totalDistance / trips_end_this_station.length) / 1000).toFixed(3));
                        const sortedDepartureStations = Object.keys(departureStationCounts).sort((a, b) => {
                            return departureStationCounts[b] - departureStationCounts[a];
                        });
                        top5DepartureStations = sortedDepartureStations.slice(0, 5);
                    }


                    const data = {
                        "data": station,
                        total_number: {
                            "journeys_starting_from": trips_from_this_station.length,
                            "journeys_ending_at": trips_end_this_station.length
                        },
                        average_distance: {
                            "journeys_starting_from_(km)": averageDistanceFrom,
                            "journeys_ending_at_(km)": averageDistanceEnd,
                        },
                        top_5: {
                            "departure": top5DepartureStations,
                            "return": top5ReturnStations,
                        }

                    }
                    console.log("Get a station successful !")
                    return res.send(data)
                }
                else {
                    console.log("Station not found!");
                    return res.status(404).send("Station not found!");
                }
            })
        } catch (error) {
            console.error(error);
            return res.status(500).send("Internal Server Error");
        }

    },
    stationsUpdate: async (req, res) => {
        const form = formidable({ multiples: true });
        form.parse(req, async (err, fields, files) => {

            if (err) {
               console.log(err)
                return;
            }
            if (files.file) {
                StationFile(files.file.filepath)
                    .then(async data => {
                        const stations = data.map(row => new Station(row))
                        console.log("Uploading stations to database !")
                        await Station.insertMany(stations)
                        console.log(`Inserted station list to succesfully`)
                        return res.send(`Stations uploaded successfully: ${stations.length}`);
                    })
                    .catch(error => {
                        console.log("Stations File upload error.")
                        return res.status(500).send(error)
                    })
            }
            else if (Object.keys(fields).length != 0) {
                var new_station = fields
                
                const last_station = await Station.find().sort({ID: -1 }).limit(1)
                new_station["FID"]=last_station[0]["ID"] + 1
                new_station["ID"]=last_station[0]["ID"] + 1
                try {
                    await Station.create(new_station)
                    console.log(`Inserted 1 station to succesfully`)
                    return res.send(`Inserted 1 station succesfully`)
                } catch (error) {
                    console.log("Single station upload error.")
                    return res.status(500).send("Something is wrong !!!")
                }
            }
            else {
                res.status(404).send("Something is wrong !!!")
            }

        })

    },

}