const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    photos: {
        type: String,
        default: ''
    },
    time: {
        type: String,
        default: ''
    },
    topic: {
        type: String,
        default: ''
    }
});