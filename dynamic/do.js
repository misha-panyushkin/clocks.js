var clocks;

$(function () {
    var i = 1;
    while (i--) {
        clocks = $("#clocks").countDown(Math.random()*50*1000); // Time in milliseconds.
    }
});