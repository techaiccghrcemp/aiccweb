const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["registered", "cancelled", "waitlisted"],
      default: "registered",
    },

    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

registrationSchema.index(
  { student: 1, activity: 1 },
  { unique: true }
);

module.exports = mongoose.model("Registration", registrationSchema);