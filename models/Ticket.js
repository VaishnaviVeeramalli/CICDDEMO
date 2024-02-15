const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  frontSeats: {
    booked: Number,
  },
  middleSeats: {
    booked: Number,
  },
  backSeats: {
    booked: Number,
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
