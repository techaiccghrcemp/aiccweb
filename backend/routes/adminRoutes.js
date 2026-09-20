const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const { getStats, getUsers, updateUser, getRecords, updateRegistration } = require("../controllers/adminController");

const router = express.Router();
const requireAdmin = requireRoles("admin");

router.use(protect, requireAdmin);
router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.patch("/registrations/:id", updateRegistration);
router.get("/records", getRecords);

module.exports = router;
