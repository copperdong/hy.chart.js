(function (window, $) {
    window.chart = window.chart || {};
    window.chart = function (el, userConf) {
        var $el = $(el);
        var conf = $.extend(true, {}, {
            width: 300,
            height: 150,
            xAxis: {    // x坐标轴属性
                max: null,
                min: null,
                data: [],
                axis: {
                    color: '#a3a3a3',
                    width: 1
                },
                point: {
                    color: '#bfbfbf',
                    fontStyle: 'normal 12px Courier New'
                }
            },
            yAxis: {    // y坐标轴
                max: null,
                min: null,
                axis: {
                    color: '#a3a3a3',
                    width: 1
                },
                point: {
                    color: '#bfbfbf',
                    fontStyle: 'normal 12px Courier New'
                }
            },
        }, userConf);

        var ctx = null;
        var vm = this;

        var padding = {
            top: 10,
            bottom: 15,
            left: 15,
            right: 10
        }
        var area = {
            xs: padding.left,
            xe: conf.width - padding.left,
            ys: padding.top,
            ye: conf.height - padding.bottom
        }

        init();

        function init() {
            initCanvasCtx($el.get(0));
            drawXAxis();
            drawYAxis();
        }


        function initCanvasCtx(el) {

            ctx = el.getContext('2d');   // todo 判断el类型
            var ratio = getRenderRatio();
            el.width = conf.width;
            el.height = conf.height;
            // el.style.width = conf.width;
            // el.style.height = conf.height;
            // el.width = el.width * ratio;
            // el.height = el.height * ratio;
        }

        /**
         * 绘制x轴
         * 
         */
        function drawXAxis() {
            var xAxis = conf.xAxis;
            ctx.beginPath();
            ctx.strokeStyle = xAxis.axis.color;
            ctx.lineWidth = xAxis.axis.width;
            ctx.moveTo(area.xs - 0.5, area.ye - 0.5);
            ctx.lineTo(area.xe - 0.5, area.ye - 0.5);
            ctx.stroke();
            /** 标注maxX、minX */
            ctx.font = xAxis.point.fontStyle;
            ctx.strokeStyle = xAxis.point.color;
            ctx.strokeText(xAxis.max, area.xe - 20, area.ye + 10);    /** maxX */
            ctx.strokeText(xAxis.min, area.xs, area.ye + 10);    /** minX */

        }

        /**
         * 绘制y轴
         * 
         */
        function drawYAxis() {
            var yAxis = conf.yAxis;
            ctx.beginPath();
            ctx.strokeStyle = yAxis.axis.color;
            ctx.lineWidth = yAxis.axis.width;
            ctx.moveTo(area.xs - 0.5, area.ys - 0.5);
            ctx.lineTo(area.xs - 0.5, area.ye - 0.5);
            ctx.stroke();
            /** 标注maxY、minY */
            ctx.font = yAxis.point.fontStyle;
            ctx.strokeStyle = yAxis.point.color;
            ctx.strokeText(yAxis.max, area.xs, area.ys);    /** maxY */
            ctx.strokeText(yAxis.min, area.xs, area.ye);    /** minY */
        }

        function drawText() { }

        /**
         * 绘制多点间的路径
         * 
         * @param {Array} arr 绘制路径的点集合[{x:1,y:1,point:[10,10]}]
         * @param {bool} isRequestAnim 是否注册animationFrame
         */
        function drawLine(arr, isRequestAnim) {
            if (arr instanceof Array && arr.length > 0) {
                var i = 0;
                // ctx.beginPath();
                draw(i);
            }

            function draw(i) {
                ctx.beginPath();
                ctx.moveTo.apply(ctx, arr[i].point);
                ctx.lineTo.apply(ctx, arr[i + 1].point);
                ctx.stroke();
                i++;
                if (isRequestAnim === true && (i + 1 < arr.length)) {
                    requestAnimationFrame(function () {
                        draw(i);
                    });
                }
            }
        }

        /**
         * 格式化数据源为绘制line所需数据格式
         * 
         * @param {Array} dataArr y轴值集合
         * @return {Array} 路径点集合
         */
        function formatLinePoint(dataArr) {
            if (dataArr instanceof Array === false) {
                throw new Error('dataArr is not an array');
            }
            var points = [];
            var yArr = dataArr;
            var xArr = conf.xAxis.data || [];
            var maxY = conf.yAxis.max === null ? getMax(yArr) : conf.yAxis.max;
            var minY = conf.yAxis.min === null ? getMin(yArr) : conf.yAxis.min;
            var maxX = conf.xAxis.max === null ? xArr.length : conf.xAxis.max;
            for (var i = 0; i < maxX; i++) {
                points.push({
                    x: xArr[i],     // x value
                    y: yArr[i],     // y value
                    point: xArr[i] == null || yArr[i] == null ?   // 坐标点
                        null
                        :
                        [
                            parseInt(i * (area.xe - area.xs) / maxX + area.xs),
                            parseInt(area.ye - ((area.ye - area.ys) * (yArr[i] - minY)) / (maxY - minY))
                        ]
                });
            }
            return points;
        }

        /**
         * 获取数组中的最大值
         * 
         * @param {Array} arr 源数组
         * @param {string} field 数组元素为object，比较对应的字段名（目前支持一维）
         * @return {number} 最大值
         */
        function getMax(arr, field) {
            if (field != null) {
                arr = arr.map(function (o) { return !!o[field] ? o[field] : o; });
            }
            return Math.max.apply(Math, arr);
        }

        /**
         * 获取数组中的最小值
         * 
         * @param {Array} arr 源数组
         * @param {string} field 数组元素为object，比较对应的字段名（目前支持一维）
         * @return {number} 最小值
         */
        function getMin(arr, field) {
            if (field != null) {
                arr = arr.map(function (o) { return !!o[field] ? o[field] : o; });
            }
            return Math.min.apply(Math, arr);
        }

        function getRenderRatio() {
            /** 屏幕的设备像素比 */
            var devicePixelRatio = window.devicePixelRatio || 1;
            /** 览器在渲染canvas之前存储画布信息的像素比 */
            var backingStoreRatio = ctx.webkitBackingStorePixelRatio
                || ctx.mozBackingStorePixelRatio
                || ctx.msBackingStorePixelRatio
                || ctx.oBackingStorePixelRatio
                || ctx.backingStorePixelRatio
                || 1;
            /** canvas的实际渲染倍率 */
            return devicePixelRatio / backingStoreRatio;
        }

        /**
         * 触发事件
         * 
         * @return {bool} 事件执行的返回值 
         */
        function triggerFn() {
            var args = Array.prototype.slice.call(arguments);
            var fn = args.shift();
            if (typeof fn === 'function') {
                return fn.apply(vm, args);
            }
        }

        function draw(dataSource, i, userDrawConf) {
            var drawConf = $.extend(true, {
                onDraw: function () { },
                beforeEnd: function () { },
                isRequestAnim: true
            }, userDrawConf);
            triggerFn(drawConf.onDraw, dataSource, i);
            if (drawConf.isRequestAnim === true) {
                var reqAnimFrame = window.requestAnimationFrame
                    || window.webkitRequestAnimationFrame
                    || window.mozRequestAnimationFrame
                    || function (cb) {
                        window.setTimeout(cb, 1000 / 60);
                    }
                var cancelAnimFrame = window.cancelAnimationFrame
                    || window.webkitCancelRequestAnimationFrame
                    || window.mozCancelAnimationFrame
                    || clearTimeout;
                var reqId = reqAnimFrame(function () {
                    if (triggerFn(drawConf.beforeEnd, dataSource, i) === false) {
                        cancelAnimFrame(reqId);
                    } else {
                        draw(dataSource, i, userDrawConf);
                    }
                });
            } else {
                if (triggerFn(drawConf.beforeEnd, dataSource, i) !== false) {
                    draw(dataSource, i, userDrawConf);
                }
            }
        }

        /**
         * ========= 接口方法 ===========
         */

        this.ctx = ctx;

        this.line = function (dataArr, lineUserConf) {
            var points = formatLinePoint(dataArr);
            var lineConf = $.extend(true, {
                isRequestAnim: true,
                onDraw: function () { } // 绘图时响应事件
            }, lineUserConf);
            var i = 0;

            draw(points, i, {
                isRequestAnim: lineConf.isRequestAnim,
                onDraw: function () {
                    ctx.beginPath();
                    triggerFn(lineConf.onDraw, ctx);
                    ctx.moveTo.apply(ctx, points[i].point);
                    ctx.lineTo.apply(ctx, points[i + 1].point);
                    ctx.stroke();
                    i++;
                },
                beforeEnd: function () {
                    return !(points[i] == null
                        || points[i].point == null
                        || points[i + 1] == null
                        || points[i + 1].point == null);
                }
            });
        }

        this.bar = function (dataArr, barUserConf) {
            var points = formatLinePoint(dataArr);
            var barConf = $.extend(true, {
                isRequestAnim: true,
                onDraw: function () { } // 绘图时响应事件
            }, barUserConf);
            var i = 0;

            draw(points, i, {
                isRequestAnim: barConf.isRequestAnim,
                onDraw: function () {
                    ctx.beginPath();
                    triggerFn(barConf.onDraw, ctx, points[i].y, i, points.map(function (d) { return d.y; }));
                    ctx.fillRect(
                        points[i].point[0],
                        points[i].point[1],
                        2,
                        area.ye - points[i].point[1]);
                    i++;
                },
                beforeEnd: function () {
                    return !(points[i] == null
                        || points[i].point == null
                        || points[i + 1] == null
                        || points[i + 1].point == null);
                }
            });
        }

        this.k = function (dataArr, kUserConf) {
            var kConf = $.extend(true, {
                field: {
                    max: 'max',
                    min: 'min',
                    open: 'open',
                    close: 'close'
                },
                isRequestAnim: true,
                onDraw: function () { } // 绘图时响应事件
            }, kUserConf);
           
            var i = 0;

            draw(dataArr, i, {
                isRequestAnim: kConf.isRequestAnim,
                onDraw: function () {
                    var p_max = formatLinePoint(dataArr.map(function (d) { return d[kConf.field.max]; }));
                    var p_min = formatLinePoint(dataArr.map(function (d) { return d[kConf.field.min]; }));
                    var p_open = formatLinePoint(dataArr.map(function (d) { return d[kConf.field.open]; }));
                    var p_close = formatLinePoint(dataArr.map(function (d) { return d[kConf.field.close]; }));
                    ctx.beginPath();
                    triggerFn(kConf.onDraw, ctx, dataArr[i]);
                    ctx.fillRect(
                        p_max[i].point[0],
                        getMin([p_close[i].point[1], p_open[i].point[1]]),
                        5,
                        Math.abs(p_close[i].point[1] - p_open[i].point[1]));
                    ctx.moveTo(p_max[i].point[0] + 3 - 0.5, p_max[i].point[1]);
                    ctx.lineTo(p_max[i].point[0] + 3 - 0.5, getMin([p_close[i].point[1], p_open[i].point[1]]));
                    ctx.stroke();
                    ctx.moveTo(p_min[i].point[0] + 3 - 0.5, p_min[i].point[1]);
                    ctx.lineTo(p_min[i].point[0] + 3 - 0.5, getMax([p_close[i].point[1], p_open[i].point[1]]));
                    ctx.stroke();
                    i++;
                },
                beforeEnd: function () {
                    var p_max = formatLinePoint(dataArr.map(function (d) { return d[kConf.field.max]; }));
                    return !(p_max[i] == null
                        || p_max[i].point == null
                        || p_max[i + 1] == null
                        || p_max[i + 1].point == null);
                }
            });
        }
    }
}(window, Zepto))