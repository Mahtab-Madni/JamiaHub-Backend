import mongoose from 'mongoose';
import { hash, genSaltSync, compare } from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  branch: {
    type: String,
    enum: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'CS-DS', 'VLSI', 'EE-CE']
  },
  sem: { type: String, enum: ["1", "2", "3", "4", "5", "6", "7", "8"] },
  isOnboarded: { type: Boolean, default: false },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  avatar: {type: String, default: ""}
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, genSaltSync(10));
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await compare(candidatePassword, this.password);
  return isMatch;
};

const User = mongoose.model('User', userSchema);
export default User;