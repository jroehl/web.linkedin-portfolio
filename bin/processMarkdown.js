const showdown = require('showdown');
const { readFileSync } = require('fs');

const converter = new showdown.Converter();

/**
 * Process the markdown file, replace placeholders
 *
 * @param {object} data
 */
module.exports = ({ data }) => {
  const { URL } = process.env;

  const {
    EMAIL_ADDRESSES: {
      values: [email],
    },
    MISC: { name },
  } = data;

  return mdFile => {
    const md = readFileSync(mdFile, 'utf-8');
    const processed = md
      .replace(/{{UTM_SOURCE}}|{{URL}}/g, URL)
      .replace(/{{NAME}}/g, name)
      .replace(/{{MAIL}}/g, email.emailaddress);
    return converter.makeHtml(processed);
  };
};
