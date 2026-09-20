const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("CSAMS Backend is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CSAMS server running on http://localhost:${PORT}`);
});