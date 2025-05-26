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
    throw new Error("New password is not Strong");
  }
};

// Validate send connection request data
const validateSendConnectionRequest = (req) => {
  const toUserId = req.params.toUserId;
  const status = req.params.status;
  const allowedStatus = ["interested", "ignored"];

  // Validate data
  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid request status type");
  } else if (!validator.isMongoId(toUserId)) {
    throw new Error("Invalid to user id");
  }
};

// Validate review connection request data
const validateReviewConnectionRequest = (req) => {
  const requestId = req.params.requestId;
  const status = req.params.status;
  const allowedStatus = ["accepted", "rejected"];

  // Validate data
  if (!allowedStatus.includes(status)) {
    throw new Error("Invalid request status type");
  } else if (!validator.isMongoId(requestId)) {
    throw new Error("Invalid request id");
  }
};

// Validate feed data
const validateFeedData = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Validate data
  if (page < 1) {
    throw new Error("Page number is not valid");
  } else if (limit < 1 || limit > 20) {
    throw new Error("Limit should be between 1 to 20");
  }
};

const validateFileType = (req) => {
  // Check if file is present
  if (!req.file) {
    throw new Error("File is not present");
  }

  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

  // check file size greater than 5MB
  if (req.file.size > 1024 * 1024 * 5) {
    throw new Error("File size is too large");
  }

  // Validate data
  if (!allowedFileTypes.includes(req.file.mimetype)) {
    throw new Error("File type is not valid");
  }
};

module.exports = {
  validateSignupData,
  validateLoginData,
  validateProfileEditData,
  validatePasswordEditData,
  validateSendConnectionRequest,
  validateReviewConnectionRequest,
  validateFeedData,
  validateFileType,
};
