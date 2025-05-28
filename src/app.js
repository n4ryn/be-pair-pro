const { createServer } = require("http");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { v2: cloudinary } = require("cloudinary");

// Config
const connectDB = require("./config/database");
const setupSwaggerDocs = require("./config/swagger");
require("dotenv").config();
require("./utils/cronjob");
const initializeSocket = require("./utils/socket");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  private_cdn: true,
});

// Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");

const app = express();
const port = process.env.PORT;

// Socket
const server = createServer(app);
initializeSocket(server);

// Middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FE_BASE_URL,
    credentials: true,
  })
);
setupSwaggerDocs(app);

// Routes
app.use("/chat", chatRouter);
app.use("/profile", profileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
app.use("/", authRouter);

// Connect to database and start server
connectDB()
  .then(() => {
    console.log("Database connected successfully.");

    server.listen(port, () => {
      console.log("Server is listening on PORT:", port);
    });
  })
  .catch((err) => {
    console.log("Database cannot be connected!!!");
  });
