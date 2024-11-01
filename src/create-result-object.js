const { getLogger } = require('./logger');

/**
 *
 * @param entities
 * @param apiResponse
 * @returns {*[]}
 */
const createResultObject = (entity, apiResponse, options) => {
  if (apiResponse && Array.isArray(apiResponse.items) && apiResponse.items.length > 0) {
    return {
      entity,
      data: {
        summary: createSummary(apiResponse, options),
        details: apiResponse
      }
    };
  } else {
    return {
      entity,
      data: null
    };
  }
};

/**
 * Creates the Summary Tags (currently just tags for ports)
 * @param match
 * @returns {string[]}
 */
const createSummary = (apiResponse, options) => {
  const tags = [];

  tags.push(`Results ${apiResponse.items.length}`);

  return tags;
};

module.exports = {
  createResultObject
};
