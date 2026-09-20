const express = require("express");

const {
  createActivity,
  getActivities,
  getManageActivities,
  getActivityById,
  updateActivityStatus,
} = require("../controllers/activityController");

const protect = require("../middleware/authMiddleware");
const requireFacultyOrAdmin = require("../middleware/roleMiddleware");

const router = express.Router();

// Create activity
router.post("/", protect, requireFacultyOrAdmin, createActivity);

// Get all activities for management
router.get("/manage", protect, requireFacultyOrAdmin, getManageActivities);

// Update activity status
router.patch(
  "/:id/status",
  protect,
  requireFacultyOrAdmin,
  updateActivityStatus
);

// Get all activities
router.get("/", getActivities);

// Get single activity
router.get("/:id", getActivityById);

module.exports = router;