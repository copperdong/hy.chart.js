/**
 * @file chart.js
 * @author hyaaon
 */
(function (window, $) {
    window.chart = window.chart || {};
    window.chart = function (el, userConf) {
        var log = [];

        var conf = $.extend(true, {}, {
            width: 300,             // canvas宽度
            height: 150,            // canvas高度
            xAxis: {                // x坐标轴属性
                max: null,              // x轴最大值（可大于/小于/等于数据源个数）
                min: null,              // x轴最大值（可大于/小于/等于数据源个数）
                data: [],               // x轴最小值
                axis: {             // x坐标轴属性
                    color: '#a3a3a3',   // 颜色
                    width: 1            // 宽度
                },
                point: {            // x坐标点属性
                    color: '#bfbfbf',   // 颜色
                    fontStyle: 'normal 12px Courier New'    // 字体样式
                }
            },
            yAxis: {                // 同x轴属性
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
            cross: {
                onRender: function () { }
            }
        }, userConf);

        var dataSource = {};
        var $x = null;
        var $y = null;

        /** canvas context 对象 */
        var ctx = null;
        /** 当前this */
        var vm = this;

        /** 兼容长按与普通触屏事件 */
        var startTime = null;       // touchstart开始时间
        var limitMin = 0.08 * 1000;    // 临界点：limitMin<t<limitMax:普通触屏
        var limitMax = 0.5 * 1000;     // 临界点：>=limitMax:长按；<limitMax:普通触屏  
        var touchEnum = {
            long: 1,
            short: 2,
            none: -1
        };
        var touchType = touchEnum.none;
        var timeId = null;

        /** canvas实际显示区域与canvas画布间的内边距 */
        var padding = {
            top: 10,
            bottom: 15,
            left: 15,
            right: 10
        };
        /** canvas实际显示区域 */
        var area = {
            xs: padding.left,
            xe: conf.width - padding.left,
            ys: padding.top,
            ye: conf.height - padding.bottom
        };

        init();

        function init() {
            initCanvasCtx();
            drawAxis();
            bind();

        }


        function initCanvasCtx() {
            var $canvas = $('<canvas>')
                .addClass('chart-container')
                .width(conf.width)
                .height(conf.height);
            ctx = $canvas.get(0).getContext('2d');

            // 十字标
            $x = $('<div>')
                .append(
                $('<div>').addClass('chart-info')
                ).addClass('chart-x');
            $y = $('<div>')
                .append(
                $('<div>').addClass('chart-info')
                )
                .addClass('chart-y');

            el.append($canvas)
                .append($x)
                .append($y);
        }

        /**
         * 绘制坐标轴
         */
        function drawAxis() {
            var xAxis = conf.xAxis;
            var yAxis = conf.yAxis;
            // x
            ctx.beginPath();
            ctx.strokeStyle = xAxis.axis.color;
            ctx.lineWidth = xAxis.axis.width;
            ctx.moveTo(area.xs - 0.5, area.ye - 0.5);
            ctx.lineTo(area.xe - 0.5, area.ye - 0.5);
            ctx.stroke();
            // y
            ctx.beginPath();
            ctx.strokeStyle = yAxis.axis.color;
            ctx.lineWidth = yAxis.axis.width;
            ctx.moveTo(area.xs - 0.5, area.ys - 0.5);
            ctx.lineTo(area.xs - 0.5, area.ye - 0.5);
            ctx.stroke();
            /** 标注maxX、minX */
            // ctx.font = xAxis.point.fontStyle;
            // ctx.strokeStyle = xAxis.point.color;
            // ctx.strokeText(xAxis.max, area.xe - 20, area.ye + 10);    /** maxX */
            // ctx.strokeText(xAxis.min, area.xs, area.ye + 10);    /** minX */
        }

        function bind() {
            el.get(0).addEventListener('touchstart', onTouchStart, false);
        }


        function onTouchStart(e) {
            showLog('touchStart');
            startTime = new Date().getTime();
            e.preventDefault();
            var touch = e.targetTouches[0];
            var left = touch.pageX - e.currentTarget.getBoundingClientRect().left;
            // 设置计时器
            timeId = setTimeout(function () {
                clearLog();
                showLog('timeout-left:' + left);
                clearTimeout(timeId);
                touchType = touchEnum.long;
                setCross(left);
            }, limitMax);

            // 绑定touchmove和touchend
            el.get(0).addEventListener('touchmove', onTouchMove, false);
            el.get(0).addEventListener('touchend', onTouchEnd, false);
        }

        function onTouchMove(e) {
            showLog('touchMove');
            // 判断是否需要计算limitMax（在limitMax前move）
            if (touchType !== touchEnum.long) {
                showLog('calcu');
                if (startTime != null) {
                    showLog('===========11');
                    clearTimeout(timeId);
                    var curTime = new Date().getTime();
                    touchType = curTime - startTime >= limitMax
                        ? touchEnum.long
                        : curTime - startTime > limitMin
                            ? touchEnum.short
                            : touchEnum.none;
                    if (touchType === touchEnum.short) {
                        onShortTouch.call(this, e);
                        startTime = null;
                    }
                } else {
                    touchType === touchEnum.long
                        ? onLongTouch.call(this, e)
                        : touchType === touchEnum.short
                            ? onShortTouch.call(this, e)
                            : null;
                }
            } else {
                onLongTouch.call(this, e);
            }
        }

        function onTouchEnd(e) {
            showLog('end');
            touchType = touchEnum.none;
            startTime = null;
            clearTimeout(timeId);
            // 重置cross位置
            resetCross();
            // 解绑touchmove、touchend事件
            el.get(0).removeEventListener('touchmove', onTouchMove, false);
            el.get(0).removeEventListener('touchend', onTouchEnd, false);
        }

        function onLongTouch(e) {
            showLog('long');
            e.preventDefault();
            var touch = e.targetTouches[0];
            var left = touch.pageX - e.currentTarget.getBoundingClientRect().left;
            setCross(left);
        }

        function onShortTouch() {
            showLog('short');
        }

        /**
         * 格式化数据源为绘制line所需数据格式
         * 注意：
         *  1、支持dataArr中元素为 值类型 或 对象类型（一层）
         *
         * @param {Array} dataArr y轴值集合
         * @param {Array} fields 需要格式化的字段名（当dataArr元素为对象类型时，field必传）
         * @return {Array} 格式化后的路径点集合（当fields不为空，返回Object，kv对应每组格式化的数组；当fields为空，直接返回格式化后的数组）
         */
        function formatPointArr(dataArr, fields) {
            if (dataArr instanceof Array === false) {
                throw new Error('dataArr is not an array');
            }
            // 返回值
            var pArr = null;
            var pObj = null;

            var yArr = dataArr;
            var xArr = conf.xAxis.data || [];
            var maxY = conf.yAxis.max === null ? getMax(yArr) : conf.yAxis.max;
            var minY = conf.yAxis.min === null ? getMin(yArr) : conf.yAxis.min;
            var maxX = conf.xAxis.max === null ? xArr.length : conf.xAxis.max;
            var minX = conf.xAxis.min === null ? 0 : conf.xAxis.min;

            // 是否需要对dataArr中多个field进行格式化
            var isMultiField = fields instanceof Array === true && fields.length > 0;
            isMultiField === true ? pObj = {} : pArr = [];
            for (var i = 0; i < maxX; i++) {
                if (isMultiField === true) {
                    fields.map(function (field) {
                        pObj[field] = pObj[field] || [];
                        pObj[field].push(getPoint(i, field));
                    });
                }
                else {
                    pArr.push(getPoint(i));
                }
            }
            return pArr || pObj;

            function getPoint(i, field) {
                var x = xArr[i];
                var y = !!field ? (yArr[i] || {})[field] : yArr[i];
                var itvX = parseFloat((area.xe - area.xs) / (maxX - minX));
                var itvY = parseFloat((area.ye - area.ys) / (maxY - minY));
                return {
                    isDraw: x !== null && y !== null,
                    valX: x,
                    valY: y,
                    ptX: i * itvX + area.xs - 0.5,
                    ptY: area.ye - (itvY * (y - minY)) - 0.5,
                    itvX: itvX,
                    itvY: itvY
                };
            }
        }

        function formatRenderArr() {
            var names = Object.getOwnPropertyNames(dataSource);
            var maxLen = getMax(names.map(function (name) { return dataSource[name].length || 0; }));
            var arr = [];

            for (var i = 0; i < maxLen; i++) {
                var o = {};
                getPoint(dataSource, i, o);
                arr.push(o);
            }
            return arr;

            function getPoint(dataSource, i, o) {
                Object.getOwnPropertyNames(dataSource).map(function (n) {
                    if (dataSource[n] instanceof Array === true) {
                        var pt = dataSource[n][i];
                        o[n] = {
                            ptY: pt.ptY,
                            valY: pt.valY
                        };
                        o.ptX = pt.ptX;
                        o.valX = pt.valX;
                    } else {
                        // 如果是对象，递归
                        o[n] = o[n] || {};
                        getPoint(dataSource[n], i, o[n]);
                    }
                });
            }
        }



        /**
         * 获取数组中的最大值
         *
         * @param {Array} arr 源数组
         * @param {string} field 数组元素为Object，比较对应的字段名（目前支持一维）
         * @return {number} 最大值
         */
        function getMax(arr, field) {
            if (field != null) {
                arr = arr.map(function (o) {
                    return !!o[field] ? o[field] : o;
                });
            }
            return Math.max.apply(Math, arr);
        }

        /**
         * 获取数组中的最小值
         *
         * @param {Array} arr 源数组
         * @param {string} field 数组元素为Object，比较对应的字段名（目前支持一维）
         * @return {number} 最小值
         */
        function getMin(arr, field) {
            if (field != null) {
                arr = arr.map(function (o) {
                    return !!o[field] ? o[field] : o;
                });
            }
            return Math.min.apply(Math, arr);
        }

        /**
         * 获取canvas实际渲染倍率
         *
         * @return {number} 实际渲染倍率
         */
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

        function getDataByX(x, arr) {
            var obj = {};
            arr.map(function (p, idx) {
                if (idx > 0 && x > p.ptX) {
                    obj = arr[idx - 1];
                }
            });
            return obj;
        }

        function setCross(ptX) {
            var renderArr = formatRenderArr();
            var data = getDataByX(ptX, renderArr);
            var $html = triggerFn(conf.cross.onRender, data);
            $x.css({
                left: data.ptX,
                display: 'block'
            });
            $y.css({
                top: getDataByPath(data, conf.cross.y).ptY,
                display: 'block'
            }).find('.chart-info')
                .html($html);
        }

        function resetCross() {
            $x.css({
                left: 0,
                display: 'none'
            });
            $y.css({
                top: 0,
                display: 'none'
            });
        }

        function showLog(msg) {
            log.push(msg);
            $('#log').html(log.join('<br/>'));
        }
        function clearLog() {
            log = [];
            $('#log').html('');
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

        function getDataByPath(obj, path) {
            if (!$.isPlainObject(obj) && !$.isArray(obj)) {
                return;
            }
            var arr = path.split('.');
            var key = arr.shift();
            var val = obj[key];
            if (val === undefined) {
                return undefined;
            } else if (arr.length === 0) {
                return val;
            } else if ($.isPlainObject(val) || $.isArray(val)) {
                return getDataByPath(val, arr.join('.'));
            }
        }


        /**
         * 绘图
         *
         * @param {Array} dataSource 图表数据源
         * @param {number} i 当前正在绘制点在dataSource中的索引
         * @param {Object} userDrawConf 绘图配置项
         */
        function draw(dataSource, i, userDrawConf) {
            var drawConf = $.extend(true, {
                onDraw: function () { },    // 绘图时相应事件
                beforeEnd: function () { }, // 绘图结束条件
                isRequestAnim: true         // 是否使用帧动画
            }, userDrawConf);
            triggerFn(drawConf.onDraw, dataSource, i);
            i++;
            if (drawConf.isRequestAnim === true) {
                var reqAnimFrame = window.requestAnimationFrame
                    || window.webkitRequestAnimationFrame
                    || window.mozRequestAnimationFrame
                    || function (cb) {
                        window.setTimeout(cb, 1000 / 60);
                    };
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
            }
            else {
                if (triggerFn(drawConf.beforeEnd, dataSource, i) !== false) {
                    draw(dataSource, i, userDrawConf);
                }
            }
        }

        /**
         * ========= 接口方法 ===========
         */

        /**
         * 当前画布context
         */
        this.ctx = ctx;

        /**
         * 绘制折线图
         *
         * @param {Array} dataArr 图表数据源
         * @param {Object} lineUserConf 绘图配置项
         */
        this.line = function (dataArr, lineUserConf) {
            var lineConf = $.extend(true, {
                name: 'chart_' + Math.random().toString().replace('0.', ''),
                isRequestAnim: true,
                onDraw: function () { } // 绘图时响应事件
            }, lineUserConf);
            var points = formatPointArr(dataArr);
            var idx = 0;
            dataSource[lineConf.name] = points;

            draw(points, idx, {
                isRequestAnim: lineConf.isRequestAnim,
                onDraw: function (pts, i) {
                    ctx.beginPath();
                    triggerFn(lineConf.onDraw, ctx);
                    ctx.moveTo(pts[i].ptX, pts[i].ptY);
                    ctx.lineTo(pts[i + 1].ptX, pts[i + 1].ptY);
                    ctx.stroke();
                },
                beforeEnd: function (pts, i) {
                    return !(pts[i] == null
                        || pts[i].isDraw === false
                        || pts[i + 1] == null
                        || pts[i + 1].isDraw === false);
                }
            });
        };

        /**
         * 绘制柱状图
         *
         * @param {Array} dataArr 图表数据源
         * @param {Object} barUserConf 绘图配置项
         */
        this.bar = function (dataArr, barUserConf) {
            var barConf = $.extend(true, {
                name: 'chart_' + Math.random().toString().replace('0.', ''),
                isRequestAnim: true,
                onDraw: function () { } // 绘图时响应事件
            }, barUserConf);
            var points = formatPointArr(dataArr);
            var idx = 0;
            dataSource[barConf.name] = points;

            draw(points, idx, {
                isRequestAnim: barConf.isRequestAnim,
                onDraw: function (pts, i) {
                    var pt = pts[i];
                    ctx.beginPath();
                    triggerFn(
                        barConf.onDraw,
                        ctx,
                        i,
                        pts.map(function (d) {
                            return d.valY;
                        })
                    );
                    ctx.fillRect(
                        pt.ptX,
                        pt.ptY,
                        pt.itvX - 0.5,
                        area.ye - pt.ptY);
                },
                beforeEnd: function (pts, i) {
                    return !(pts[i] == null
                        || pts[i].isDraw === false
                        || pts[i + 1] == null
                        || pts[i + 1].isDraw === false);
                }
            });
        };

        /**
         * 绘制k线图
         *
         * @param {Array} dataArr 图表数据源
         * @param {Object} kUserConf 绘图配置项
         */
        this.k = function (dataArr, kUserConf) {
            var kConf = $.extend(true, {
                name: 'chart_' + Math.random().toString().replace('0.', ''),
                field: {
                    max: 'max',
                    min: 'min',
                    open: 'open',
                    close: 'close'
                },
                isRequestAnim: true,
                onDraw: function () { } // 绘图时响应事件
            }, kUserConf);

            var fMax = kConf.field.max;
            var fMin = kConf.field.min;
            var fOpen = kConf.field.open;
            var fClose = kConf.field.close;

            var pObj = formatPointArr(dataArr, [
                fMax,
                fMin,
                fOpen,
                fClose
            ]);
            var idx = 0;
            dataSource[kConf.name] = pObj;

            draw(pObj, idx, {
                isRequestAnim: kConf.isRequestAnim,
                onDraw: function (pts, i) {
                    var max = pts[fMax][i];
                    var min = pts[fMin][i];
                    var open = pts[fOpen][i];
                    var close = pts[fClose][i];

                    var itvX = pts[fClose][i].itvX - 1;
                    var offsetX = parseFloat(itvX / 2);

                    ctx.beginPath();
                    triggerFn(kConf.onDraw, ctx, dataArr[i]);
                    ctx.fillRect(
                        max.ptX,
                        getMin([close.ptY, open.ptY]),
                        itvX - 0.5,
                        Math.abs(close.ptY - open.ptY));
                    ctx.moveTo(max.ptX + offsetX, max.ptY);
                    ctx.lineTo(max.ptX + offsetX, getMin([close.ptY, open.ptY]));
                    ctx.stroke();
                    ctx.moveTo(min.ptX + offsetX, min.ptY);
                    ctx.lineTo(min.ptX + offsetX, getMax([close.ptY, open.ptY]));
                    ctx.stroke();
                },
                beforeEnd: function (pts, i) {
                    var max = pts[fMax];
                    return !(max[i] == null
                        || max[i].isDraw === false
                        || max[i + 1] == null
                        || max[i + 1].isDraw === false);
                }
            });
        };

        // this.setCross = function (x, y) {
        //     $x.css({
        //         left: x
        //     });
        //     $y.css({
        //         top: y
        //     })
        // }
    };
}(window, window.Zepto));
