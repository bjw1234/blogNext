const mongoose = require('mongoose');
const photoSchema = require('../schemas/photoSch');

module.exports = mongoose.model('photo', photoSchema);