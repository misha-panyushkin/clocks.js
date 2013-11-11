/**
 * Created by Misha Panyushkin on 06.11.13.
 * Sensitive clocks counter.
 */

$(function () {

    /*
    * Static.
    * */
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

    var $sections = {};

    tic_mark.forEach(function (mark) {
        $sections[mark] = $("<section>").attr("class",mark + " marks").append("<header><span><em></em></span><span><em></em></span></header><footer>" + tic_labels[mark] + "</footer>");
    });

    var $clocks_wrapper = $("<article/>").attr("class", "clocks");

    /*
     * Constructor function.
     * */
    function CDC ($set) {
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
        this.status = "idle";
    }

    CDC.prototype = {
        fill:   function (ttg) {
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
        },
        start:  function (ttg) {
            this.fill(ttg);
            this.resume();
        },
        stop:   function (ttg) {
            if (this.status === "stopped") return;
            this.status = "stopped";
            this.fill(ttg);
            clearTimeout(this.to);
        },
        resume: function () {
            if (this.status === "counting") return;
            this.status = "counting";
            this.last = new Date().getTime();
            this.count();
        },

        getTime: function () {
            var that = this,
                remain = 0;
            tic_mark.forEach(function (v) {
                remain += that[v].v*tic_const[v]
            });
            return remain*1000;
        }
    };

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
                if (!a[i-1]) {
                    this.status = "finished";
                } else {
                    this["set" + a[i-1].toUpperCase()](full);
                }

                if (this.status === "finished") {
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
            } else if (ts > one_sec) {
                // setS(amount) for need amount and if needed add timeout for balance.
                fS = Math.floor(ts/one_sec);
                that.setS(fS);
                balance = one_sec - ts % one_sec;
                that.last += fS*one_sec;
            } else {
                // setS() and start new second counter.
                that.setS();
                that.last = new Date().getTime();
            }

            if (that.status === "finished") {
                clearTimeout(that.to);
            } else {
                that.count(balance);
            }
        }, ms);
    };

    $.fn.countDown = function (ttg) {
        var cl = new CDC(this);
        cl.start(ttg);
        return cl;
    };
});
