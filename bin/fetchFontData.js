const rp = require('request-promise-native');

const fetchInfo = async font => {
  const dashed = font.replace(/ /g, '-').toLowerCase();
  let fontFamily;
  let fontFamilies = [];
  let fallback = [];
  let isGoogleFont;
  try {
    const res = await rp.get(`https://google-webfonts-helper.herokuapp.com/api/fonts/${dashed}`, { json: true });
    fontFamily = res.family;
    fontFamilies = [fontFamily];
    fallback = [res.category];
    isGoogleFont = true;
  } catch (err) {
    fontFamily = font;
    const res = await rp.get(`https://www.cssfontstack.com/${dashed}`);
    const r = new RegExp(`font-family: (.*?);`, 'i');
    const matched = r.exec(res);
    if (matched) {
      const parts = matched[1].split(',').filter(x => x);
      fontFamilies = parts.slice(0, -1);
      fallback = parts.slice(-1);
    }
    isGoogleFont = false;
  }
  const cssFontFamily = [...fontFamilies, ...fallback].filter(x => x).join(', ') || fontFamily;
  return {
    fontFamily,
    fontFamilies,
    fallback,
    isGoogleFont,
    cssFontFamily,
  };
};

const fetchNeeded = async fonts => {
  const fontData = await Promise.all(
    [...new Set(fonts)].map(async font => {
      const res = await fetchInfo(font);
      return { ...res, font };
    })
  );

  const parts = fontData
    .reduce((red, { isGoogleFont, fontFamily }) => {
      if (!isGoogleFont) return red;
      return [...red, fontFamily.replace(/ /, '+')];
    }, [])
    .join('|');

  let googleImport = '';
  if (parts) {
    googleImport = `@import url('https://fonts.googleapis.com/css?family=${parts}');`;
  }

  return { fontData: fontData.reduce((red, data) => ({ ...red, [data.fontFamily]: data }), {}), googleImport };
};

module.exports.fetchInfo = fetchInfo;
module.exports.fetchNeeded = fetchNeeded;
