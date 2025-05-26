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
/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     description: Creates a new user with first name, last name, email, and password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - emailId
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               emailId:
 *                 type: string
 *                 format: email
 *                 example: john.doe@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60f6c8b2e1d2f74a4c4f1c12
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *                     emailId:
 *                       type: string
 *                       example: john.doe@email.com
 *                     age:
 *                       type: number
 *                       example: 25
 *                     gender:
 *                       type: string
 *                       enum: [male, female, other]
 *                       example: male
 *                     photoUrl:
 *                       type: string
 *                       example: https://geographyandyou.com/images/user-profile.png
 *                     about:
 *                       type: string
 *                       example: This is a default about of user
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [Javascript, React, Nodejs]
 */
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

    // Generate JWT token
    const token = await user.getJWT();

    const userWithoutPassword = userData.toJSON();
    delete userWithoutPassword.password;

    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 3600000),
      })
      .status(201)
      .send({
        status: "success",
        message: "User created successfully",
        data: { token, user: userWithoutPassword },
      });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// User Login
/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     description: Logs in a user using email and password, and sets a JWT token as a cookie.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailId
 *               - password
 *             properties:
 *               emailId:
 *                 type: string
 *                 format: email
 *                 example: john.doe@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful, JWT token set as cookie
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=jwt_token_here; Path=/; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login successful
 */
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

    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 3600000),
      })
      .status(200)
      .send({
        status: "success",
        message: "Login successful",
        data: { token, user: userWithoutPassword },
      });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// Logout user session
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /logout:
 *   post:
 *     summary: User logout
 *     description: Logs out the user by clearing the authentication cookie.
 *     tags: [Auth]
 *     security: [cookieAuth: []]
 *     responses:
 *       200:
 *         description: Logout successful, JWT cookie invalidated
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Logout successfully
 */
router.post("/logout", async (req, res) => {
  // Invalidate token and expire cookie
  res.cookie("token", null, { expires: new Date(Date.now()) }).send({
    status: "success",
    message: "Logout successfully",
  });
});

module.exports = router;
