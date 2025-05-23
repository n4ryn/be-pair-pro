const express = require("express");

// Middleware
const { userAuth } = require("../middleware/auth");

// ------------------------ Routes ------------------------ //

const router = express.Router();

// Send Connection Request
router.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send({ message: user.firstName + " sent the connection request" });
  } catch (error) {}
});

module.exports = router;
