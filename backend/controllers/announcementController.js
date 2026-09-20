const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  try {
    const audience = req.user?.role === "student"
      ? ["all", "students"]
      : req.user?.role === "faculty"
        ? ["all", "faculty"]
        : ["all", "students", "faculty"];
    const announcements = await Announcement.find(req.user ? { audience: { $in: audience } } : {})
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.json({ count: announcements.length, announcements });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({
      message: "Server error while fetching announcements",
    });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const { title, message, audience = "all" } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        message: "Title and message are required",
      });
    }

    const announcement = await Announcement.create({
      title,
      message,
      audience,
      createdBy: req.user.id,
    });

    res.status(201).json({
      message: "Announcement created successfully",
      announcement,
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({
      message: "Server error while creating announcement",
    });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, audience } = req.body;
    if (!title || !message || !["all", "students", "faculty"].includes(audience)) return res.status(400).json({ message: "Title, message and a valid audience are required" });
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    if (req.user.role !== "admin" && announcement.createdBy && String(announcement.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only edit announcements you created" });
    }
    announcement.title = title;
    announcement.message = message;
    announcement.audience = audience;
    await announcement.save();
    res.json({ message: "Announcement updated successfully", announcement });
  } catch (error) { res.status(500).json({ message: "Server error while updating announcement" }); }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    if (req.user.role !== "admin" && announcement.createdBy && String(announcement.createdBy) !== String(req.user.id)) {
      return res.status(403).json({ message: "You can only delete announcements you created" });
    }
    await announcement.deleteOne();
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) { res.status(500).json({ message: "Server error while deleting announcement" }); }
};

module.exports = {
  getAnnouncements,
  createAnnouncement, updateAnnouncement, deleteAnnouncement,
};
