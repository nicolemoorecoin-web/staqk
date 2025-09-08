// next.config.js
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // remove any experimental.appDir you had earlier
  webpack(config) {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    return config;
  },
};

module.exports = nextConfig;