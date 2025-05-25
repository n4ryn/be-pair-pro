const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Config
const connectDB = require("./config/database");
const setupSwaggerDocs = require("./config/swagger");
require("dotenv").config();

// Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

const app = express();
const port = process.env.PORT;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FE_BASE_URL,
    credentials: true,
  })
);
setupSwaggerDocs(app);

// Routes
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/", authRouter);

// Connect to database and start server
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
