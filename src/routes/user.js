const express = require("express");

// Models
const User = require("../models/user");

// ------------------------ Routes ------------------------ //

const router = express.Router();

// Get User Feed
router.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).send({ message: "User feed fetched successfully", users });
  } catch (error) {
    res.status(400).send({ message: "ERROR: " + error.message });
  }
});

module.exports = router;
