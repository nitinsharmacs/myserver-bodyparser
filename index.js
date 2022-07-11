const parseMultipartFormData = require('./src/multipartFormParser.js');
const parseJsonBody = require("./src/parseJsonBody.js");
const parseFormUrlEncodedBody = require("./src/parseUrlEncoded.js");

const loadBody = (req, cb) => {
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
  const { headers } = req;

  const contentType = headers['content-type'];

  if (!contentType) {
    next();
    return;
  }

  loadBody(req, (err, body) => {
    if (err) {
      return next();
    }

    if (contentType.startsWith('multipart/form-data')) {
      req.body = parseMultipartFormData(body, getBoundary(headers));
      return next();
    }

    if (contentType === 'application/json') {
      req.body = parseJsonBody(body.toString());
      return next();
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      req.body = parseFormUrlEncodedBody(body.toString());

      next();
    }
  });
};

module.exports = bodyParser;
