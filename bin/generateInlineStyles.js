const tinycolor = require('tinycolor2');
const config = require('../config');
const { fetchNeeded } = require('./fetchFontData');

const tags = {
  headings: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  text: ['p', 'a', 'b', 'strong', 'em', 'mark', 'sub', 'sup', 'small', 'del', 'ins', 'blockquote', 'span'],
};

/**
 * Generate the different color variants
 *
 * @param {string} colorIpt
 * @returns {object}
 */
const generateVariants = colorIpt => {
  const color = tinycolor(colorIpt);
  if (!color.isValid()) throw new Error(`Color "${colorIpt}" is invalid`);
  const rgb = color.toRgb();
  const isBlack = !rgb.r && !rgb.g && !rgb.b;
  const isWhite = rgb.r === 255 && rgb.g === 255 && rgb.b === 255;

  let inverted;
  if (isBlack) {
    inverted = tinycolor('white');
  } else if (isWhite) {
    inverted = tinycolor('black');
  } else {
    inverted = color.clone().complement();
  }

  return {
    colorIpt,
    color: color.toRgbString(),
    inverted: inverted.toRgbString(),
    greyscale: color
      .clone()
      .greyscale()
      .toRgbString(),
    'inverted-greyscale': inverted
      .clone()
      .greyscale()
      .toRgbString(),
  };
};

/**
 * Darken the color
 *
 * @param {string} color
 * @param {number} [amt=5]
 * @returns {string}
 */
const lighten = (color, amt = 5) =>
  tinycolor(color)
    .lighten(amt)
    .toRgbString();

/**
 * Lighten the color
 *
 * @param {string} color
 * @param {number} [amt=5]
 * @returns {string}
 */
const darken = (color, amt = 5) =>
  tinycolor(color)
    .darken(amt)
    .toRgbString();

/**
 * Change the color by lightening or darkening it, depending on color darkness
 *
 * @param {string} color
 * @param {number} [amt=5]
 * @returns {string}
 */
const change = (color, amt = 5) => {
  const col = tinycolor(color);
  return col.isDark() ? col.lighten(amt) : col.darken(amt);
};

const buildDynamicSelector = (selector, tags) => tags.map(tag => `${selector} ${tag}`).join(', ');

const buildDynamicBlock = (selector, properties, types = ['headings', 'text']) => {
  return types.reduce(
    (red, type) => ({
      ...red,
      [buildDynamicSelector(selector, tags[type])]: Object.entries(properties).reduce(
        (red, [key, value]) => ({
          ...red,
          [key]: value[type],
        }),
        {}
      ),
    }),
    {}
  );
};

const buildDynamicStyles = (sets, fontData, bgContrast) =>
  sets.reduce((red, { backgroundcolor, headings, text, selector }) => {
    const bgCol = generateVariants(backgroundcolor);
    const [headingsFont, headingsCol] = headings.split(' | ');
    const [textFont, textCol] = text.split(' | ');
    const cssImports = {
      text: fontData[textFont].cssFontFamily,
      headings: fontData[headingsFont].cssFontFamily,
    };

    const textColVariants = generateVariants(textCol);
    const headingsColVariants = generateVariants(headingsCol);
    return {
      ...red,
      ...config.palettes.reduce((redStyle, style) => {
        const backgroundColor = bgContrast ? change(bgCol[style], 1) : bgCol[style];

        const colors = {
          text: textColVariants[style],
          headings: headingsColVariants[style],
        };

        const backgroundColorIsDark = tinycolor(backgroundColor).isDark();

        const backgroundEqualsTextFont = tinycolor.equals(tinycolor(backgroundColor), tinycolor(colors.text));
        const backgroundEqualsHeadingsFont = tinycolor.equals(tinycolor(backgroundColor), tinycolor(colors.headings));
        const varColors = {
          text: backgroundEqualsTextFont ? change(colors.text, 30) : colors.text,
          headings: backgroundEqualsHeadingsFont ? change(colors.headings, 30) : colors.headings,
        };

        const suffix = style === 'color' ? '' : `.${style}`;
        const dynStackSelector = `body${suffix} ${selector}`;

        return {
          ...redStyle,
          [dynStackSelector]: {
            'background-color': backgroundColor,
            color: colors.headings,
          },
          ...buildDynamicBlock(dynStackSelector, { color: varColors, 'font-family': cssImports }),
          [`${dynStackSelector} a:visited, ${dynStackSelector} a.variant:visited`]: {
            color: darken(colors.text),
          },
          [`${dynStackSelector} a.variant:visited`]: {
            color: darken(change(colors.text, 15)),
          },
          [`${dynStackSelector} a:hover`]: {
            color: lighten(colors.text),
          },
          [`${dynStackSelector} a.variant:hover`]: {
            color: lighten(change(colors.text, 15)),
          },
          ...buildDynamicBlock(`${dynStackSelector} .variant`, {
            color: {
              headings: change(colors.headings, 15),
              text: change(colors.text, 15),
            },
          }),
          [`${dynStackSelector} .chip`]: {
            background: change(backgroundColor, 30),
          },
          ...buildDynamicBlock(`${dynStackSelector} .chip`, {
            color: {
              headings: backgroundColorIsDark ? lighten(colors.headings, 30) : darken(colors.headings, 30),
              text: backgroundColorIsDark ? lighten(colors.text, 30) : darken(colors.text, 30),
            },
          }),
          [`${dynStackSelector} .timeline .timeline-item .timeline-icon.icon-lg, ${dynStackSelector}
    .timeline .timeline-item .timeline-icon::before, ${dynStackSelector} blockquote`]: {
            'border-color': varColors.text,
          },
          [`${dynStackSelector} .timeline .timeline-item::before`]: {
            background: colors.text,
          },
        };
      }, {}),
    };
  }, {});

const generateCss = style =>
  Object.keys(style).reduce((styleString, selector) => {
    return `${styleString}${selector}{${Object.entries(style[selector]).reduce((styleString, [propName, propValue]) => {
      return `${styleString}${propName}:${propValue};`;
    }, '')}}`;
  }, '');

module.exports = async meta => {
  console.log(`Generating dynamic color palettes: "${config.palettes.join('", "')}"`);

  const families = meta.stacks.reduce((red, { headings, text }) => [...red, headings.split(' | ')[0], text.split(' | ')[0]], []);
  const { fontData, googleImport } = await fetchNeeded(families);

  const indexStyle = {
    // create background animation delays
    ...meta.background.keys.reduce((red, _, i) => {
      return {
        ...red,
        [`section.background div.container > div.animated-load:nth-child(${i + 1})`]: {
          'animation-delay': `${1200 + i * 100}ms`,
        },
      };
    }, {}),
    // create stack styles
    ...buildDynamicStyles(
      [
        {
          ...meta.background,
          selector: 'section.background',
        },
        ...meta.stacks.map((stack, i) => ({ ...stack, selector: `section#stack-${i + 1}` })),
      ],
      fontData
    ),
  };

  const baseStyle = {
    ...buildDynamicStyles(
      [
        {
          ...meta.background,
          selector: '',
        },
      ],
      fontData
    ),
    ...buildDynamicStyles(
      [
        {
          ...meta.background,
          selector: '.cc-window',
        },
      ],
      fontData,
      true
    ),
  };

  return {
    import: googleImport,
    base: generateCss(baseStyle),
    index: generateCss(indexStyle),
  };
};
