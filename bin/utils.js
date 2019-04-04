const { identity, pickBy, defaultsDeep } = require('lodash');

/**
 * Generate random color as HEX string
 * @returns {string}
 */
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Convert string to Camel Case
 * @param {string} s
 * @returns {string}
 */
const toCamelCase = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * Normalize string to camel case with whitespace
 * @param {string} key
 * @returns {string}
 */
const normalizeKey = key => {
  const parts = key.split('_');
  return parts.map(toCamelCase).join(' ');
};

/**
 * Check environment variables for mapping keys of individual worksheets
 * @param {array<string>} validKeys
 * @param {string} [prefix='SHEET_MAPPING_']
 * @returns {object}
 */
const extractMappingKeys = (validKeys, prefix = 'SHEET_MAPPING_') => {
  return validKeys.reduce(
    (map, key) => ({
      ...map,
      [process.env[`${prefix}${key}`] || normalizeKey(key)]: key,
    }),
    {}
  );
};

module.exports = {
  getRandomColor,
  toCamelCase,
  normalizeKey,
  extractMappingKeys,
};
