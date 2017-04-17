(function (window, $) {
    getData('./data/line.json').then(function (d) {
        initChartMin(d);
        initChartVolume(d);
    });

    getData('./data/k.json').then(function (d) {
        initChartK(d);
    });

    function initChartMin(d) {
        // 分时图
        window.cv_min = new window.chart($('#box_min'), {
            // width: $("#box_min").width(),
            // height: $("#box_min").width() * 2 / 3,
            yAxis: {
                max: Math.max.apply(Math, d.timeLine.map(function (o) { return o.price; })) * (1 + 0.01),
                min: Math.min.apply(Math, d.timeLine.map(function (o) { return o.price; })) * (1 - 0.01)
            },
            xAxis: {
                data: d.timeLine.map(function (o) { return o.date }),
                // max: 50
            },
            cross: {
                y: 'c_min',
                onRender: function (data) {
                    return $('<div>').text('y:' + data.c_min.valY);
                }
            }
        });
        /* 分时图 */
        var data_min = d.timeLine.map(function (o) { return o.price; });
        cv_min.line(data_min, {
            name: 'c_min',
            isRequestAnim: false,
            onDraw: function (ctx) {
                ctx.strokeStyle = '#3383fa';
                ctx.lineWidth = 1;
            }
        });

        /* 均线 */
        var data_avg = d.timeLine.map(function (o) { return o.avgPrice; });
        cv_min.line(data_avg, {
            name: 'c_avg',
            onDraw: function (ctx) {
                ctx.strokeStyle = '#f6cf74';
                ctx.lineWidth = 1;
            }
        });
    }

    function initChartVolume(d) {
        // 成交量
        window.cv_volume = new window.chart($('#box_vol'), {
            // width: $("#box").width(),
            // height: $("#box").width() / 3,
            yAxis: {
                enable: false,
                max: Math.max.apply(Math, d.timeLine.map(function (o) { return o.volume; })),
                min: 0
            },
            xAxis: {
                enable: false,
                data: d.timeLine.map(function (o) { return o.date }),
                max: 80
            },
            cross: {
                y: 'c_vol',
                onRender: function (data) {
                    return $('<div>').text('y:' + data.c_vol.valY);
                }
            }
        });
        var data_volume = d.timeLine.map(function (o) { return o.volume; });
        cv_volume.bar(data_volume, {
            name: 'c_vol',
            onDraw: function (ctx, i, arr) {
                var cur = arr[i];
                var prev = arr[i - 1] || 0;

                var fillColor = cur - prev === 0
                    ? 'gray' :
                    cur - prev > 0
                        ? '#2aa52a' :
                        '#f54545';
                ctx.fillStyle = fillColor;
            }
        });
    }

    function initChartK(d) {
        // k线
        window.cv_k = new window.chart($('#box_k'), {
            // width: $("#box1").width(),
            // height: $("#box1").width() * 2 / 3,
            yAxis: {
                enable: false,
                max: Math.max.apply(Math, d.mashData.map(function (o) { return o.kline.high; })) * (1 + 0.05),
                min: Math.max.apply(Math, d.mashData.map(function (o) { return o.kline.low; })) * (1 - 0.2)
            },
            xAxis: {
                enable: false,
                data: d.mashData.map(function (o) { return o.date }),
                max: 50
            },
            cross: {
                y: 'c_k.close',
                onRender: function (data) {
                    return $('<div>').text('y:' + data.c_k.close.valY);
                }
            }
        });
        var data_k = d.mashData.map(function (o) { return o.kline; }).reverse();
        // k 线
        cv_k.k(data_k, {
            name: 'c_k',
            field: {
                max: 'high',
                min: 'low',
                open: 'open',
                close: 'close'
            },
            onDraw: function (ctx, d) {
                if (!!d) {
                    var color = d.close > d.open ? '#f54545' : '#2aa52a';
                    ctx.strokeStyle = color;
                    ctx.fillStyle = color;
                }
            }
        });
        // MA5
        var data_ma5 = d.mashData.map(function (o) { return o.ma5.avgPrice; }).reverse();
        cv_k.line(data_ma5, {
            name: 'c_ma5',
            onDraw: function (ctx) {
                ctx.strokeStyle = '#ffc132';
                ctx.lineWidth = 1;
            }
        });
        // MA10
        var data_ma10 = d.mashData.map(function (o) { return o.ma10.avgPrice; }).reverse();
        cv_k.line(data_ma10, {
            name: 'c_ma10',
            onDraw: function (ctx) {
                ctx.strokeStyle = '#80d7f5';
                ctx.lineWidth = 1;
            }
        });
        // MA20
        var data_ma20 = d.mashData.map(function (o) { return o.ma20.avgPrice; }).reverse();
        cv_k.line(data_ma20, {
            name: 'c_ma20',
            onDraw: function (ctx) {
                ctx.strokeStyle = '#fc5fc8';
                ctx.lineWidth = 1;
            }
        });
    }


    function getData(url) {
        return new Promise(function (res, rej) {
            $.ajax({
                url: url,
                success: function (resp) {
                    console.log(resp);
                    res(resp);
                },
                error: function () {
                    alert('http error');
                }
            });
        })
    }
}(window, window.Zepto))


