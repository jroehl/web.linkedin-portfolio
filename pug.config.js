const data = require('./tmp/data.json');
const { icons } = require('./config');

module.exports = {
  locals: {
    config: {
      icons,
    },
    ...data,
  },
};