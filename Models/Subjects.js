import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  sem: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Theory', 'Practical'],
    required: true,
  },
  resource: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
  }],
});

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;