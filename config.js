const { getRandomColor } = require('./bin/utils.js');

const sections = [
  {
    header: 'about me',
    keys: ['PROFILE', 'EMAIL_ADDRESSES', 'LANGUAGES'],
    color: getRandomColor(),
  },
  {
    header: 'projects',
    keys: ['PROJECTS'],
    color: getRandomColor(),
  },
  {
    header: 'skills & education',
    keys: ['SKILLS', 'EDUCATION', 'CERTIFICATIONS'],
    color: getRandomColor(),
  },
  {
    header: 'work',
    keys: ['POSITIONS'],
    color: getRandomColor(),
  },
];

module.exports = {
  validKeys: ['SECTIONS', 'PROFILE', 'LANGUAGES', 'PROJECTS', 'EDUCATION', 'CERTIFICATIONS', 'POSITIONS', 'SKILLS', 'EMAIL_ADDRESSES'],
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
  defaults: {
    sections,
  },
};
