const sendResponse = (res, statusData, otherData) => {
  const { code, status, message } = statusData;
  const { data, error, cookie } = otherData;

  if (cookie && cookie.length > 0) {
    cookie.forEach((cookie) => {
      res.cookie(cookie.type, cookie.value, {
        expires: cookie.config.expires,
        httpOnly: cookie.config.httpOnly,
      });
    });
  }

  return res.status(code).send({
    status: status,
    message: message,
    data: data,
    error: error,
  });
};

module.exports = sendResponse;
