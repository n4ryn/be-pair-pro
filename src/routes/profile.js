const express = require("express");
const bcrypt = require("bcrypt");

// Middleware
const { userAuth } = require("../middleware/auth");

// Utils
const {
  validateProfileEditData,
  validatePasswordEditData,
} = require("../utils/validation");

// ------------------------ Routes ------------------------ //

const router = express.Router();

// Get User Profile
router.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res
      .status(200)
      .send({ message: "Profile fetched successfully", data: user });
  } catch (error) {
    res.status(400).send({ message: "ERROR: " + error.message });
  }
});

// Update User
router.patch("/edit", userAuth, async (req, res) => {
  try {
    // Validation of data
    validateProfileEditData(req);

    const loggedInUser = req.user;

    // Update data
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    // Save the updated user
    await loggedInUser.save();

    res
      .status(200)
      .send({ message: "Profile updated successfully", data: loggedInUser });
  } catch (error) {
    res.status(400).send({ message: "ERROR: " + error.message });
  }
});

// Update User Password
router.patch("/password", userAuth, async (req, res) => {
  try {
    // Validation of data
    validatePasswordEditData(req);

    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    // Check if old password is valid
    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      throw new Error("Old password does not match");
    }

    // Encrypt the password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = passwordHash;

    // Save the updated user
    user.save();

    res.send({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).send({ message: "ERROR: " + error.message });
  }
});

module.exports = router;
