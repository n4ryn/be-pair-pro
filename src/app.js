const express = require("express");
const connectDB = require("./config/database");

const User = require("./models/user");

const app = express();

port = process.env.PORT || 9000;

app.use(express.json());

// Create a new user
app.post("/signup", async (req, res) => {
  try {
    // Creating a new Instance of the User Model
    const user = new User(req.body);

    const userData = await user.save();

    res.status(201).send(userData);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
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
    res.status(500).send("Something went wrong");
  }
});

// Update user details
app.patch("/user", async (req, res) => {
  try {
    const userId = req.body.userId;
    const data = req.body;

    const user = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnDocument: "after",
    });

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

// Delete User
app.delete("/user", async (req, res) => {
  try {
    const userId = req.body.userId;

    const user = await User.findByIdAndDelete({ _id: userId });

    res.status(200).send(user);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

// Get Feed
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});

    res.status(200).send(users);
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully.");

    app.listen(port, () => {
      console.log("Server is listening on PORT: ", port);
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected!!!");
  });
