const data = require('./tmp/data.json');
const { icons, palettes } = require('./config');

module.exports = {
  locals: {
    config: {
      icons,
      palettes,
    },
    ...data,
  },
};
