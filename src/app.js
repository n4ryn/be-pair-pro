const express = require("express");

const app = express();

port = process.env.PORT || 9000;

// app.use will match all the HTTP method API calls to /test
// app.use("/user", (req, res) => {
//   res.send("User Data");
// });

// app.get or app.post will match exact HTTP method API call
app.get("/user", (req, res) => {
  // Extracting query parameters
  console.log("Query Params", req.query.name);

  res.send({ firstName: "Vinay", lastName: "Kumar" });
});

app.post("/user", (req, res) => {
  console.log("Data saved");
  res.send("User created successfully");
});

app.delete("/user", (req, res) => {
  console.log("Data deleted");
  res.send("User deleted successfully");
});

// Regular Expression Path

// Optional request path: b will be optional i.e., /abc or /ac also multiple letter can be grouped like /a(bc)?d
// app.get("/ab?c", (req, res) => {
//   res.send("Hello");
// });

// Same key letter can be repeated in request path: i.e., /abbbbbbbc will work but /abcccc or /aaaabc will not work
// app.get("/ab+c", (req, res) => {
//   res.send("Hello");
// });

// Anything in place of asterisk(*) request path: i.e., /abANYTHINGc
// app.get("/ab*c", (req, res) => {
//   res.send("Hi");
// });

// Regex in routes
// Route can start with anything but end should be with fly
// app.get(/.*fly$/, (req, res) => {
//   res.send("Fly");
// });

// Route can be anything which includes a
// app.get(/a/, (req, res) => {
//   res.send("anything a");
// });

// Dynamic Paths
app.get("/xyz/:id", (req, res) => {
  // Extracting Path Parameters
  console.log("Path Params: ", req.params.id);

  res.send("Hi");
});

app.listen(port, () => {
  console.log("Server is listening on PORT: ", port);
});
