const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
'Departure': {type: Date, required: true},
'Return': {type: Date, required: true},
'Departure station id': {type: Number, required: true},
'Departure station name': {type: String, required: true},
'Return station id': {type: Number, required: true},
'Return station name': {type: String, required: true},
'Covered distance (m)': {type: Number, required: true},
'Duration (sec.)': {type: Number, required: true} })

const Trip = mongoose.model('journeys', tripSchema);

module.exports = Trip;