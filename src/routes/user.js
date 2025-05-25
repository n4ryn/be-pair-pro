const express = require("express");

// Models
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// Middleware
const { userAuth } = require("../middleware/auth");

// Utils
const { validateFeedData } = require("../utils/validation");
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// ------------------------ Routes ------------------------ //

const router = express.Router();

// Get User Feed
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /user/requests:
 *   get:
 *     summary: Get all connection requests for the logged-in user
 *     description: Fetches all connection requests with status "interested" sent to the authenticated user.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Connection requests fetched successfully
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
 *                   example: Connection requests fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f9cd7f6f88a7b7890a2b45
 *                       fromUserId:
 *                         type: object
 *                         description: User object with safe fields only
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 64f9cd7f6f88a7b7890a2b45
 *                           firstName:
 *                             type: string
 *                             example: John
 *                           lastName:
 *                             type: string
 *                             example: Doe
 *                           photoUrl:
 *                             type: string
 *                             example: https://geographyandyou.com/images/user-profile.png
 *                           about:
 *                             type: string
 *                             example: This is a default about of user
 *                           skills:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: [Javascript, React, Nodejs]
 *                       toUserId:
 *                         type: string
 *                         example: 64f9cd7f6f88a7b7890a2b45
 *                       status:
 *                         type: string
 *                         example: interested
 *                         enum: [interested, ignored]
 */
router.get("/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Get all connection requests
    const connectionRequest = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.status(200).send({
      status: "success",
      message: "Connection requests fetched successfully",
      data: connectionRequest,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// Get User Connections
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /user/connections:
 *   get:
 *     summary: Get all accepted connections for the logged-in user
 *     description: Fetches all users connected with the authenticated user where the connection status is "accepted".
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Connections fetched successfully
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
 *                   example: Connections fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f9cd7f6f88a7b7890a2b45
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       age:
 *                         type: number
 *                         example: 25
 *                       gender:
 *                         type: string
 *                         example: male
 *                       photoUrl:
 *                         type: string
 *                         example: https://geographyandyou.com/images/user-profile.png
 *                       about:
 *                         type: string
 *                         example: This is a default about of user
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: [Javascript, React, Nodejs]
 */
router.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Get all connection
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    // Remove fromUserId from connections if it is same as loggedInUser
    const data = connections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.status(200).send({
      status: "success",
      message: "Connections fetched successfully",
      data,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// Get user feed
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /user/feed:
 *   get:
 *     summary: Get user feed excluding hidden and connected users
 *     description: Retrieves a paginated list of users excluding the logged-in user and those connected or hidden via connection requests.
 *     tags: [User]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users to return per page (default is 10)
 *     responses:
 *       200:
 *         description: Feed fetched successfully
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
 *                   example: Feed fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f9cd7f6f88a7b7890a2b45
 *                       firstName:
 *                         type: string
 *                         example: John
 *                       lastName:
 *                         type: string
 *                         example: Doe
 *                       age:
 *                         type: number
 *                         example: 25
 *                       gender:
 *                         type: string
 *                         example: male
 *                       photoUrl:
 *                         type: string
 *                         example: https://geographyandyou.com/images/user-profile.png
 *                       about:
 *                         type: string
 *                         example: This is a default about of user
 *                       skills:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: [Javascript, React, Nodejs]
 */
router.get("/feed", userAuth, async (req, res) => {
  try {
    // Validation of data
    validateFeedData(req);

    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all connection requests
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // Get all hidden users from feed
    const hiddenUserFromFeed = new Set();

    // Add hidden users to hiddenUserFromFeed
    connectionRequests.forEach((field) => {
      hiddenUserFromFeed.add(field.fromUserId.toString());
      hiddenUserFromFeed.add(field.toUserId.toString());
    });

    // Get all users from feed excluding hidden users
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hiddenUserFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).send({
      status: "success",
      message: "Feed fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

module.exports = router;
