const express = require("express");
const bcrypt = require("bcrypt");

// Models
const User = require("../models/user");

// Utils
const {
  validateLoginData,
  validateSignupData,
} = require("../utils/validation");
const sendResponse = require("../utils/sendResponse");

const statusCodes = require("../utils/status.json");

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

    const existingUser = await User.findOne({ emailId });

    if (existingUser) {
      sendResponse(res, statusCodes.HTTP_400_BAD_REQUEST, {
        error: "User already exists",
      });
      return;
    }

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

    const expires = new Date(Date.now() + 7 * 24 * 1000);

    sendResponse(res, statusCodes.HTTP_201_CREATED, {
      data: { token, user: userData },
      cookie: [
        { type: "token", value: token, config: { expires: expires } },
        { type: "user", value: userData, config: { expires: expires } },
      ],
    });
  } catch (error) {
    sendResponse(res, statusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      error: error.message || "Something went wrong",
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

    const expires = new Date(Date.now() + 7 * 24 * 1000);

    sendResponse(res, statusCodes.HTTP_200_OK, {
      data: { token, user: user },
      cookie: [
        { type: "token", value: token, config: { expires: expires } },
        { type: "user", value: user, config: { expires: expires } },
      ],
    });
  } catch (error) {
    sendResponse(res, statusCodes.HTTP_500_INTERNAL_SERVER_ERROR, {
      error: error.message || "Something went wrong",
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

  sendResponse(res, statusCodes.HTTP_200_OK, {
    cookie: [
      { type: "token", value: null, config: { expires: new Date(Date.now()) } },
      { type: "user", value: null, config: { expires: new Date(Date.now()) } },
    ],
  });
});

module.exports = router;
