const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      lowercase: true,
      require: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Enter a valid email: ", value);
        }
      },
    },
    password: {
      type: String,
      require: true,
      minLength: 8,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password: ", value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type`,
      },
    },
    photoUrl: {
      type: String,
      default:
        "https://easy-peasy.ai/cdn-cgi/image/quality=80,format=auto,width=400/https://media.easy-peasy.ai/73d73edb-aa3c-4fe4-a664-65219f30178e/4f912e5f-d74d-4157-8e91-87b555ec25e1.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Enter a valid URL: ", value);
        }
      },
    },
    about: {
      type: String,
      default: "This is a default about of user",
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (userPassword) {
  const user = this;

  const isPasswordValid = await bcrypt.compare(userPassword, user.password);

  return isPasswordValid;
};

module.exports = mongoose.model("User", userSchema);
