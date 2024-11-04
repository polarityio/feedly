'use strict';

const async = require('async');

const { setLogger } = require('./src/logger');
const { parseErrorToReadableJSON, ApiRequestError } = require('./src/errors');
const { createResultObject } = require('./src/create-result-object');
const { searchStream } = require('./src/search-stream');

const MAX_TASKS_AT_A_TIME = 2;
const disclaimerCache = {};
let Logger = null;

const startup = (logger) => {
  Logger = logger;
  setLogger(Logger);
};

const doLookup = async (entities, options, cb) => {
  Logger.trace({ entities }, 'doLookup');

  let lookupResults = [];
  const tasks = [];

  if (shouldShowDisclaimer(options)) {
    disclaimerCache[options._request.user.id] = new Date();

    const showDisclaimer = entities.map((entity) => {
      return {
        entity: entity,
        data: {
          summary: [`Accept Disclaimer`],
          details: {
            showDisclaimer: options.showDisclaimer,
            disclaimer: options.disclaimer
          }
        }
      };
    });

    return cb(null, showDisclaimer);
  }

  entities.forEach((entity) => {
    tasks.push(async () => {
      const searchResult = await searchStream(entity, options);
      const searchResultObject = createResultObject(entity, searchResult, options);
      lookupResults.push(searchResultObject);
    });
  });

  try {
    await async.parallelLimit(tasks, MAX_TASKS_AT_A_TIME);
  } catch (error) {
    Logger.error({ error }, 'Error in doLookup');
    return cb(error);
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};

function getTimeDifferenceInHoursFromNow(date) {
  const diffInMs = Math.abs(new Date() - date);
  return diffInMs / (1000 * 60 * 60);
}

function shouldShowDisclaimer(options) {
  if (!options.showDisclaimer) {
    return false;
  }

  const userId = options._request.user.id;

  if (options.disclaimerInterval.value === 'all' || !disclaimerCache[userId]) {
    return true;
  }

  const cachedDisclaimerTime = disclaimerCache[userId];

  const hours = getTimeDifferenceInHoursFromNow(cachedDisclaimerTime);
  Logger.trace({ hours }, 'Hours since last disclaimer');
  return hours >= options.disclaimerInterval;
}

async function onMessage(payload, options, cb) {
  switch (payload.action) {
    case 'declineDisclaimer':
      delete disclaimerCache[options._request.user.id];
      cb(null, {
        declined: true
      });
      break;
    case 'search':
      try {
        const searchResult = await searchStream(payload.entity, options);
        const searchResultObject = createResultObject(
          payload.entity,
          searchResult,
          options
        );
        cb(null, searchResultObject);
      } catch (error) {
        Logger.error({ error }, 'Error Searching Feedly');
        return cb(error);
      }
      break;
  }
}

function validateOptions(userOptions, cb) {
  let errors = [];

  if (
    typeof userOptions.apiKey.value !== 'string' ||
    (typeof userOptions.apiKey.value === 'string' &&
      userOptions.apiKey.value.length === 0)
  ) {
    errors.push({
      key: 'apiKey',
      message: 'You must provide a valid Feedly API key'
    });
  }

  if (
    typeof userOptions.streamId.value !== 'string' ||
    (typeof userOptions.streamId.value === 'string' &&
      userOptions.streamId.value.length === 0)
  ) {
    errors.push({
      key: 'streamId',
      message: 'You must provide a valid Feedly Stream Id'
    });
  }

  cb(null, errors);
}

module.exports = {
  startup,
  doLookup,
  validateOptions,
  onMessage
};
