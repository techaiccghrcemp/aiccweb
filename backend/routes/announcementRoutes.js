const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireFacultyOrAdmin = require("../middleware/roleMiddleware");
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

const router = express.Router();

router.get("/", protect, getAnnouncements);
router.post("/", protect, requireFacultyOrAdmin, createAnnouncement);
router.patch("/:id", protect, requireFacultyOrAdmin, updateAnnouncement);
router.delete("/:id", protect, requireFacultyOrAdmin, deleteAnnouncement);

module.exports = router;
