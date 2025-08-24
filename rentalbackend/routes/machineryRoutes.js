const express = require('express');
const router = express.Router();
const Machinery = require('../models/Machine'); // Import Machinery model
const Cart = require('../models/Cart'); // ✅ Import Cart model
const authMiddleware = require('../../middleware/authMiddleware'); // ✅ Import auth middleware
// 🔎 Search for a machine by name
router.get('/', async (req, res) => {
  try {
    console.log('Received Query:', req.query); // Debugging
    const { name } = req.query;

    if (!name) {
      console.log('No name provided');
      return res.status(400).json({ message: 'Machine name is required' });
    }

    const trimmedName = name.trim();
    console.log('Searching for:', trimmedName);

    // ✅ Case-insensitive search in MongoDB
    const machinery = await Machinery.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (!machinery) {
      console.log('Machine not found:', trimmedName);
      return res.status(404).json({ message: 'Machine does not exist' });
    }

    console.log('Machine found:', machinery);
    res.json(machinery);
  } catch (error) {
    console.error('Error fetching machinery:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🛒 Add item to cart
router.post('/cart', async (req, res) => {
  try {
    console.log("Received cart request:", req.body); // ✅ Debugging

    const { machineId, name, description } = req.body;

    console.log("Received values: ", { machineId, name, description }); // ✅ Debug log

    if (!machineId || !name) {
      console.log("Error: Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newCartItem = new Cart({
      machineId,
      name,
      description: description || "No description provided",
    });

    await newCartItem.save();
    console.log("Cart item saved successfully:", newCartItem);

    res.status(201).json({ message: 'Item added to cart successfully', cartItem: newCartItem });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
});
// 🚜 Add new machine
router.post("/", authMiddleware, async (req, res) => {
  console.log("Body:", req.body); // 🔍 Add this line
  console.log("User ID:", req.user.userId);
  const { machineName, name, price, location, description } = req.body;

  // ✅ Fallback: use machineName if provided, otherwise use name
  const finalName = machineName || name;

  if (!finalName) {
    return res.status(400).json({ message: "Machine name is required" });
  }

  try {
    const newMachine = new Machinery({
      name: finalName,
      price,
      location,
      description,
      ownerId: req.user.userId,
    });

    await newMachine.save();
    console.log("✅ Machine added:", newMachine);
    res.status(201).json({ message: "Machine added successfully", newMachine });
  } catch (error) {
    console.error("❌ Error saving machine:", error);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
