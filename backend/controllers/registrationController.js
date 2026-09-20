const Activity = require("../models/Activity");
const Registration = require("../models/Registration");

const registerForActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    if (activity.status !== "published") {
      return res.status(400).json({
        message: "This activity is not open for registration",
      });
    }

    if (new Date(activity.registrationDeadline) < new Date()) {
      return res.status(400).json({
        message: "Registration deadline has passed",
      });
    }

    const existingRegistration = await Registration.findOne({
      student: req.user.id,
      activity: activityId,
    });

    if (existingRegistration) {
      return res.status(409).json({
        message: "You are already registered for this activity",
        registration: existingRegistration,
      });
    }

    const registeredCount = await Registration.countDocuments({
      activity: activityId,
      status: "registered",
    });

    if (registeredCount >= activity.capacity) {
      return res.status(409).json({
        message: "This activity is full",
      });
    }

    const registration = await Registration.create({
      student: req.user.id,
      activity: activityId,
    });

    res.status(201).json({
      message: "Registered for activity successfully",
      registration,
    });
  } catch (error) {
    console.error("Create registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You are already registered for this activity",
      });
    }

    res.status(500).json({
      message: "Server error while registering for activity",
    });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      student: req.user.id,
    })
      .populate("activity")
      .sort({ registeredAt: -1 });

    res.json({
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Get registrations error:", error);

    res.status(500).json({
      message: "Server error while fetching registrations",
    });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOneAndDelete({
      _id: req.params.id,
      student: req.user.id,
    });

    if (!registration) {
      return res.status(404).json({
        message: "Registration not found",
      });
    }

    res.json({
      message: "Registration cancelled successfully",
    });
  } catch (error) {
    console.error("Delete registration error:", error);

    res.status(500).json({
      message: "Server error while cancelling registration",
    });
  }
};

const getActivityRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      activity: req.params.activityId,
      status: "registered",
    })
      .populate("student", "name email studentId")
      .populate("activity", "title date")
      .sort({ registeredAt: 1 });

    res.json({ count: registrations.length, registrations });
  } catch (error) {
    console.error("Get activity registrations error:", error);
    res.status(500).json({ message: "Server error while fetching registrations" });
  }
};

module.exports = {
  registerForActivity,
  getMyRegistrations,
  deleteRegistration,
  getActivityRegistrations,
};
