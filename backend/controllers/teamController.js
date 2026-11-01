const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const TeamMember = require("../models/TeamMember");
const { uploadDirectory } = require("../middleware/teamPhotoUpload");

const asPublicMember = (member) => ({
  _id: member._id,
  name: member.name,
  position: member.position,
  photoUrl: `/uploads/team/${member.photoFilename}`,
});

const removePhoto = async (filename) => {
  await fs.unlink(path.join(uploadDirectory, path.basename(filename)));
};

const getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: 1 });
    res.json({ members: members.map(asPublicMember) });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({ message: "Server error while loading team members" });
  }
};

const createTeamMember = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "A team member photo is required" });
  }

  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
  const position =
    typeof req.body.position === "string" ? req.body.position.trim() : "";
  if (!name || name.length > 80 || !position || position.length > 100) {
    try {
      await removePhoto(req.file.filename);
    } catch (error) {
      console.error("Remove invalid team photo error:", error);
    }
    return res.status(400).json({
      message: "Name and position are required (80 and 100 characters max)",
    });
  }

  try {
    const member = await TeamMember.create({
      name,
      position,
      photoFilename: req.file.filename,
    });
    res.status(201).json({
      message: "Team member added successfully",
      member: asPublicMember(member),
    });
  } catch (error) {
    console.error("Create team member error:", error);
    try {
      await removePhoto(req.file.filename);
    } catch (cleanupError) {
      console.error("Remove failed team photo error:", cleanupError);
    }
    res.status(500).json({ message: "Server error while adding team member" });
  }
};

const deleteTeamMember = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid team member ID" });
  }

  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Team member not found" });
    }

    let warning;
    try {
      await removePhoto(member.photoFilename);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Remove team member photo error:", error);
        warning = "The profile was removed, but its photo could not be deleted.";
      }
    }

    res.json({ message: "Team member removed successfully", warning });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({ message: "Server error while removing team member" });
  }
};

module.exports = { getTeamMembers, createTeamMember, deleteTeamMember };
