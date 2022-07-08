const parseJsonBody = (rawBody) => {
  try {
    return JSON.parse(rawBody);
  } catch (err) {
    return rawBody;
  }
};

module.exports = parseJsonBody;
