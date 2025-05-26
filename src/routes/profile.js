const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

// Middleware
const { userAuth } = require("../middleware/auth");

// Utils
const {
  validateProfileEditData,
  validatePasswordEditData,
  validateFileType,
} = require("../utils/validation");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ------------------------ Routes ------------------------ //

const router = express.Router();

// Get User Profile
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /profile/view:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile details of the authenticated user.
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
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
 *                   example: Profile fetched successfully
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
router.get("/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).send({
      status: "success",
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// Update User
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /profile/edit:
 *   patch:
 *     summary: Edit user profile
 *     description: Allows the authenticated user to update their profile information.
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *               age:
 *                 type: number
 *                 example: 25
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *                 example: male
 *               about:
 *                 type: string
 *                 example: This is a default about of user
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Javascript, React, Nodejs]
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f9cd7f6f88a7b7890a2b45
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
 *                       example: male
 *                     about:
 *                       type: string
 *                       example: This is a default about of user
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [Javascript, React, Nodejs]
 */
router.patch("/edit", userAuth, async (req, res) => {
  try {
    // Validation of data
    validateProfileEditData(req);

    const loggedInUser = req.user;

    // Update data
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    // Save the updated user
    await loggedInUser.save();

    res.status(200).send({
      status: "success",
      message: "Profile updated successfully",
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// Update User Password
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /profile/password:
 *   patch:
 *     summary: Change user password
 *     description: Allows the authenticated user to change their password.
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 format: password
 *                 example: Password@123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword@123
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: Password updated successfully
 */
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

    res
      .status(200)
      .send({ status: "success", message: "Password updated successfully" });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// File upload
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /profile/photo:
 *   patch:
 *     summary: Upload user profile photo
 *     description: Allows the authenticated user to upload a profile photo.
 *     tags: [Profile]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 example: iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAACXZwQWcAAAA8AAAAHgD...w==
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
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
 *                   example: Photo uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1662088800/shoes.jpg
 *                     secureUrl:
 *                       type: string
 *                       example: https://res.cloudinary.com/demo/image/upload/v1662088800/shoes.jpg
 *                     display_name:
 *                       type: string
 *                       example: IMG-20221207-WA0013
 */
router.patch("/photo", userAuth, upload.single("photo"), async (req, res) => {
  try {
    validateFileType(req);

    const user = req.user;

    // Access the file buffer
    const fileBuffer = req.file.buffer;

    // Convert buffer to base64 for Cloudinary
    const fileBase64 = `data:${req.file.mimetype};base64,${fileBuffer.toString(
      "base64"
    )}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      public_id: `IMG-${new Date().toISOString()}`.substring(0, 23),
    });

    // Update user photoUrl
    if (uploadResult.url) {
      user.photoUrl = uploadResult.url;
      await user.save();
    }

    res.send({
      status: "success",
      message: "File uploaded successfully",
      data: {
        url: uploadResult.url,
        secureUrl: uploadResult.secure_url,
        display_name: uploadResult.public_id,
      },
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

module.exports = router;
