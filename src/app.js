const express = require("express");
const connectDB = require("./config/database");

const User = require("./models/user");

const app = express();

port = process.env.PORT || 9000;

app.post("/signup", async (req, res) => {
  const userObj = {
    firstName: "Vinay",
    lastName: "Kumar",
    emailId: "vinay@email.com",
    password: "test@123",
  };

  // Creating a new Instance of the User Model
  const user = new User(userObj);

  const userData = await user.save();

  res.status(201).send(userData);
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
