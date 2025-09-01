const Hire = require("../models/Hire");


exports.getMyhired=async (req, res) => {
  try {
    const hires = await Hire.find({
      requester: req.user.userId,   // only hires requested by this user
      status: "approved"            // only approved ones
    })
    .populate("machineId", "name price location")
    .populate("requester", "name")
    .sort({ hireDate: -1 }); // latest first
 
    res.json(hires);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteHire=async (req, res) => {
  try {
    const hireId = req.params.id;
    const hire = await Hire.findById(hireId);
    console.log("Looking for hireId:", hireId, "Found:", hire);
    if (!hire) {
      return res.status(404).json({ message: "Hire not found" });
    }
    if (hire.requester.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    } 
    await Hire.findByIdAndDelete(hireId);
    res.json({ message: "Hire deleted" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  } 
}



