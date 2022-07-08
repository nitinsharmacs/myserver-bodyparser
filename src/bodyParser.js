const parseMultipartFormData = require('./multipartFormParser.js');

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

const getBody = (req, cb) => {
  const { headers } = req;

  if (!headers['content-length']) {
    return cb(new Error('No content-length found'));
  }

  const contentSize = +headers['content-length'];

  const bodyBuffer = Buffer.alloc(contentSize);
  let dataIndex = 0;

  req.on('data', (chunk) => {
    bodyBuffer.fill(chunk, dataIndex);
    dataIndex += chunk.length;
  });

  req.on('end', () => {
    cb(null, bodyBuffer);
  });
};

const getBoundary = (headers) => {
  const contentType = headers['content-type'];

  const [, boundaryString] = contentType.split(';');
  const [, boundary] = boundaryString.trim().split('=');
  return '--'.concat(boundary);
};

const bodyParser = (req, res, next) => {
  console.log(req.headers);
  const { headers } = req;

  const contentType = headers['content-type'];

  if (!contentType) {
    next();
    return;
  }

  getBody(req, (err, body) => {
    if (err) {
      return next();
    }

    if (contentType.startsWith('multipart/form-data')) {
      req.body = parseMultipartFormData(body, getBoundary(headers));
      return next();
    }

    if (contentType === 'application/json') {
      req.body = parseJsonBody(body);
      return next();
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      req.body = parseFormUrlEncodedBody(body);

      next();
    }
  });
};

module.exports = {
  bodyParser,
  parseFormUrlEncodedBody
};
