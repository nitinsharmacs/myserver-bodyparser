function parseUrlSearchParams(searchParams) {
  const params = {};

  for (const [param, value] of searchParams.entries()) {
    params[param] = value;
  }

  return params;
}
const parseFormUrlEncodedBody = (rawBody) => {
  const searchParams = new URLSearchParams(rawBody);

  return parseUrlSearchParams(searchParams);
};

module.exports = parseFormUrlEncodedBody;
