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
     * Init function using in constructor call.
     * */
    function init (ttg) {
        var that = this;
        ttg /= 1000;
        tic_mark.forEach(function (mark) {
            var time = parseInt(ttg / tic_const[mark]),
                arr = that.int2arr(time);
            that[mark] = {
                v: time,
                $e: $("<div>").attr("class", mark + " marks").append("<div><span><em>" + arr[0] + "</em></span><span><em>" + arr[1] + "</em></span></div>").append("<p>" + tic_labels[mark] + "</p>").appendTo(that.$c).find("em")
            };
            ttg -= that[mark].v*tic_const[mark];
        });
    }

    /*
     * Constructor function.
     * */
    function CDC ($set, time_to_go) {
        this.$c = $set;
        init.call(this, time_to_go);
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

            full = Math.floor(amount / fI);
            balance = this[m].v - amount % fI;

            if (balance < 0) {
                balance = fI + balance;
                full++; // Cause counter reached zero and goes below.
            }

            if (full) {
                if (i === 0 || !this["set" + a[i-1].toUpperCase()](full)) {
                    return false;
                } else {
                    this[m].v = balance;
                }
            } else {
                this[m].v = balance;
            }

            // Data visualization.
            this.int2arr(this[m].v).forEach(function (v, i) {

                that[m].$e.eq(i).html(function (i, old) {

                    if (old != v) {
                        $(this).fadeOut(200, "swing", function () {
                            $(this).html(v).fadeIn(200, "swing");
                        });
                    }
                });
            });

            return true;
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

    CDC.prototype.start = function () {
        this.last = new Date().getTime();
        this.count();
    };

    CDC.prototype.stop = function () {
        clearTimeout(this.to);
        return function () {
            var that = this,
                remain = 0;
            tic_mark.forEach(function (v, i) {
                remain += that[v].v*tic_const[i]
            });
            return remain;
        }
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
                that.setS(fS);
                balance = one_sec - ts % one_sec;
                that.last += fS*one_sec;
                console.log("2: " + balance + " : " + fS);
            } else {
                // setS() and start new second counter.
                that.setS();
                that.last = new Date().getTime();
                console.log("3: " + balance);
            }

            that.count(balance);
        }, ms);
    };

    $.fn.CountDownClocks = function (ttg) {
        var cl = new CDC(this, ttg);
        cl.start();
        return cl;
    };
});
