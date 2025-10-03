const express = require('express');
const { register, login,updateUser,getUser } = require('../controllers/authController');
const router = express.Router();

// Register route
router.post('/register', register);
const protect = require('../middleware/authMiddleware'); // Ensure the correct path to your middleware file
const  deleteUser =require("../controllers/authController").deleteUser;
// Login route
router.post('/login', login);
router.put('/update', protect, updateUser);
router.get('/profile', protect, getUser); // Protected route to get user details

// Delete account route (only authenticated user)
router.delete("/:id", protect, deleteUser);

// verified google login
const { googleAuth } = require("../controllers/authController");
router.post("/google", googleAuth);

module.exports = router;



 