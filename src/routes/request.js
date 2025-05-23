const express = require("express");

// Middleware
const { userAuth } = require("../middleware/auth");

// Model
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// Utils
const { validateSentConnectionRequest } = require("../utils/validation");

// ------------------------ Routes ------------------------ //

const router = express.Router();

// Send Connection Request
router.post("/sent/:status/:toUserId", userAuth, async (req, res) => {
  try {
    // Validation of data
    validateSentConnectionRequest(req);

    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

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

module.exports = router;
