const express = require("express");
const { getClubLogo } = require("../controllers/clubController");

const router = express.Router();

router.get("/", getClubLogo);

module.exports = router;
