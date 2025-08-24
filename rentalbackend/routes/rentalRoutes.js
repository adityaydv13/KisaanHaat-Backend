// routes/rentalRoutes.js
const express = require('express');
const router = express.Router();

// Example: Create a rental request
router.post('/request', (req, res) => {
  const { userId, machineryId, rentalPeriod } = req.body;
  
  // Here you would normally save the rental request to the database
  // For simplicity, we're sending a mock response
  res.status(200).json({ 
    message: 'Rental request created successfully', 
    userId, 
    machineryId, 
    rentalPeriod 
  });
});

// Example: Approve rental request by owner
router.post('/approve', (req, res) => {
  const { rentalId } = req.body;
  
  // Here you would normally update the rental status to "approved" in the database
  // For simplicity, we're sending a mock response
  res.status(200).json({ message: 'Rental request approved', rentalId });
});

module.exports = router;
