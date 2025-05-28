const express = require("express");

const router = express.Router();

const Chat = require("../models/chat");
const { userAuth } = require("../middleware/auth");

// Get Chats
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: token
 *
 * /chat/get:
 *   get:
 *     summary: Get chats
 *     description: Retrieves the chats of the authenticated user.
 *     tags: [Chat]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Chats fetched successfully
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
 *                   example: Chats fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 60f6c8b2e1d2f74a4c4f1c12
 *                       participants:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: 683289cf302b3ca5e42375a8
 *                       messages:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 68372736ea0e5b2f2667ea1f
 *                             senderId:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: 683289cf302b3ca5e42375a8
 *                                 firstName:
 *                                   type: string
 *                                   example: Oscar
 *                                 photoUrl:
 *                                   type: string
 *                                   example: https://media.formula1.com/image/upload/f_auto,c_limit,q_auto,w_1320/content/dam/fom-website/drivers/2025Drivers/piastri
 *                             message:
 *                               type: string
 *                               example: Hello
 *                             createdAt:
 *                               type: string
 *                               example: 2025-05-28T15:09:42.226Z
 *                             updatedAt:
 *                               type: string
 *                               example: 2025-05-28T15:09:42.226Z
 */
router.get("/:receiverId", userAuth, async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName photoUrl",
    });

    if (!chat) {
      const newChat = new Chat({
        participants: [senderId, receiverId],
        messages: [],
      });
      chat = await newChat.save();
    }

    res.status(200).json({
      status: "success",
      messages: "Chat fetched successfully",
      data: chat,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      messages: error.message || "Error fetching chat",
    });
  }
});

module.exports = router;
