require('dotenv').config();

// The account_id is your Ecovacs ID or email address.
exports.ACCOUNT_ID = process.env.ACCOUNT_ID;
exports.PASSWORD = process.env.PASSWORD;
// You need to provide the country code for the country you're in
// The module exports a countries object which contains a mapping
// between country codes and continent codes.
// If it doesn't appear to work try "WW", their world-wide catchall
exports.COUNTRY_CODE = process.env.COUNTRY_CODE;
exports.DEVICE_NUMBER = 0; // Starts at zero = the first device
exports.AUTH_DOMAIN = ''; // Can be left blank for Ecovacs - 'yeedi.com' for yeedi devices
