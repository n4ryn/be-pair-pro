const adminAuth = (req, res, next) => {
  console.log("Admin auth middleware is called");
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";

  if (!isAdminAuthorized) {
    res.status(401).send("Not authorized");
  } else {
    next();
  }
};

const userAuth = (req, res, next) => {
  console.log("User auth middleware is called");
  const token = "xyz";
  const isUserAuthorized = token === "xyz";

  if (!isUserAuthorized) {
    res.status(401).send("Not authorized");
  } else {
    next();
  }
};

module.exports = { adminAuth, userAuth };
