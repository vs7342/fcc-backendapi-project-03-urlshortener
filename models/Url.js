const { Schema, model } = require('mongoose');

// Defining Schema
const urlSchema = new Schema({
    originalUrl: String,
    shortUrl: Number
});

// Creating Model from Schema
const Url = model('Url', urlSchema);
module.exports = Url;