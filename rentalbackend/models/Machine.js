 
const mongoose = require("mongoose");

const MachineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },        // better as Number
  location: { type: String, required: true },
  description: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  imageUrl: { type: String },                     // optional for UI
});

module.exports = mongoose.model("Machine", MachineSchema);
