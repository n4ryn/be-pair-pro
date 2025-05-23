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
