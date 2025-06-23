const jwt = require("jsonwebtoken");

const User = require("../models/user");
const sendResponse = require("../utils/sendResponse");
const statusCodes = require("../utils/status.json");

// Validating User
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      sendResponse(res, statusCodes.HTTP_401_UNAUTHORIZED, {
        error: "Invalid token",
      });
      return;
    }

    const passwordSelect = !req.url.includes("password") ? "-password" : "";

    // Decoding token
    const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedMessage;

    // Fetching user with id
    const user = await User.findById(_id).select(passwordSelect);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    sendResponse(res, statusCodes.HTTP_400_BAD_REQUEST, {
      error: error.message || "Invalid token",
    });
  }
};

// Validate socket user
const socketAuth = async (socket) => {
  try {
    const { token } = socket.handshake.auth;
    if (!token) {
      return socket.emit("error", "Token not found");
    }

    const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedMessage;

    if (!_id) {
      return socket.emit("error", "User not found");
    }

    // Fetching user with id
    const user = await User.findById(_id);
    if (!user) {
      socket.emit("error", "User not found");
    }

    return user;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { userAuth, socketAuth };
