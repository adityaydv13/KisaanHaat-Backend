const mongoose=require("mongoose");

const bidSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  bidderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // crop owner
  bidAmount: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
  createdAt: { type: Date, default: Date.now }
});

module.exports=mongoose.model("Bid",bidSchema);