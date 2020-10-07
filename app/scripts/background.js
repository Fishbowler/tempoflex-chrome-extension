'use strict';
global.browser = require('webextension-polyfill') //To get it picked up by gulp
const backgroundHelpers = require('./lib/backgroundHelper')
backgroundHelpers.installOrUpgradeStorage()