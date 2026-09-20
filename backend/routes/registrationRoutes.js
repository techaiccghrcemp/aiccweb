const express = require("express");

const {
  registerForActivity,
  getMyRegistrations,
  deleteRegistration,
  getActivityRegistrations,
} = require("../controllers/registrationController");
const protect = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const requireStudent = requireRoles("student");
const requireFacultyOrAdmin = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/activity/:activityId", protect, requireStudent, registerForActivity);
router.get("/my", protect, requireStudent, getMyRegistrations);
router.delete("/:id", protect, requireStudent, deleteRegistration);
router.get("/activity/:activityId", protect, requireFacultyOrAdmin, getActivityRegistrations);

module.exports = router;
