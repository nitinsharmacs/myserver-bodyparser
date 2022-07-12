const parseMultipartFormData = require('../src/multipartFormParser.js');
const assert = require('assert');
const fs = require('fs');

describe('parseMultipartFormData', () => {
  it('should parse request body having only text', () => {
    const boundary = '----123';
    const stringBody = `${boundary}\r\nContent-Disposition:form-data;name="age"\r\n\r\n21\r\n${boundary}--\r\n`;
    const bodyBuffer = Buffer.from(stringBody);

    const expected = {
      files: [],
      age: '21'
    };

    const actual = parseMultipartFormData(bodyBuffer, boundary);

    assert.deepStrictEqual(actual, expected);
  });

  it('should parse request body having text and file', () => {
    const boundary = '------WebKitFormBoundaryjymPozxUX37ilCnP';

    const bodyBuffer = fs.readFileSync('./testData/textFileBody');
    const actualFileBuffer = fs.readFileSync('./testData/actualCog.png');

    const expected = {
      files: [
        {
          filename: 'cog.png',
          name: 'file',
          buffer: actualFileBuffer,
          mimeType: 'image/png'
        }
      ],
      age: '21'
    };

    const actual = parseMultipartFormData(bodyBuffer, boundary);

    assert.deepStrictEqual(actual, expected);
  });
});
