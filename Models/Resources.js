import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CS-DS', 'VLSI', 'EE-CE']
  },
  sem: { 
    type: String,
    required: true,
    enum: ["1", "2", "3", "4", "5", "6", "7", "8"]
  },
  type: { type: String, enum: ['Notes','PYQs','VideoLinks','Books','LabWorks','LabManuals'], required: true},
  subjectCode: { type: String, required: true },  
  title: { type: String, required: true },
  link: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;