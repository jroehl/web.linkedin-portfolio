const { promisify } = require('util');
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const GoogleSpreadsheet = require('google-spreadsheet');
const { pick } = require('lodash');
const gravatar = require('gravatar');

require('dotenv').config();

const config = require('../config');
const { extractMappingKeys } = require('./utils');

/**
 * Fetch the first row and return as header (with normalized titles)
 * @param {object} sheet
 * @returns {promise}
 */
const getHeaderRow = async sheet => {
  const getCells = promisify(sheet.getCells);
  const cells = await getCells({ 'min-row': 1, 'max-row': 1 });
  return cells.reduce(
    (red, { _value }) => ({
      ...red,
      [_value.replace(/\s+/g, '').toLowerCase()]: _value,
    }),
    {}
  );
};

/**
 * Fetch rows and get values by header row
 * @param {object} sheet
 * @param {array<string>} header
 * @returns {promise}
 */
const getValues = async (sheet, header) => {
  const getRows = promisify(sheet.getRows);
  const rows = await getRows();
  return rows.map(row => pick(row, header));
};

/**
 * Fetch and process data from spreadsheet
 */
const fetchData = async () => {
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!spreadsheetId) throw new Error('Spreadsheet ID is required');

  const doc = new GoogleSpreadsheet(spreadsheetId);
  const getInfo = promisify(doc.getInfo);

  const { title, author, worksheets } = await getInfo();
  const mappingKeys = extractMappingKeys(config.validKeys);

  console.log(`\nQuerying "${title}" (${spreadsheetId}) by "${author.email}"`);

  const res = await Promise.all(
    worksheets.map(async sheet => {
      const { title } = sheet;
      const mapped = mappingKeys[title];
      if (!mapped)
        throw new Error(`Worksheet "${title}" mapping error - check environment variables\nCurrent Mappings\n${JSON.stringify(mappingKeys, null, 2)}`);

      console.log(`Fetching data for ${title} [${mapped}]`);
      const header = await getHeaderRow(sheet);
      const values = await getValues(sheet, Object.keys(header));
      return { title, mapped, header, values };
    })
  );

  const { SECTIONS, ...data } = res.reduce((red, d) => ({ ...red, [d.mapped]: d }), {});

  if (!SECTIONS) {
    console.info('No Sections worksheet found, falling back to default sections');
    SECTIONS = { values: config.defaults.sections };
  }

  const validKeys = config.validKeys.filter(key => data[key]);
  const sections = SECTIONS.values.map(({ keys, ...rest }) => {
    return {
      ...rest,
      keys: Array.isArray(keys)
        ? keys
        : keys.split(',').map(s => {
            const cleaned = s.trim();
            if (!validKeys.includes(cleaned)) throw new Error(`Key "${cleaned}" for "${rest.header}" section is invalid`);
            return cleaned;
          }),
    };
  });

  const emailAddresses = {
    ...data.EMAIL_ADDRESSES,
    values: data.EMAIL_ADDRESSES.values.reduce((red, address) => {
      if (address.primary !== 'Yes') return red;
      return [
        ...red,
        {
          gravatar: gravatar.url(address.emailaddress, { s: '200', d: 'retro', r: 'g' }),
          favicon: gravatar.url(address.emailaddress, { s: '16', d: 'retro', r: 'g' }),
          ...address,
        },
      ];
    }, []),
  };

  return {
    data: {
      ...data,
      EMAIL_ADDRESSES: emailAddresses,
    },
    meta: {
      sections,
      keys: validKeys,
      spreadsheetId,
    },
  };
};

module.exports = fetchData;

fetchData()
  .then(data => {
    const path = resolve(__dirname, '..', 'tmp', 'data.json');
    writeFileSync(path, JSON.stringify(data));
    console.log(`Data from spreadsheet successfully stored in "${path}"\n`);
  })
  .catch(err => {
    console.error('\nError while fetching data from spreadsheet');
    console.log(err.message);
    console.log('');
  });
