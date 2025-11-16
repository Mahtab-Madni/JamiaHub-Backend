import mongoose from "mongoose";

const ConnectSchema = new mongoose.Schema({
  name:{
    type: String,
    default: ""
  },
  email:{
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  }
});

const Connect = mongoose.model("Connect", ConnectSchema);

export default Connect;