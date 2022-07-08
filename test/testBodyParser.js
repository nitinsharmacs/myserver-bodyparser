const assert = require('assert');
const { parseFormUrlEncodedBody } = require('../src/bodyParser.js');

describe('parseFormUrlEncodedBody', () => {
  it('should parse form url encoded body', () => {
    const body = 'name=nitin+sharma&age=21';

    const expected = {
      name: 'nitin sharma',
      age: '21'
    };

    assert.deepStrictEqual(parseFormUrlEncodedBody(body), expected);
  });
});