const CRLFB = Buffer.from('\r\n');
const TCRLFB = Buffer.from('\r\n\r\n');

const refineHeaderValue = (value) => {
  return value.trim().replaceAll('"', '');
};

const parseHeader = (rawHeader) => {
  const headers = rawHeader.split('\r\n').join(';');
  const _headers = headers.split(';');

  const parsedHeaders = {};
  _headers.forEach(header => {
    const [name, value] = header.split(/:|=/);
    parsedHeaders[name.trim().toLowerCase()] = refineHeaderValue(value);
  });
  return parsedHeaders;
};

const parseBodyBlock = ({ rawHeader, rawValue }) => {
  const refinedHeader = rawHeader.toString().trim();
  return {
    headers: parseHeader(refinedHeader),
    value: rawValue
  };
};

const parseBody = (reqBodyBuffer, boundary) => {
  let bodyBuffer = reqBodyBuffer;
  const boundaryBuffer = Buffer.from(boundary + CRLFB);
  const boundaryBufferEnd = Buffer.from(boundary + '--' + CRLFB);
  const boundaryLength = boundaryBuffer.length;

  const parsedBody = [];

  let boundaryPos = bodyBuffer.indexOf(boundaryBuffer);
  let dataStartIndex = bodyBuffer.indexOf(TCRLFB);

  while (dataStartIndex >= 0) {
    const rawHeader = bodyBuffer.slice(boundaryLength, dataStartIndex);

    boundaryPos = bodyBuffer.indexOf(
      boundaryBuffer, dataStartIndex
    );

    if (boundaryPos < 0) {
      boundaryPos = bodyBuffer.indexOf(
        boundaryBufferEnd, dataStartIndex
      );
    }

    const rawValue = bodyBuffer.slice(
      dataStartIndex + TCRLFB.length, boundaryPos - 2
    );

    bodyBuffer = bodyBuffer.slice(boundaryPos);

    dataStartIndex = bodyBuffer.indexOf(TCRLFB);

    parsedBody.push({ rawHeader, rawValue });
  }

  return parsedBody;
};

const groupBody = (bodyContents) => {
  const body = { files: [] };

  bodyContents.forEach(bodyContent => {
    const { headers, value } = bodyContent;

    if (!(headers['content-type'] || headers['filename'])) {
      body[headers.name] = value.toString();
      return;
    }

    const file = {
      filename: headers['filename'],
      mimeType: headers['content-type'],
      name: headers['name'],
      buffer: value
    };
    body['files'].push(file);
  });

  return body;
};

const getBoundary = (headers) => {
  const contentType = headers['content-type'];

  const [, boundaryString] = contentType.split(';');
  const [, boundary] = boundaryString.trim().split('=');
  return '--'.concat(boundary);
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

const parseMultipartFormData = (req, cb) => {
  getBody(req, (err, body) => {
    if (err) {
      return cb(err);
    }

    const boundary = getBoundary(req.headers);
    const bodyContents = parseBody(body, boundary);

    req.body = groupBody(bodyContents.map(parseBodyBlock));
    cb(null);
  });
};

module.exports = parseMultipartFormData;
