const express = require("express");

const app = express();

port = process.env.PORT || 9000;

app.use("/", (req, res) => {
  res.send("Welcome");
});

app.use("/test", (req, res) => {
  res.send("Test");
});

app.use("/hello", (req, res) => {
  res.send("Hello");
});

app.listen(port, () => {
  console.log("Server is listening on PORT: ", port);
});
