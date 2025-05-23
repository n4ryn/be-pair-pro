const express = require("express");

// Models
const ConnectionRequest = require("../models/connectionRequest");

// Middleware
const { userAuth } = require("../middleware/auth");

// Utils
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
      message: "Connection requests fetched successfully",
      data: connectionRequest,
    });
  } catch (error) {
    res.status(400).send({ message: "ERROR: " + error.message });
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

    res.status(200).send({ message: "Connections fetched successfully", data });
  } catch (error) {
    res.status(400).send({ message: "ERROR: " + error.message });
  }
});

module.exports = router;
