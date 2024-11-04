/*
 * Copyright (c) 2024, Polarity.io, Inc.
 */
const polarityRequest = require('./polarity-request');
const { ApiRequestError } = require('./errors');
const { getLogger } = require('./logger');
const SUCCESS_CODES = [200];

async function searchStream(entity, options) {
  const Logger = getLogger();

  const requestOptions = {
    uri: 'https://api.feedly.com/v3/search/contents',
    method: 'GET',
    qs: {
      q: entity.value,
      streamId: options.streamId,
      count: options.count
    },
    headers: {
      Authorization: `Bearer ${options.apiKey}`
    }
  };

  Logger.trace({ requestOptions }, 'Request Options');

  const apiResponse = await polarityRequest.request(requestOptions, options);

  Logger.trace({ apiResponse }, 'Search Feedly Contents API Response');

  if (!SUCCESS_CODES.includes(apiResponse.statusCode)) {
    throw new ApiRequestError(
      `Unexpected status code ${apiResponse.statusCode} received when making request to the Feedly Content API`,
      {
        statusCode: apiResponse.statusCode,
        requestOptions,
        responseBody: apiResponse.body
      }
    );
  }

  let body = stripHtmlTagsFromSummary(apiResponse.body);
  return body;
}

/**
 * Removes image tags and the content of the tag
 * Removes <b>, <br>, <p>, and <a> tags but leaves the content between them
 * @param body
 * @returns {*}
 */
function stripHtmlTagsFromSummary(body) {
  if (Array.isArray(body.items)) {
    body.items.forEach((item) => {
      if (item.summary && item.summary.content) {
        item.summary.content = item.summary.content.replace(/<img[^>]*>/g, '');
        item.summary.content = item.summary.content.replace(
          /(<b>|<\/b>|<br>|<\/br>|<p>|<\/p>|<\/a>|<a .*?>)/g,
          ''
        );
      }
    });
  }
  return body;
}

module.exports = {
  searchStream
};
