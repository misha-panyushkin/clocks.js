/**
 * Created by Misha Panyushkin on 06.11.13.
 * Sensitive clocks counter.
 */

$(function () {

    var tic_mark = "d h m s".split(" "),
        tic_const = {
            d: 24*60*60,
            h: 60*60,
            m: 60,
            s: 1
        },
        tic_labels = {
            d: "дней",
            h: "часов",
            m: "минут",
            s: "секунд"
        },
        one_sec = 1000; // In milliseconds.


    /*
     * Init functions using in constructor call.
     * */
    function fillWithTime (ttg) {
        var that = this;
        ttg /= 1000;
        tic_mark.forEach(function (mark) {
            var arr;

            that[mark].v = parseInt(ttg / tic_const[mark]);
            arr = that.int2arr(that[mark].v);
            that[mark].$e.html(function (i) {
                return arr[i];
            });

            ttg -= that[mark].v*tic_const[mark];
        });
    }

    function createMarks () {
        var that = this;
        tic_mark.forEach(function (mark) {
            that[mark] = {
                v: 0,
                $e: $("<section>").attr("class", mark + " marks").append("<header><span><em></em></span><span><em></em></span></header>").append("<footer>" + tic_labels[mark] + "</footer>").appendTo(that.$c).find("em")
            };
        });
    }

    /*
     * Constructor function.
     * */
    function CDC ($set, time_to_go) {
        this.$c = $("<article/>").attr("class", "clocks");
        createMarks.call(this);
        fillWithTime.call(this, time_to_go);
        this.$c.appendTo($set);
    }

    /*
     * Defining a prototype methods collection.
     * The similar methods for calculating time by the following marks: days, hours, minutes, seconds.
     * */
    tic_mark.forEach(function (m, i, a) {

        CDC.prototype["set" + m.toUpperCase()] = function (amount) {

            var that = this,
                fI = (i == 3 || i == 2) ? 60 : (i == 0) ? 99 : 24,
                balance, full;

            amount = (amount || 1);

            // 1. Counting.
            full = Math.floor(amount / fI);
            balance = this[m].v - amount % fI;

            if (balance < 0) {
                balance = fI + balance;
                full++; // Cause counter reached zero and goes below.
            }

            // 2. Checking.
            if (full) {

                this.finished = !a[i-1];

                if (this.finished) {
                    // Stop counter!
                } else {
                    this["set" + a[i-1].toUpperCase()](full);
                }

                if (this.finished) {
                    balance = 0;
                }
            }

            this[m].v = balance;

            // 3. Visualizing.
            this.int2arr(this[m].v).forEach(function (v, i) {

                that[m].$e.eq(i).html(function (i, old) {

                    if (old != v) {
                        $(this).fadeOut(200, "swing", function () {
                            $(this).html(v).fadeIn(200, "swing");
                        });
                    }
                });
            });
        };
    });

    /*
     * System method.
     * */
    CDC.prototype.int2arr = function (i) {
        var arr = i.toString().split("");
        if (arr.length == 1)
            arr.splice(0, 0, "0");
        return arr;
    };

    /*
    CDC.prototype = {
        fill:   function (ttg) {
            if (ttg) {
                this.stop();
                fillWithTime.call(ttg);
            }
        },
        start:  function (ttg) {

        },
        stop:   function () {},
        resume: function () {}
    };*/

    CDC.prototype.start = function (ttg) {

        if (ttg) {
            this.stop();
            fillWithTime.call(this, ttg);
        }

        this.resume();
    };

    CDC.prototype.resume = function () {
        this.last = new Date().getTime();
        this.count();
    };

    CDC.prototype.stop = function () {
        this.stopped = true;
        clearTimeout(this.to);
        return (function () {
            var that = this,
                remain = 0;
            tic_mark.forEach(function (v) {
                remain += that[v].v*tic_const[v]
            });
            return remain*1000;
        }).call(this);
    };

    CDC.prototype.count = function (ms) {
        var that = this;
        ms = ms || one_sec;
        this.to = setTimeout(function () {
            var atTHEmo = new Date().getTime(),
                ts = atTHEmo - that.last,
                fS, balance = one_sec;
            if (ts < one_sec) {
                // Not full second passed. Add timeout for balance.
                balance = one_sec - ts;
                console.log("1: " + balance);
            } else if (ts > one_sec) {
                // setS(amount) for need amount and if needed add timeout for balance.
                fS = Math.floor(ts/one_sec);
                console.log("2: " + balance + " : " + fS);
                that.setS(fS);
                balance = one_sec - ts % one_sec;
                that.last += fS*one_sec;
            } else {
                console.log("3: " + balance);
                // setS() and start new second counter.
                that.setS();
                that.last = new Date().getTime();
            }

            if (that.finished) {
                clearTimeout(that.to);
            } else {
                that.count(balance);
            }
        }, ms);
    };

    $.fn.CountDownClocks = function (ttg) {
        var cl = new CDC(this, ttg);
        cl.start();
        return cl;
    };
});
