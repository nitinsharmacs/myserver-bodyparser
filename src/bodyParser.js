const parseUrlSearchParams = (searchParams) => {
  const params = {};

  for (const [param, value] of searchParams.entries()) {
    params[param] = value;
  }

  return params;
};

const parseFormUrlEncodedBody = (rawBody) => {
  const searchParams = new URLSearchParams(rawBody);

  return parseUrlSearchParams(searchParams);
};

const parseJsonBody = (rawBody) => {
  try {
    return JSON.parse(rawBody);
  } catch (err) {
    return rawBody;
  }
};

const bodyParser = (req, res, next) => {
  const { rawBody } = req;
  const { headers } = req;

  const contentType = headers['content-type'];

  if (contentType === 'multipart/form-data') {
    return next();
  }

  if (contentType === 'application/json') {
    req.body = parseJsonBody(rawBody);
    return next();
  }

  req.body = parseFormUrlEncodedBody(rawBody);

  next();
};

module.exports = {
  bodyParser,
  parseFormUrlEncodedBody
};
