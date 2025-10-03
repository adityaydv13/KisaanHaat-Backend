const express = require('express');
const router = express.Router();
const { createBid, getBids, bidAccept ,getMyBids} = require('../controllers/cropControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Route to place a bid on a crop post
// router.post('/bids', createBid);

// Route to get all bids for a specific crop post
 
router.get('/received', authMiddleware, getBids); 
router.post('/',authMiddleware,createBid);
router.patch('/:bidId',authMiddleware, bidAccept);
router.get('/mybids',authMiddleware, getMyBids);


module.exports = router;
