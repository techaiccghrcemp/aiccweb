const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },

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

    certificateType: {
      type: String,
      enum: ["Participation", "Winner", "Volunteer"],
      default: "Participation",
    },

    certificateUrl: {
      type: String,
      default: "",
    },

    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Certificate", certificateSchema);