const { Schema, model } = require('mongoose');

// Defining Schema
const counterSchema = new Schema({
    shortUrlCounter: Number
});

// Creating Model from Schema
const Counter = model('Counter', counterSchema);
module.exports = Counter;