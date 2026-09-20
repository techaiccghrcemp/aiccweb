const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Workshop",
        "Hackathon",
        "Seminar",
        "Competition",
        "Cultural",
        "Sports",
        "Club Activity",
        "Other",
      ],
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      required: true,
    },

    venue: {
      type: String,
      required: true,
    },

    organizer: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    registrationDeadline: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "published", "completed", "cancelled"],
      default: "pending",
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Activity", activitySchema);