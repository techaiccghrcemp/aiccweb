const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const users = [
  { name: "Demo Student", email: "test@student.com", password: "123456", role: "student", studentId: "EK-STU-001", department: "Computer Science", year: 3 },
  { name: "EventKatta Faculty", email: "faculty@eventkatta.com", password: "Faculty@123", role: "faculty" },
  { name: "EventKatta Admin", email: "admin@eventkatta.com", password: "Admin@123", role: "admin" },
];

const seed = async () => {
  await connectDB();
  for (const account of users) {
    const password = await bcrypt.hash(account.password, 10);
    await User.findOneAndUpdate(
      { email: account.email },
      { ...account, password },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log("Demo student, faculty, and admin accounts are ready.");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Demo user seed failed:", error);
  process.exit(1);
});
