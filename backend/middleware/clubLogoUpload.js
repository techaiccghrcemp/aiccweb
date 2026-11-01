const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(__dirname, "..", "uploads", "club");
fs.mkdirSync(uploadDirectory, { recursive: true });

const imageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${imageExtensions[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!imageExtensions[file.mimetype]) {
      callback(new Error("Only JPEG, PNG, or WebP logo images are allowed"));
      return;
    }
    callback(null, true);
  },
});

const parseClubLogo = (req, res, next) => {
  upload.single("logo")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (
      error instanceof multer.MulterError ||
      error.message === "Only JPEG, PNG, or WebP logo images are allowed"
    ) {
      res.status(400).json({
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "Logo must be 5 MB or smaller"
            : error.message,
      });
      return;
    }

    next(error);
  });
};

module.exports = { parseClubLogo, uploadDirectory };
