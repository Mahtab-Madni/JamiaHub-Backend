import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema({
  GroupName: { type: String, required: true },
  icon: { type: String, required: true },
  Admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  _id: String,
  streamChatId: String
}, { timestamps: true });


const Group = mongoose.model('Group', GroupSchema);
export default Group;