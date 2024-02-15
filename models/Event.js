const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  eventDateTime: {
    type: Date,
    required: true,
  },
  description: String,
  frontSeats: {
    quantity: Number,
    price: Number,
    booked: Number,
  },
  middleSeats: {
    quantity: Number,
    price: Number,
    booked: Number,
  },
  backSeats: {
    quantity: Number,
    price: Number,
    booked: Number,
  },
  imagePath: String, // Store the path to the uploaded image
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
