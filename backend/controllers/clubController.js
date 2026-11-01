const fs = require("fs/promises");
const path = require("path");
const Club = require("../models/Club");
const { uploadDirectory } = require("../middleware/clubLogoUpload");

const logoUrl = (club) => club?.logo || "";

const removeLogoFile = async (logo) => {
  const prefix = "/uploads/club/";
  if (!logo.startsWith(prefix)) return;

  await fs.unlink(path.join(uploadDirectory, path.basename(logo)));
};

const getClubLogo = async (req, res) => {
  try {
    const club = await Club.findOne({ name: "AICC Club" }).select("logo");
    res.json({ logo: logoUrl(club) });
  } catch (error) {
    console.error("Get club logo error:", error);
    res.status(500).json({ message: "Server error while loading club branding" });
  }
};

const uploadClubLogo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Choose a logo image to upload" });
  }

  const newLogo = `/uploads/club/${req.file.filename}`;

  try {
    let club = await Club.findOne({ name: "AICC Club" });
    if (!club) {
      club = new Club({
        name: "AICC Club",
        description: "Artificial Intelligence & Coding Club",
        category: "Technology",
      });
    }

    const previousLogo = club.logo;
    club.logo = newLogo;
    await club.save();

    if (previousLogo && previousLogo !== newLogo) {
      try {
        await removeLogoFile(previousLogo);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Remove replaced club logo error:", error);
        }
      }
    }

    res.json({ message: "Club logo updated successfully", logo: club.logo });
  } catch (error) {
    console.error("Upload club logo error:", error);
    try {
      await fs.unlink(path.join(uploadDirectory, req.file.filename));
    } catch (cleanupError) {
      if (cleanupError.code !== "ENOENT") {
        console.error("Remove failed club logo upload error:", cleanupError);
      }
    }
    res.status(500).json({ message: "Server error while updating club logo" });
  }
};

const deleteClubLogo = async (req, res) => {
  try {
    const club = await Club.findOne({ name: "AICC Club" });
    if (!club || !club.logo) {
      return res.status(404).json({ message: "No club logo is currently set" });
    }

    const previousLogo = club.logo;
    club.logo = "";
    await club.save();

    let warning;
    try {
      await removeLogoFile(previousLogo);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error("Remove club logo error:", error);
        warning = "The logo was removed from the website, but its file could not be deleted.";
      }
    }

    res.json({ message: "Club logo removed successfully", logo: "", warning });
  } catch (error) {
    console.error("Delete club logo error:", error);
    res.status(500).json({ message: "Server error while removing club logo" });
  }
};

module.exports = { getClubLogo, uploadClubLogo, deleteClubLogo };
