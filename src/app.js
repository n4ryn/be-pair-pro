const express = require("express");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const User = require("./models/user");

const { userAuth } = require("./middleware/auth");

const { validateSignupData, validateLoginData } = require("./utils/validation");

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

// Create a new user
app.post("/signup", async (req, res) => {
  try {
    // Validation of data
    validateSignupData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const userData = await user.save();

    res.status(201).send(userData);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

// User Login
app.post("/login", async (req, res) => {
  try {
    validateLoginData(req);

    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) {
      throw new Error("User not found with Email ID");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Password does not match");
    }

    const token = await user.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 3600000),
    });
    res.status(200).send("Login successful");
  } catch (error) {
    res.status(400).send("ERROR: " + error?.message);
  }
});

// Profile api
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error?.message);
  }
});

// Send Connection Request
app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user.firstName + " sent the connection request");
  } catch (error) {}
});

// Get user details
app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body.emailId;

    const user = await User.findOne({ emailId: userEmail });

    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(400).send("ERROR: " + error?.message);
  }
});

// Update user details
app.patch("/user/:userId", async (req, res) => {
  try {
    const userId = req.params?.userId;
    const data = req.body;

    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (data.skills.length > 10) {
      throw new Error("Skills cannot be more than 10 skills");
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
      runValidators: true,
    });

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error?.message);
  }
});

// Delete User
app.delete("/user/:userId", async (req, res) => {
  try {
    const userId = req.params?.userId;

    const user = await User.findByIdAndDelete({ _id: userId });

    res.status(200).send(user);
  } catch (error) {
    res.status(400).send("ERROR: " + error?.message);
  }
});

// Get Feed
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).send(users);
  } catch (error) {
    res.status(400).send("ERROR: " + error?.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully.");

    app.listen(port, () => {
      console.log("Server is listening on PORT:", port);
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected!!!");
  });
