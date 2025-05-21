const express = require("express");

const { adminAuth, userAuth } = require("./middleware/auth");

const app = express();

port = process.env.PORT || 9000;

// GET /user => Middleware chain => Route Handlers

// Multiple route handlers
// app.use("/user", rh1, [rh2, rh3], rh4, rh5);
// app.use(
//   "/user",
//   (req, res, next) => {
//     // 1st Route Handler
//     console.log("Handling the user route 1");

//     // res.send("Response 1st");

//     // Pass the request to next route handler
//     next();
//   },
//   (req, res, next) => {
//     // 2nd Route Handler
//     console.log("Handling the user route 2");

//     // res.send("Response 2nd");
//     next();
//   },
//   (req, res) => {
//     // 3rd Route Handler
//     console.log("Handling the user route 3");

//     res.send("Response 3rd");
//   }
// );

// app.use("/user", (req, res, next) => {
//   console.log("Handling the user route 1");
//   // res.send("Response 1");
//   next();
// });

// app.use("/user", (req, res, next) => {
//   console.log("Handling the user route 2");
//   res.send("Response 2");
//   // next();
// });

// app.use("/admin", adminAuth);

// app.get("/user", userAuth, (req, res) => {
//   res.send("User data sent");
// });

// app.get("/admin/getAllData", (req, res) => {
//   res.send("All data fetched");
// });

// app.get("/admin/deleteUser", (req, res) => {
//   res.send("User deleted");
// });

app.get("/user", (req, res) => {
  throw new Error("Something");
  res.send("User data sent");
});

app.use("/", (err, req, res, next) => {
  if (err) res.status(500).send("Something went Wrong");
});

app.listen(port, () => {
  console.log("Server is listening on PORT: ", port);
});
