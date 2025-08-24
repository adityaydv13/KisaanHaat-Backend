const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  machineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Machinery', required: true },
  name: { type: String, required: true },
  description: { type: String },
});

module.exports = mongoose.model('Cart', CartSchema);
