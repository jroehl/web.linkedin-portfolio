const { sectionsWorksheet } = window.config;

/**
 * Map two dimensional array to request array
 * @param {array<array<string>>} rows
 * @returns {array<object>}
 */
const createRowData = rows => {
  return rows.map(row => ({ values: row.map(stringValue => ({ userEnteredValue: { stringValue } })) }));
};

/**
 * Create create spreadsheet request according to data
 * @param {object} data
 * @returns {promise}
 */
export default data => {
  const { spreadsheets } = window.gapi.client.sheets;

  const sheets = data.map(({ normalized, parsed }, i) => ({
    properties: {
      sheetId: i + 2,
      title: normalized,
      index: i + 2,
      tabColor: {
        red: 0,
        green: 0,
        blue: 1,
      },
    },
    data: [
      {
        startRow: 0,
        startColumn: 0,
        rowData: createRowData(parsed.data),
      },
    ],
  }));

  return spreadsheets.create(
    {},
    {
      properties: {
        title: 'Linkedin Portfolio Website',
        locale: 'en',
      },
      sheets: [
        {
          properties: {
            sheetId: 1,
            title: 'Sections',
            index: 1,
            tabColor: {
              red: 0,
              green: 1,
              blue: 0,
            },
          },
          data: [
            {
              startRow: 0,
              startColumn: 0,
              rowData: createRowData(sectionsWorksheet),
            },
          ],
        },
        ...sheets,
      ],
    }
  );
};
