document.addEventListener('DOMContentLoaded', function () {
    var checkBox = document.getElementById("useStartDate");
    checkBox.addEventListener( 'change', function() {
        var div = document.getElementById("startDateShowHideWrapper");
        if (checkBox.checked == true) {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    });
});