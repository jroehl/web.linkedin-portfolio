import JSZip from 'jszip';
import { parse } from 'papaparse';

const { validKeys } = window.config;

/**
 * Parse the csv strings to two dimensional array
 * @param {array<object>} input
 * @returns {promise}
 */
const parseCsv = zips =>
  Promise.all(
    zips.map(({ zip, ...rest }) => {
      return zip.async('text').then(content => ({
        ...rest,
        name: zip.name,
        parsed: parse(content),
      }));
    })
  );

/**
 * Extract the needed sheet values
 * @param {object} input
 * @returns {array<object>}
 */
const extractSheets = ({ files }) =>
  validKeys.reduce((red, { normalized, key }) => {
    const zip = files[`${normalized}.csv`];
    if (!zip) return red;
    return [...red, { key, normalized, zip }];
  }, []);

/**
 * Create create spreadsheet request according to data
 * @param {object} file
 * @returns {promise}
 */
export default file => {
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    alert('The File APIs are not fully supported in this browser.');
    return;
  }

  return new JSZip()
    .loadAsync(file)
    .then(extractSheets)
    .then(parseCsv)
    .then(res => {
      if (!res.length) throw Error('No valid data found in zip file');
      return res;
    });
};
