const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const getMyhired = require("../controllers/getHired").getMyhired;


router.get("/my-hires", authMiddleware, getMyhired);
router.delete("/:id", authMiddleware, require("../controllers/getHired").deleteHire);
module.exports = router;