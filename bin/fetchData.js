const { promisify } = require('util');
const { writeFileSync } = require('fs');
const { resolve } = require('path');
const GoogleSpreadsheet = require('google-spreadsheet');
const { pick } = require('lodash');
const gravatar = require('gravatar');
const generateInlineStyles = require('./generateInlineStyles');

require('dotenv').config();

const config = require('../config');

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

  console.log(`\nQuerying "${title}" (${spreadsheetId}) by "${author.email}"`);

  const allWorksheets = worksheets.length;
  const res = await Promise.all(
    worksheets.map(async (sheet, i) => {
      const { title } = sheet;
      const normalized = title.replace(/ /g, '_').toUpperCase();
      const part = `${(i + 1).toString().padStart(allWorksheets.toString().length, '0')}/${allWorksheets}`;

      if (!config.validKeys.includes(normalized)) {
        console.info(`${part} | Worksheet title "${title}" [${normalized}] is not valid - skipping`);
        return null;
      }
      console.log(`${part} | Fetching data for "${title}" [${normalized}]`);
      const header = await getHeaderRow(sheet);
      const values = await getValues(sheet, Object.keys(header));
      return { title, normalized, header, values };
    })
  );

  const { SECTIONS, ...data } = res.reduce((red, d) => (d ? { ...red, [d.normalized]: d } : red), {});

  if (!SECTIONS) throw new Error('No "Sections" worksheet found, please follow setup steps.');

  const foundSheets = config.validKeys.filter(key => data[key]);
  const sections = SECTIONS.values.map(({ keys, ...rest }) => {
    return {
      ...rest,
      keys: Array.isArray(keys) ? keys : keys.split(',').map(s => s.trim()),
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

  const { stacks, background } = sections.reduce(
    (red, section) => {
      if (section.header === '$BACKGROUND') {
        return { ...red, background: section };
      }
      return { ...red, stacks: [...red.stacks, section] };
    },
    { background: null, stacks: [] }
  );

  if (!background) throw new Error('No "$BACKGROUND" section specified, please follow setup steps.');

  const meta = {
    background,
    stacks: stacks.reverse(),
    keys: foundSheets,
    spreadsheetId,
  };

  return {
    data: {
      ...data,
      EMAIL_ADDRESSES: emailAddresses,
    },
    meta: {
      ...meta,
      inlineStyles: generateInlineStyles(meta),
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
    process.exit(1);
  });
