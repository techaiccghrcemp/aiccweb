const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireFacultyOrAdmin = require("../middleware/roleMiddleware");
const {
  submitFeedback,
  getActivityFeedback,
} = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", protect, submitFeedback);
router.get("/activity/:activityId", protect, requireFacultyOrAdmin, getActivityFeedback);

module.exports = router;
