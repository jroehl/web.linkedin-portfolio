const { getRandomColor } = require('./utils.js');

module.exports = {
  validKeys: ['SECTIONS', 'PROFILE', 'LANGUAGES', 'PROJECTS', 'EDUCATION', 'CERTIFICATIONS', 'POSITIONS', 'SKILLS', 'EMAIL_ADDRESSES'],
  sectionsWorksheet: [
    ['Header', 'Keys', 'Color'],
    ['projects', 'PROJECTS', getRandomColor()],
    ['education', 'EDUCATION', getRandomColor()],
    ['certifications', 'CERTIFICATIONS', getRandomColor()],
    ['work', 'POSITIONS', getRandomColor()],
    ['languages & skills', 'LANGUAGES, SKILLS', getRandomColor()],
  ],
};
