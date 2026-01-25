import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar','Entertainment','Career','Other'],
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  organizer: {
    type: String,
    required: true,
  },
  attendees:{
    type: Number,
    default: 0
  },
  description:{
    type: String,
    required: true,
  },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;