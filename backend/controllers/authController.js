const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// =========================
// REGISTER USER
// =========================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      studentId,
      department,
      year,
      phone,
    } = req.body;

    // Check required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      studentId,
      department,
      year,
      phone,
    });

    res.status(201).json({
      message: "Student registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error during registration",
    });
  }
};

// =========================
// LOGIN USER
// =========================
const loginUser = async (req, res) => {
  try {
    const { email, password, selectedRole } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (selectedRole && ["student", "faculty", "admin"].includes(selectedRole) && user.role !== selectedRole) {
      const roleNames = { student: "Student", faculty: "Faculty", admin: "Admin" };
      return res.status(403).json({
        message: `These credentials do not belong to a ${roleNames[selectedRole]} account.`,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Send response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "department", "year", "phone"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
    );

    if (updates.name !== undefined && !String(updates.name).trim()) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error while updating profile" });
  }
};

// =========================
// EXPORT FUNCTIONS
// =========================
module.exports = {
  registerUser,
  loginUser,
  updateProfile,
};