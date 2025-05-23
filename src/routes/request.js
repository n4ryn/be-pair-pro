const express = require("express");

// Middleware
const { userAuth } = require("../middleware/auth");

// Model
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// Utils
const {
  validateSendConnectionRequest,
  validateReviewConnectionRequest,
} = require("../utils/validation");

// ------------------------ Routes ------------------------ //

const router = express.Router();

// Send Connection Request
router.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    // Validation of data
    validateSendConnectionRequest(req);

    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;

    // Check if toUser exists
    const toUserExists = await User.findById(toUserId);
    if (!toUserExists) {
      throw new Error("User does not exists");
    }

    // Check if connection request already exists
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      throw new Error("Connection request already exists");
    }

    // Create connection request
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    // Save the connection request
    const data = await connectionRequest.save();

    res.send({ message: "Connection request sent successfully", data });
  } catch (error) {
    res.status(400).send({ message: "ERROR: " + error.message });
  }
});

// Review Connection Request
router.post("/review/:status/:requestId", userAuth, async (req, res) => {
  try {
    // Validation of data
    validateReviewConnectionRequest(req);

    const loggedInUser = req.user;
    const { requestId, status } = req.params;

    // Check if connection request exists
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });
    if (!connectionRequest) {
      throw new Error("Connection request not found");
    }

    // Update connection request status
    connectionRequest.status = status;

    // Save the connection request
    const data = await connectionRequest.save();

    res.send({ message: "Connection request sent successfully", data });
  } catch (error) {
    res.status(400).send({ message: "ERROR: " + error.message });
  }
});

module.exports = router;
