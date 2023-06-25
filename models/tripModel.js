const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
'Departure': {type: Date, },
'Return': {type: Date,},
'Departure station id': {type: Number,},
'Departure station name': {type: String, },
'Return station id': {type: Number,},
'Return station name': {type: String, },
'Covered distance (m)': {type: Number, },
'Duration (sec)': {type: Number } })

const Trip = mongoose.model('journeys', tripSchema);

module.exports = Trip;