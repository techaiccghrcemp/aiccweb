const express = require("express");
const protect = require("../middleware/authMiddleware");
const requireFacultyOrAdmin = require("../middleware/roleMiddleware");
const {
  createCertificate,
  getMyCertificates,
  verifyCertificate,
} = require("../controllers/certificateController");

const router = express.Router();

router.post("/", protect, requireFacultyOrAdmin, createCertificate);
router.get("/my", protect, getMyCertificates);
router.get("/:certificateId", verifyCertificate);

module.exports = router;
