const tinycolor = require('tinycolor2');
const config = require('../config');

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

module.exports = meta => {
  console.log(`Generating dynamic color palettes: "${config.palettes.join('", "')}"`);

  const styleSets = [
    {
      ...meta.background,
      selector: 'section.background',
    },
    ...meta.stacks.map((stack, i) => ({ ...stack, selector: `section#stack-${i + 1}` })),
  ];

  const style = {
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
    ...styleSets.reduce((red, { backgroundcolor, fontcolor, selector }) => {
      const bgCol = generateVariants(backgroundcolor);
      const fontCol = generateVariants(fontcolor);
      return {
        ...red,
        ...config.palettes.reduce((redStyle, style) => {
          const backgroundColor = bgCol[style];
          const color = fontCol[style];

          const backgroundColorIsDark = tinycolor(backgroundColor).isDark();
          const backgroundEqualsFont = tinycolor.equals(tinycolor(backgroundColor), tinycolor(color));
          const varColor = backgroundEqualsFont ? change(color, 30) : color;

          const suffix = style === 'color' ? '' : `.${style}`;
          const dynStackSelector = `main${suffix}, main${suffix} ${selector}`;

          return {
            ...redStyle,
            [dynStackSelector]: {
              'background-color': backgroundColor,
            },
            [`${dynStackSelector}, ${dynStackSelector} a, ${dynStackSelector} i`]: {
              color: varColor,
            },
            [`${dynStackSelector} a:visited, ${dynStackSelector} a.variant:visited`]: {
              color: darken(color),
            },
            [`${dynStackSelector} a.variant:visited`]: {
              color: darken(change(color, 15)),
            },
            [`${dynStackSelector} a:hover`]: {
              color: lighten(color),
            },
            [`${dynStackSelector} a.variant:hover`]: {
              color: lighten(change(color, 15)),
            },
            [`${dynStackSelector} .variant`]: {
              color: change(color, 15),
            },
            [`${dynStackSelector} .chip`]: {
              background: change(backgroundColor, 30),
              color: backgroundColorIsDark ? lighten(color, 30) : darken(color, 30),
            },
            [`${dynStackSelector} .timeline .timeline-item .timeline-icon.icon-lg, ${dynStackSelector}
        .timeline .timeline-item .timeline-icon::before, ${dynStackSelector} blockquote`]: {
              'border-color': varColor,
            },
            [`${dynStackSelector} .timeline .timeline-item::before`]: {
              background: color,
            },
          };
        }, {}),
      };
    }, {}),
  };

  const styleString = Object.keys(style).reduce((styleString, selector) => {
    return `${styleString}${selector}{${Object.entries(style[selector]).reduce((styleString, [propName, propValue]) => {
      return `${styleString}${propName}:${propValue};`;
    }, '')}}`;
  }, '');

  return styleString;
};
