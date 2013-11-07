var clocks;

$(function () {
    var i = 1;
    while (i--) {
        clocks = $("#clocks").CountDownClocks(Math.random()*50*1000); // Time in milliseconds.
    }
});