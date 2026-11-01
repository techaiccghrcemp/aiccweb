const express = require("express");
const protect = require("../middleware/authMiddleware");
const { requireRoles } = require("../middleware/roleMiddleware");
const { getStats, getUsers, updateUser, getRecords, updateRegistration } = require("../controllers/adminController");
const { createTeamMember, deleteTeamMember, getTeamMembers } = require("../controllers/teamController");
const { parseTeamPhoto } = require("../middleware/teamPhotoUpload");
const { uploadClubLogo, deleteClubLogo } = require("../controllers/clubController");
const { parseClubLogo } = require("../middleware/clubLogoUpload");

const router = express.Router();
const requireAdmin = requireRoles("admin");

router.use(protect, requireAdmin);
router.get("/stats", getStats);
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.patch("/registrations/:id", updateRegistration);
router.get("/records", getRecords);
router.get("/team-members", getTeamMembers);
router.post("/team-members", parseTeamPhoto, createTeamMember);
router.delete("/team-members/:id", deleteTeamMember);
router.put("/club/logo", parseClubLogo, uploadClubLogo);
router.delete("/club/logo", deleteClubLogo);

module.exports = router;
