const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");

router.post("/chat", aiController.chat);
router.post("/analyze-expenses", aiController.analyzeExpenses);
router.get("/health", aiController.getHealth);

module.exports = router;
