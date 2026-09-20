const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

feedbackSchema.index(
  { student: 1, activity: 1 },
  { unique: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);