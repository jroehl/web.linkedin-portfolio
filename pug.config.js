const data = require('./tmp/data.json');
const { icons, palettes } = require('./config');

require('dotenv').config();

module.exports = {
  locals: {
    config: {
      icons,
      palettes,
      env: process.env.BUILD_ENV || 'local',
      isProduction: process.env.BUILD_ENV === 'production',
      hasGA: !!process.env.GOOGLE_ANALYTICS,
      gaTrackingId: process.env.GOOGLE_ANALYTICS,
    },
    ...data,
  },
};
