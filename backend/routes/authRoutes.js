const express = require("express");

const {
  registerUser,
  loginUser,
  updateProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

// Protected profile route
router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ message: "Profile loaded successfully", user });
});

router.patch("/profile", protect, updateProfile);

module.exports = router;