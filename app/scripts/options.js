'use strict';
import {saveOptions,restoreOptions} from './lib/optionsHelper'

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
    restoreOptions(document)
    .then(showHideStartDate)
});

document.getElementById('save').addEventListener('click', function(){saveOptions(document)});
