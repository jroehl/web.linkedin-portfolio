const data = require('./tmp/data.json');
const { validKeys, sectionsWorksheet } = require('./backend/config');
const { normalizeKey, hasGapiCreds } = require('./backend/utils');

require('dotenv').config();

const hasSetupPage = hasGapiCreds();
console.log(`Building website ${hasSetupPage ? 'with' : 'without'} "/setup" subpage`);

module.exports = {
  locals: {
    ...data,
    config: {
      hasSetupPage,
      icons: {
        // custom
        linkedin: 'fab fa-linkedin-in',
        github: 'fab fa-github',
        angel: 'fab fa-angellist',
        xing: 'fab fa-xing',
        // websites
        blog: 'fas fa-blog',
        personal: 'fas fa-user',
        rss: 'fas fa-rss',
        company: 'far fa-building',
        portfolio: 'fas fa-user-edit',
        // IM
        skype: 'fab fa-skype',
        aim: 'fas fa-crosshairs',
        yahoo: 'fab fa-yahoo',
        icq: 'fab fa-intercom',
        hangouts: 'fab fa-google',
        google: 'fab fa-google',
        qq: 'fab fa-qq',
        wechat: 'fab fa-weixin',
        industry: 'fas fa-industry',
        other: 'fas fa-globe',
        fallback: 'fas fa-globe',
      },
    },
    scriptData: {
      gapi: {
        apiKey: process.env.GAPI_API_KEY,
        clientId: process.env.GAPI_CLIENT_ID,
      },
      validKeys: validKeys.map(key => ({
        key,
        normalized: normalizeKey(key),
      })),
      sectionsWorksheet,
    },
  },
};
