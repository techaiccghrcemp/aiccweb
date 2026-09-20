const User = require("../models/User");
const Activity = require("../models/Activity");
const Registration = require("../models/Registration");
const Attendance = require("../models/Attendance");
const Certificate = require("../models/Certificate");
const Announcement = require("../models/Announcement");
const Feedback = require("../models/Feedback");

const getStats = async (req, res) => {
  try {
    const [students, faculty, activities, publishedActivities, registrations, attendance, certificates, announcements, feedback] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      Activity.countDocuments(),
      Activity.countDocuments({ status: "published" }),
      Registration.countDocuments({ status: "registered" }),
      Attendance.countDocuments(),
      Certificate.countDocuments(),
      Announcement.countDocuments(),
      Feedback.countDocuments(),
    ]);
    res.json({ stats: { students, faculty, activities, publishedActivities, registrations, attendance, certificates, announcements, feedback } });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Server error while loading statistics" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error while loading users" });
  }
};

const updateUser = async (req, res) => {
  try {
    const allowed = ["name", "department", "year", "phone", "role"];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => allowed.includes(key) && value !== undefined));
    if (updates.role && !["student", "faculty", "admin"].includes(updates.role)) return res.status(400).json({ message: "Invalid role" });
    if (String(req.user.id) === req.params.id && updates.role && updates.role !== "admin") return res.status(400).json({ message: "You cannot remove your own admin role" });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error while updating user" });
  }
};

const getRecords = async (req, res) => {
  try {
    const [attendance, certificates, feedback, registrations, activities, announcements] = await Promise.all([
      Attendance.find().populate("student", "name email studentId").populate("activity", "title date").sort({ createdAt: -1 }),
      Certificate.find().populate("student", "name email studentId").populate("activity", "title date").sort({ issuedAt: -1 }),
      Feedback.find().populate("student", "name email studentId").populate("activity", "title date").sort({ createdAt: -1 }),
      Registration.find().populate("student", "name email studentId").populate("activity", "title date venue").sort({ registeredAt: -1 }),
      Activity.find().sort({ createdAt: -1 }),
      Announcement.find().populate("createdBy", "name role").sort({ createdAt: -1 }),
    ]);
    res.json({ attendance, certificates, feedback, registrations, activities, announcements });
  } catch (error) {
    console.error("Get admin records error:", error);
    res.status(500).json({ message: "Server error while loading records" });
  }
};

const updateRegistration = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["registered", "cancelled", "waitlisted"].includes(status)) {
      return res.status(400).json({ message: "Invalid registration status" });
    }
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("student", "name email studentId").populate("activity", "title date");
    if (!registration) return res.status(404).json({ message: "Registration not found" });
    res.json({ message: "Registration status updated", registration });
  } catch (error) {
    console.error("Update registration error:", error);
    res.status(500).json({ message: "Server error while updating registration" });
  }
};

module.exports = { getStats, getUsers, updateUser, getRecords, updateRegistration };
