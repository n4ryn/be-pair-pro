const jwt = require("jsonwebtoken");

const User = require("../models/user");

// Validating User
const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Invalid token");
    }

    // Decoding token
    const decodedMessage = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedMessage;

    // Fetching user with id
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(400).send("ERROR: " + error?.message);
  }
};

module.exports = { userAuth };
