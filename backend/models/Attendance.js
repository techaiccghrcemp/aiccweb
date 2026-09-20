const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
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
      enum: ["present", "absent"],
      default: "absent",
    },

    checkedInAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { student: 1, activity: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);