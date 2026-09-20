const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Registration = require("../models/Registration");

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const markAttendance = async (req, res) => {
  try {
    const { studentId, activityId, status = "present" } = req.body;

    if (!studentId || !activityId) {
      return res.status(400).json({
        message: "Student ID and activity ID are required",
      });
    }

    if (!isValidId(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    if (req.user.role !== "admin" && activity.createdBy && String(activity.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only manage attendance for your activities" });
    }

    const student = isValidId(studentId)
      ? await User.findById(studentId)
      : await User.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!["present", "absent"].includes(status)) {
      return res.status(400).json({ message: "Attendance status must be present or absent" });
    }

    const registration = await Registration.findOne({
      student: student._id,
      activity: activityId,
      status: "registered",
    });
    if (!registration) {
      return res.status(400).json({ message: "Attendance can only be marked for a registered student" });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { student: student._id, activity: activityId },
      { status, checkedInAt: status === "present" ? new Date() : null },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      message: `Attendance marked ${status}`,
      attendance,
    });
  } catch (error) {
    console.error("Mark attendance error:", error);

    res.status(500).json({ message: "Server error while marking attendance" });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.user.id })
      .populate("activity")
      .sort({ checkedInAt: -1, createdAt: -1 });

    res.json({ count: attendance.length, attendance });
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ message: "Server error while fetching attendance" });
  }
};

const getActivityAttendance = async (req, res) => {
  try {
    if (!isValidId(req.params.activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }

    const activity = await Activity.findById(req.params.activityId).select("createdBy");
    if (!activity) return res.status(404).json({ message: "Activity not found" });
    if (req.user.role !== "admin" && activity.createdBy && String(activity.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only view attendance for your activities" });
    }

    const attendance = await Attendance.find({
      activity: req.params.activityId,
    })
      .populate("student", "name email studentId")
      .populate("activity", "title date")
      .sort({ checkedInAt: -1, createdAt: -1 });

    res.json({ count: attendance.length, attendance });
  } catch (error) {
    console.error("Get activity attendance error:", error);
    res.status(500).json({ message: "Server error while fetching attendance" });
  }
};

module.exports = {
  markAttendance,
  getMyAttendance,
  getActivityAttendance,
};
