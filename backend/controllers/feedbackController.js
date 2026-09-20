const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const Feedback = require("../models/Feedback");
const Registration = require("../models/Registration");

const submitFeedback = async (req, res) => {
  try {
    const { activityId, rating, comment } = req.body;
    const numericRating = Number(rating);

    if (!activityId || !rating) {
      return res.status(400).json({
        message: "Activity and rating are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const registration = await Registration.findOne({
      student: req.user.id,
      activity: activityId,
      status: "registered",
    });

    if (!registration) {
      return res.status(403).json({
        message: "You can only review activities you registered for",
      });
    }

    const existingFeedback = await Feedback.findOne({
      student: req.user.id,
      activity: activityId,
    });

    if (existingFeedback) {
      return res.status(409).json({
        message: "You have already submitted feedback for this activity",
      });
    }

    const feedback = await Feedback.create({
      student: req.user.id,
      activity: activityId,
      rating: numericRating,
      comment,
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already submitted feedback for this activity",
      });
    }

    res.status(500).json({ message: "Server error while submitting feedback" });
  }
};

const getActivityFeedback = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.activityId)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }

    const feedback = await Feedback.find({ activity: req.params.activityId })
      .populate("student", "name")
      .sort({ createdAt: -1 });

    res.json({ count: feedback.length, feedback });
  } catch (error) {
    console.error("Get feedback error:", error);
    res.status(500).json({ message: "Server error while fetching feedback" });
  }
};

module.exports = {
  submitFeedback,
  getActivityFeedback,
};
