const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { resolve } = require('path');

require('dotenv').config();

const { URL: domain, BUILD_ENV, GOOGLE_ANALYTICS } = process.env;

process.stdout.write('Generating "robots.txt"');

const dir = resolve(__dirname, '..', 'dist');

let robots = 'User-agent: *\nDisallow: /';
if (BUILD_ENV === 'production') {
  robots = 'User-agent: *\nAllow: /';
}

writeFileSync(resolve(dir, 'robots.txt'), robots);

if (!domain) return console.info('\n"URL" environment variable is not set - sitemap generation skipped!\n');

process.stdout.write(' and "sitemap.xml"\n');

const lastMod = new Date().toJSON().slice(0, 10);

const separator = domain.slice(-1) === '/' ? '' : '/';

let setup = '';
if (GOOGLE_ANALYTICS) {
  setup = `
  <url>
    <loc>${`${domain}${separator}privacy-policy`}</loc>
    <lastmod>${lastMod}</lastmod>
  </url>`;
}

const xml = `\
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${`${domain}${separator}`}</loc>
    <lastmod>${lastMod}</lastmod>
  </url>
  <url>
    <loc>${`${domain}${separator}linkedin-portfolio-website`}</loc>
    <lastmod>${lastMod}</lastmod>
  </url>
  <url>
    <loc>${`${domain}${separator}imprint`}</loc>
    <lastmod>${lastMod}</lastmod>
  </url>${setup}
  <url>
    <loc>${`${domain}${separator}404`}</loc>
    <lastmod>${lastMod}</lastmod>
  </url>
</urlset>`;

if (!existsSync(dir)) mkdirSync(dir);

writeFileSync(resolve(dir, 'sitemap.xml'), xml);
