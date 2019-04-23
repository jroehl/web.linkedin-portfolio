const initProcess = require('./bin/processMarkdown');
const data = require('./tmp/data.json');
const { icons, palettes } = require('./config');

require('dotenv').config();

const processMarkdown = initProcess(data);

const markdown = {
  linkedinPortfolioWebsite: processMarkdown('./content/linkedin-portfolio-website.md'),
  imprint: processMarkdown('./content/imprint.md'),
};

const hasGA = !!process.env.GOOGLE_ANALYTICS;
if (hasGA) {
  markdown.privacyPolicy = processMarkdown('./content/privacy-policy.md');
}

module.exports = {
  locals: {
    markdown,
    config: {
      icons,
      palettes,
      env: process.env.BUILD_ENV || 'local',
      isProduction: process.env.BUILD_ENV === 'production',
      hasGA,
      gaTrackingId: process.env.GOOGLE_ANALYTICS,
    },
    ...data,
  },
};
