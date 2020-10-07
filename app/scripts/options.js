'use strict';
global.browser = require('webextension-polyfill') //To get it picked up by gulp
const {saveOptions,restoreOptions,requestPermissions} = require('./lib/optionsHelper')

window.addEventListener('load', function(){
    var checkBox = document.getElementById("useStartDate");
    function showHideStartDate(){
        var div = document.getElementById("startDateShowHideWrapper");
        if (checkBox.checked == true) {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    }
    checkBox.addEventListener('change', showHideStartDate);
    restoreOptions(browser.runtime.getManifest().version, document)
    .then(showHideStartDate)
});


document.getElementById('save').addEventListener('click', function(){
    requestPermissions(document, document.getElementById('jiraURL').value)
    saveOptions(document)
});

