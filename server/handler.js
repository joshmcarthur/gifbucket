'use strict';

const hashCode = function (str) {
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const buildResponse = (statusCode, payload) => (
  {
    statusCode: statusCode,
    isBase64Encoded: false,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(payload)
  }
);

const fetch = require('node-fetch');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const fileType = require("file-type");

const s3 = new AWS.S3();

module.exports.http = (event, _context, callback) => {
  if (!event.queryStringParameters) return callback(null, buildResponse(406, { message: "Missing URL to download." }));

  module.exports.save(event.queryStringParameters.url)
    .then(() => callback(null, buildResponse(202, { success: true })))
    .catch(err => callback(null, buildResponse(406, { message: err.message })));
}

module.exports.save = (image_url) => {
  return fetch(image_url)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      return Promise.reject(new Error(
        `Failed to fetch ${response.url}: ${response.status} ${response.statusText}`));
    })
    .then(response => response.buffer())
    .then(buffer => {
      var type = fileType(buffer);
      if (!type || (type && !type.mime.match(/^(image|video)\//))) {
        return Promise.reject(new Error(`${image_url} is of invalid type${type ? `: ${type.mime}` : ""}`));
      }

      var params = {
        Bucket: process.env.BUCKET,
        Key: hashCode(image_url).toString() + (type ? "." + type.ext : ""),
        ContentDisposition: 'inline',
        CacheControl: 'public, max-age=31536000',
        ContentType: (type ? type.mime : null),
        Body: buffer,
        ACL: "public-read"
      }

      return s3.putObject(params).promise();
    });
};
