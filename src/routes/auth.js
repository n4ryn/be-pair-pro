const express = require("express");
const bcrypt = require("bcrypt");

// Models
const User = require("../models/user");

// Utils
const {
  validateLoginData,
  validateSignupData,
} = require("../utils/validation");

// ------------------------ Routes ------------------------ //

const router = express.Router();

// User Signup
router.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    // Save the user
    const userData = await user.save();

    res
      .status(201)
      .send({ message: "User created successfully", data: userData });
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    // Validation of data
    validateLoginData(req);

    const { emailId, password } = req.body;

    // Find user by emailId
    const user = await User.findOne({ emailId });

    // Check if user exists
    if (!user) {
      throw new Error("User not found with Email ID");
    }

    // Check if password matches
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Password does not match");
    }

    // Generate JWT token
    const token = await user.getJWT();

    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 3600000),
      })
      .status(200)
      .send({ message: "Login successful" });
  } catch (error) {
    res.status(400).send("ERROR: " + error?.message);
  }
});

// Logout user session
router.post("/logout", async (req, res) => {
  // Invalidate token and expire cookie
  res
    .cookie("token", null, { expires: new Date(Date.now()) })
    .send({ message: "Logout successfully" });
});

module.exports = router;
