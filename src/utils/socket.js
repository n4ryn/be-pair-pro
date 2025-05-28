const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const getHashedRoomId = (senderId, receiverId) => {
  const hashed = crypto
    .createHash("sha256")
    .update([senderId, receiverId].sort().join("_"))
    .digest("hex");
  return hashed;
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.FE_BASE_URL,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join", (data) => {
      const { senderId, receiverId } = data;
      const room = getHashedRoomId(senderId, receiverId);

      socket.join(room);
    });

    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message } = data;
      const room = getHashedRoomId(senderId, receiverId);

      try {
        let chat = await Chat.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (!chat) {
          const newChat = new Chat({
            participants: [senderId, receiverId],
            messages: [],
          });

          newChat.messages.push({ senderId, message });

          chat = await newChat.save();
        } else {
          chat.messages.push({ senderId, message });
          await chat.save();
        }

        const populatedChat = await Chat.findById(chat._id)
          .select({ messages: { $slice: -1 } })
          .populate("messages.senderId", "firstName photoUrl");

        const newMessage = populatedChat.messages[0];

        io.to(room).emit("messageReceived", newMessage);
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = initializeSocket;
