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
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /request/send/{status}/{toUserId}:
 *   post:
 *     summary: Send a connection request
 *     description: Sends a connection request from the authenticated user to another user.
 *     tags: [Request]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [interested, ignore]
 *           example: interested
 *       - in: path
 *         name: toUserId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f9bdf36f88a7b7890a2b32
 *     responses:
 *       200:
 *         description: Connection request sent successfully
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
 *                   example: Connection request sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f9cd7f6f88a7b7890a2b45
 *                     fromUserId:
 *                       type: string
 *                       example: 64f9cd7f6f88a7b7890a2b45
 *                     toUserId:
 *                       type: string
 *                       example: 64f9cd7f6f88a7b7890a2b45
 *                     status:
 *                       type: string
 *                       example: interested
 */
router.post("/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    // Validation of data
    validateSendConnectionRequest(req);

    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;

    // Check if toUser exists
    const toUserExists = await User.findById(toUserId);
    if (!toUserExists) {
      throw new Error("User not found");
    }

    // Check if connection request already exists
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest) {
      throw new Error("Connection already exists");
    }

    // Create connection request
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    // Save the connection request
    const data = await connectionRequest.save();

    res.status(200).send({
      status: "success",
      message: "Connection request sent successfully",
      data,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

// Review Connection Request
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /request/review/{status}/{requestId}:
 *   post:
 *     summary: Review a connection request
 *     description: Allows a user to review and update the status of a received connection request.
 *     tags: [Request]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [accepted, rejected]
 *           example: accepted
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f9cd7f6f88a7b7890a2b45
 *     responses:
 *       200:
 *         description: Connection request reviewed successfully
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
 *                   example: Connection request sent successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f9cd7f6f88a7b7890a2b45
 *                     fromUserId:
 *                       type: string
 *                       example: 64f9cd7f6f88a7b7890a2b45
 *                     toUserId:
 *                       type: string
 *                       example: 64f9cd7f6f88a7b7890a2b45
 *                     status:
 *                       type: string
 *                       example: accepted
 */
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

    res.status(200).send({
      status: "success",
      message: "Connection request sent successfully",
      data,
    });
  } catch (error) {
    res.status(400).send({
      status: "error",
      message: error.message || "Something went wrong",
    });
  }
});

module.exports = router;
