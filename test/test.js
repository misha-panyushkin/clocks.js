$(function () {
    var i = 1000;
    var dummy = $("#clocks");
    var TIMEOUT = new Date();
    while (i--) {
        //new CDC(dummy)
        dummy.countDown(100);
    }
    console.log(new Date() - TIMEOUT);
});