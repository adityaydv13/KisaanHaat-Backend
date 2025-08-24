const mongoose = require("mongoose");

const HireSchema = new mongoose.Schema({
  machineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Machine",
    required: true
  },
  requester: {   // 👈 link to User model
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  hireDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
});

module.exports = mongoose.model("Hire", HireSchema);
