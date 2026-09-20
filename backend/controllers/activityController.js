const Activity = require("../models/Activity");

const allowedStatuses = [
  "pending",
  "approved",
  "published",
  "completed",
  "cancelled",
];

// Create Activity
const createActivity = async (req, res) => {
  try {
    const activity = await Activity.create({
      ...req.body,
      createdBy: req.user.id,
      status: "pending",
    });

    res.status(201).json({
      message: "Activity created successfully",
      activity,
    });
  } catch (error) {
    console.error("Create activity error:", error);

    res.status(500).json({
      message: "Server error while creating activity",
    });
  }
};

// Get all activities
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({
      status: { $in: ["published", "approved"] },
    }).sort({ date: 1 });

    res.json({
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    res.status(500).json({
      message: "Server error while fetching activities",
    });
  }
};

const getManageActivities = async (req, res) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { $or: [{ createdBy: req.user.id }, { createdBy: { $exists: false } }] };
    const activities = await Activity.find(filter).sort({ date: 1, createdAt: -1 });

    res.json({
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get manage activities error:", error);

    res.status(500).json({
      message: "Server error while fetching managed activities",
    });
  }
};

// Get single activity
const getActivityById = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    if (!["published", "approved"].includes(activity.status)) {
      return res.status(404).json({ message: "Activity not found" });
    }

    res.json(activity);
  } catch (error) {
    console.error("Get activity error:", error);

    res.status(500).json({
      message: "Server error while fetching activity",
    });
  }
};

const updateActivityStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid activity status",
      });
    }

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    if (req.user.role !== "admin" && activity.createdBy && String(activity.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only manage activities you created" });
    }

    activity.status = status;
    await activity.save();

    res.json({
      message: "Activity status updated successfully",
      activity,
    });
  } catch (error) {
    console.error("Update activity status error:", error);
    res.status(500).json({
      message: "Server error while updating activity status",
    });
  }
};

module.exports = {
  createActivity,
  getActivities,
  getManageActivities,
  getActivityById,
  updateActivityStatus,
};