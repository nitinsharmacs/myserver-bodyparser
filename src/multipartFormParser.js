const CRLFB = Buffer.from('\r\n');
const CRLFBx2 = Buffer.from('\r\n\r\n');

const HEADER_NAME_VALUE_DELIM = /:|=/;

const refineHeaderValue = (value) => value.trim().replaceAll('"', '');

const refineHeaderName = (name) => name.trim().toLowerCase();

const unifyHeader = (rawHeader) => {
  return rawHeader.split('\r\n').join(';');
};

const parseHeader = (rawHeader) => {
  const headers = unifyHeader(rawHeader).split(';');

  const parsedHeaders = {};

  headers.forEach(header => {
    const [name, value] = header.split(HEADER_NAME_VALUE_DELIM);
    parsedHeaders[refineHeaderName(name)] = refineHeaderValue(value);
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
  let dataStartIndex = bodyBuffer.indexOf(CRLFBx2);

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
      dataStartIndex + CRLFBx2.length, boundaryPos - 2
    );

    bodyBuffer = bodyBuffer.slice(boundaryPos);

    dataStartIndex = bodyBuffer.indexOf(CRLFBx2);

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

const parseMultipartFormData = (body, boundary) => {
  const bodyContents = parseBody(body, boundary);

  return groupBody(bodyContents.map(parseBodyBlock));

};

module.exports = parseMultipartFormData;
