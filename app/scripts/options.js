'use strict';
const {saveOptions,restoreOptions} = require('./lib/optionsHelper')

document.addEventListener('DOMContentLoaded', function(){return restoreOptions(document)});
document.getElementById('save').addEventListener('click', function(){return saveOptions(document)});