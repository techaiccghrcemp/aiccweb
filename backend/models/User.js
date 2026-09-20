const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    year: {
      type: Number,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);