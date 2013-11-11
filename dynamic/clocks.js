/**
 * Created by Misha Panyushkin on 06.11.13.
 * Sensitive clocks counter.
 */

$(function () {

    /*
     * Static values.
     * */
    var tic_mark = "dd hh mm ss".split(" "),
        tic_const = {
            dd: 24*60*60,
            hh: 60*60,
            mm: 60,
            ss: 1
        },
        tic_labels = {
            dd: "дни",
            hh: "часы",
            mm: "минуты",
            ss: "секунды"
        },
        one_sec = 1000; // In milliseconds.

    var $sections = {};

    tic_mark.forEach(function (mark) {
        $sections[mark] = $("<section>").attr("class",mark + " marks").append("<header><span><em></em></span><span><em></em></span></header><footer>" + tic_labels[mark] + "</footer>");
    });

    var $clocks_wrapper = $("<article/>").attr("class", "clocks");

    /*
     * Clocks constructor function.
     * */
    function CLOCKS ($set) {
        var that = this;

        this.$c = $clocks_wrapper.clone();
        tic_mark.forEach(function (mark) {
            that[mark] = {
                v: 0,
                $e: function () {
                    var d = $sections[mark].clone();
                    that.$c.append(d);
                    return d.find("em");
                } ()
            };
        });
        this.$c.appendTo($set);
        this.st = "idle";
    }

    /*
     * API methods distributed along all Clocks class instances.
     * */
    function API () {
        this.fill = function (ttg) {
            var that = this;
            if (ttg) {
                this.stop();
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
        };

        this.start = function (ttg) {
            this.fill(ttg);
            this.resume();
        };

        this.stop = function (ttg) {
            if (this.st === "stopped") return;
            this.st = "stopped";
            this.fill(ttg);
            clearTimeout(this.to);
        };

        this.resume = function () {
            if (this.st === "counting") return;
            this.st = "counting";
            this.ts = new Date().getTime();
            this.count();
        };

        this.getTime = function () {
            var that = this,
                remain = 0;
            tic_mark.forEach(function (v) {
                remain += that[v].v*tic_const[v]
            });
            return remain*1000;
        };
    }

    /*
     * Defining a core methods collection.
     * The similar methods for calculating time by the following marks: days, hours, minutes, seconds.
     * Some technical methods are also presented.
     * */
    function CORE () {
        var is = this;

        tic_mark.forEach(function (m, i, a) {

            is["set" + m.toUpperCase()] = function (amount) {

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
                    if (!a[i-1]) {
                        this.st = "finished";
                    } else {
                        this["set" + a[i-1].toUpperCase()](full);
                    }

                    if (this.st === "finished") {
                        balance = 0;
                    }
                }

                this[m].v = balance;

                // 3. Visualizing.
                is.int2arr(this[m].v).forEach(function (v, i) {

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
        this.int2arr = function (i) {
            var arr = i.toString().split("");
            if (arr.length == 1)
                arr.splice(0, 0, "0");
            return arr;
        };

        this.count = function (ms) {
            var that = this;
            ms = ms || one_sec;
            this.to = setTimeout(function () {
                var atTHEmo = new Date().getTime(),
                    ts = atTHEmo - that.ts,
                    fS, balance = one_sec;
                if (ts < one_sec) {
                    // Not full second passed. Add timeout for balance.
                    balance = one_sec - ts;
                } else if (ts > one_sec) {
                    // setS(amount) for need amount and if needed add timeout for balance.
                    fS = Math.floor(ts/one_sec);
                    that["set" + tic_mark[tic_mark.length - 1].toUpperCase()](fS);
                    balance = one_sec - ts % one_sec;
                    that.ts += fS*one_sec;
                } else {
                    // setS() and start new second counter.
                    that["set" + tic_mark[tic_mark.length - 1].toUpperCase()]();
                    that.ts = new Date().getTime();
                }

                if (that.st === "finished") {
                    clearTimeout(that.to);
                } else {
                    that.count(balance);
                }
            }, ms);
        };
    }

    API.prototype       = new CORE();
    CLOCKS.prototype    = new API();

    $.fn.countDown = function (ttg) {
        var c = new CLOCKS(this);
        c.start(ttg);
        return c;
    };
});
