// const express = require("express");
// const router = express.Router();
// const Hire = require("../models/Hire");
// const Machine = require("../models/Machine");
// const authMiddleware = require("../../middleware/authMiddleware");

// // POST: Hire a machine
// // router.post("/",authMiddleware, async (req, res) => {
// //   try {
// //     const { machineId, requesterId } = req.body;

// //     if (!machineId || !requesterId) {
// //       return res.status(400).json({ message: "machineId and requesterId are required" });
// //     }

// //     const hireRequest = new Hire({
// //       machineId,
// //       requester: requesterId,   // 🔑 must map to "requester"
// //       status: "pending",
// //     });

// //     await hireRequest.save();
// //     res.json(hireRequest);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });
// router.post("/", authMiddleware, async (req, res) => {
//   try {
//     const { machineId } = req.body;
//     const requester = req.user.userId; // get user from JWT

//     if (!machineId || !requester) {
//       return res.status(400).json({ message: "machineId and requester are required" });
//     }

//     const newHire = new Hire({
//       machineId,
//       requester
//     });

//     await newHire.save();
//     res.status(201).json({ message: "Hire request sent", hire: newHire });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // GET: all requests for the logged-in user's machines
// // router.get("/my-requests/:userId", async (req, res) => {
// //   try {
// //     const machines = await Machine.find({ ownerId: req.params.userId });
// //     const machineIds = machines.map((m) => m._id);

// //     const requests = await Hire.find({ machineId: { $in: machineIds } })
// //       .populate("machineId")                // get machine details
// //       .populate("requester", "name email"); // get requester details (name, email)

// //     res.json(requests);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });
 
// // ✅ Only logged-in user's requests will be fetched
// // router.get("/my-requests", authMiddleware, async (req, res) => {
// //   try {
// //     const ownerId = req.user.userId; // comes from JWT payload

// //     // get machines owned by this user
// //     const machines = await Machine.find({ ownerId });
// //     const machineIds = machines.map((m) => m._id);

// //     // get only requests for these machines
// //     const requests = await Hire.find({ machineId: { $in: machineIds } })
// //       .populate("machineId", "name price location")  // show limited machine details
// //       .populate("requesterId", "name email");        // show requester info

// //     res.json(requests);
// //   } catch (err) {
// //     console.error("❌ Error fetching hire requests:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // });
// router.get("/my-requests", authMiddleware, async (req, res) => {
//   try {
//     // 1️⃣ Get all machines owned by this logged-in user
//     const machines = await Machine.find({ ownerId: req.user.userId });
//     const machineIds = machines.map((m) => m._id);

//     // 2️⃣ Find hire requests for these machines
//     const requests = await Hire.find({ machineId: { $in: machineIds } })
//       .populate("machineId")                // machine details
//       .populate("requester", "name email"); // requester details

//     res.json(requests);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });




// // PUT: approve/reject a request
// router.put("/:requestId", async (req, res) => {
//   const { status } = req.body;
//   if (!["approved", "rejected"].includes(status)) {
//     return res.status(400).json({ message: "Invalid status" });
//   }

//   try {
//     const updated = await Hire.findByIdAndUpdate(
//       req.params.requestId,
//       { status },
//       { new: true }
//     ).populate("machineId").populate("requester", "name email");

//     res.json({ message: `Request ${status}`, request: updated });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const Hire = require("../models/Hire");
const Machine = require("../models/Machine");
const authMiddleware = require("../../middleware/authMiddleware");

// ------------------ Create a hire request ------------------
router.post("/", authMiddleware, async (req, res) => {
  const { machineId } = req.body;
  const requesterId = req.user.userId;

  if (!machineId) {
    return res.status(400).json({ message: "machineId is required" });
  }

  try {
    const machine = await Machine.findById(machineId);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    const newHire = new Hire({
      machineId,
      requester: requesterId
    });

    await newHire.save();
    res.status(201).json({ message: "Hire request sent successfully", hire: newHire });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Get hire requests for machines owned by logged-in user ------------------
router.get("/my-requests", authMiddleware, async (req, res) => {
  try {
    // Get all machines owned by the user
    const machines = await Machine.find({ ownerId: req.user.userId });
    const machineIds = machines.map(m => m._id);

    const requests = await Hire.find({ machineId: { $in: machineIds } })
      .populate("machineId", "name price location")
      .populate("requester", "name email");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Update hire request status ------------------
router.put("/:hireId", authMiddleware, async (req, res) => {
  const { hireId } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const hire = await Hire.findById(hireId).populate("machineId");

    if (!hire) return res.status(404).json({ message: "Hire request not found" });
    if (hire.machineId.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    hire.status = status;
    await hire.save();

    res.json({ message: "Request updated", hire });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
