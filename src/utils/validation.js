const validator = require("validator");

// Validate user signup data
const validateSignupData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  // Validate data
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

// Validate user login data
const validateLoginData = (req) => {
  const { emailId, password } = req.body;

  // Validate data
  if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

// Validate user profile edit data
const validateProfileEditData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  // Check if data is valid
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  // Validate data
  if (!isEditAllowed) {
    throw new Error("Invalid edit request");
  }
};

// Validate user password edit data
const validatePasswordEditData = (req) => {
  const { newPassword } = req.body;

  // Check if data is valid
  const allowedEditFields = ["oldPassword", "newPassword"];
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  // Validate data
  if (!isEditAllowed) {
    throw new Error("Invalid password update request");
  } else if (!validator.isStrongPassword(newPassword)) {
    throw new Error("New Password is not Strong");
  }
};

module.exports = {
  validateSignupData,
  validateLoginData,
  validateProfileEditData,
  validatePasswordEditData,
};
