const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireFacultyOrAdmin = require("../middleware/roleMiddleware");
const {
  markAttendance,
  getMyAttendance,
  getActivityAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

router.post("/mark", protect, requireFacultyOrAdmin, markAttendance);
router.get("/my", protect, getMyAttendance);
router.get(
  "/activity/:activityId",
  protect,
  requireFacultyOrAdmin,
  getActivityAttendance
);

module.exports = router;
