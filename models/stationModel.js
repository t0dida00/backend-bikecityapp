const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  FID: { type: Number, required: true },
  ID: { type: Number, required: true },
  Nimi: { type: String, required: true },
  Namn: { type: String, required: true },
  Name: { type: String, required: true },
  Osoite: { type: String, required: true },
  Adress: { type: String, required: true },
  Kaupunki: { type: String, required: false },
  Stad: { type: String, required: false },
  Operaattor: { type: String, required: false },
  Kapasiteet: { type: Number, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

const Station = mongoose.model('Stations', stationSchema);

module.exports = Station;