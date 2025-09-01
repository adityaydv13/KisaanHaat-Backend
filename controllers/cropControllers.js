// handle bid placement and retrieval
const Bid = require('../models/Bid');
const Post = require('../models/Post');


exports.createBid = async (req, res) => {
  try {
    const { postId, bidAmount } = req.body;

    if (!postId || !bidAmount) {
      return res.status(400).json({ message: "Post ID and bid amount are required" });
    }

    if (!req.user || !req.user.userId) {   // ✅ fixed here
      return res.status(401).json({ message: "Unauthorized: No user found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newBid = new Bid({
      postId: post._id,
      bidAmount,
      bidderId: req.user.userId,   // ✅ fixed here
      ownerId: post.userId,
    });

    await newBid.save();
    res.status(201).json(newBid);
  } catch (error) {
    console.error("Error creating bid:", error);
    res.status(500).json({ message: error.message });
  }
};




// receive bid 

exports.getBids=async (req, res) => {
  try {
    const bids = await Bid.find({ ownerId: req.user.userId })
      .populate("postId", "title") // show crop title
      .populate("bidderId", "name email"); // show bidder details

    res.json(bids);
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// accept or reject bid 

exports.bidAccept=async (req, res) => {
    
  try {
    const { status } = req.body; // "ACCEPTED" or "REJECTED"

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const bid = await Bid.findById(req.params.bidId);
    if (!bid) return res.status(404).json({ message: "Bid not found" });
 console.log("Bid ownerId:", bid.ownerId);
console.log("Logged-in userId:", req.user.userId);
    // Only owner of crop can accept/reject
    if (bid.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    bid.status = status;
    await bid.save();

    res.json(bid);
  } catch (error) {
    console.error("Error updating bid:", error);
    res.status(500).json({ message: "Server error" });
  }
}


// get my bids

// GET /api/crops/bids/my
exports.getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidderId: req.user.userId })
      .populate("postId", "title amount");  // Show crop title and amount
    res.json(bids);
  } catch (error) {
    console.error("Error fetching bidder bids:", error);
    res.status(500).json({ message: "Server error" });
  }
};
