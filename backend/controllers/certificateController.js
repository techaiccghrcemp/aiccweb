const crypto = require("crypto");
const mongoose = require("mongoose");
const Activity = require("../models/Activity");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const Registration = require("../models/Registration");

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const createCertificate = async (req, res) => {
  try {
    const { student, activity, certificateType = "Participation" } = req.body;

    if (!student || !activity) {
      return res.status(400).json({
        message: "Student and activity are required",
      });
    }

    if (!isValidId(activity)) {
      return res.status(400).json({ message: "Invalid activity ID" });
    }

    const [studentRecord, activityRecord] = await Promise.all([
      isValidId(student)
        ? User.findById(student)
        : User.findOne({ studentId: student }),
      Activity.findById(activity),
    ]);

    if (!studentRecord) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!activityRecord) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const registration = await Registration.findOne({
      student: studentRecord._id,
      activity,
      status: "registered",
    });
    if (!registration) {
      return res.status(400).json({ message: "A certificate can only be issued to a registered student" });
    }

    const existingCertificate = await Certificate.findOne({
      student: studentRecord._id,
      activity,
    });

    if (existingCertificate) {
      return res.status(409).json({
        message: "A certificate has already been issued for this student and activity",
        certificate: existingCertificate,
      });
    }

    const certificateId = `EK-${new Date().getFullYear()}-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    const certificate = await Certificate.create({
      certificateId,
      student: studentRecord._id,
      activity,
      certificateType,
      issuedAt: new Date(),
    });

    res.status(201).json({
      message: "Certificate issued successfully",
      certificate,
    });
  } catch (error) {
    console.error("Create certificate error:", error);
    res.status(500).json({ message: "Server error while issuing certificate" });
  }
};

const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user.id })
      .populate("activity")
      .sort({ issuedAt: -1 });

    res.json({ count: certificates.length, certificates });
  } catch (error) {
    console.error("Get certificates error:", error);
    res.status(500).json({ message: "Server error while fetching certificates" });
  }
};

const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
    })
      .populate("student", "name email studentId")
      .populate("activity", "title date organizer");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({
      certificateId: certificate.certificateId,
      student: certificate.student,
      activity: certificate.activity,
      certificateType: certificate.certificateType,
      issuedAt: certificate.issuedAt,
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    res.status(500).json({ message: "Server error while verifying certificate" });
  }
};

module.exports = {
  createCertificate,
  getMyCertificates,
  verifyCertificate,
};
