/**
 * @file HdpiCanvasElement.js 用于高清屏canvas适配
 * @author hyaaon
 */
(function (window) {
    function createHdpiCanvasContext2D(superCtx) {
        var fixFn = {
            'fillRect': 'all',
            'clearRect': 'all',
            'strokeRect': 'all',
            'moveTo': 'all',
            'lineTo': 'all',
            'arc': [0, 1, 2],
            'arcTo': 'all',
            'bezierCurveTo': 'all',
            'isPointinPath': 'all',
            'isPointinStroke': 'all',
            'quadraticCurveTo': 'all',
            'rect': 'all',
            'translate': 'all',
            'createRadialGradient': 'all',
            'createLinearGradient': 'all'
        };
        var ratio = getPixelRatio(superCtx);

        /**
         * 获取当前设备下canvas绘制倍率
         *
         * @param {Object} ctx CanvasRenderingContext2D对象
         * @return {number} 绘制倍率
         */
        function getPixelRatio(ctx) {
            ctx = ctx || document.createElement('canvas').getContext;
            var backingStore = ctx.backingStorePixelRatio
                || ctx.webkitBackingStorePixelRatio
                || ctx.mozBackingStorePixelRatio
                || ctx.msBackingStorePixelRatio
                || ctx.oBackingStorePixelRatio
                || ctx.backingStorePixelRatio
                || 1;
            return (window.devicePixelRatio || 1) / backingStore;
        }

        /**
         * HdpiCanvasContext构造函数，用于封装原CanvasRenderingContext2D对象
         *
         */
        function HdpiCanvasContext() { }
        /* 复制CanvasRenderingContext2D原型方法到HdpiCanvasContext.prototype */
        Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype).map(function (key) {
            if (typeof superCtx[key] === 'function') {
                HdpiCanvasContext.prototype[key] = superCtx[key].bind(superCtx);
            }
        });

        /* 重写HdpiCanvasContext原型方法 */
        HdpiCanvasContext.prototype.constructor = HdpiCanvasContext;
        /* 对部分方法参数做高清屏适配 */
        Object.getOwnPropertyNames(fixFn).map(function (name) {
            HdpiCanvasContext.prototype[name] = function () {
                var val = fixFn[name];
                var args = Array.prototype.slice.call(arguments);
                var fixArgs = args.map(function (a, i) {
                    if (val === 'all') {
                        return a * ratio;
                    } else if (Object.prototype.toString.call(val) === '[object Array]') {
                        return val.indexOf(i) > -1 ? a * ratio : a;
                    }
                });
                return superCtx[name].apply(superCtx, fixArgs);
            };
        });
        HdpiCanvasContext.prototype.stroke = function () {
            superCtx.lineWidth *= ratio;
            superCtx.stroke.apply(superCtx, arguments);
            superCtx.lineWidth /= ratio;
        };

        /* 重写HdpiCanvasContext实例setter方法，执行此方法时直接设置到superCtx上 */
        var hdpiContext = new HdpiCanvasContext();
        var propertyObj = {};
        Object.getOwnPropertyNames(CanvasRenderingContext2D.prototype).map(function (name) {
            if (typeof superCtx[name] !== 'function') {
                propertyObj[name] = {
                    set: function (val) {
                        superCtx[name] = val;
                    }
                };
            }
        });
        return Object.defineProperties(hdpiContext, propertyObj);
    }
    window.createHdpiCanvasContext2D = createHdpiCanvasContext2D;
}(window));

(function (window) {
    function createHdpiCanvasElement(superCanvas) {
        var createHdpiCanvasContext2D = window.createHdpiCanvasContext2D;

        function getPixelRatio(ctx) {
            ctx = ctx || document.createElement('canvas').getContext;
            var backingStore = ctx.backingStorePixelRatio
                || ctx.webkitBackingStorePixelRatio
                || ctx.mozBackingStorePixelRatio
                || ctx.msBackingStorePixelRatio
                || ctx.oBackingStorePixelRatio
                || ctx.backingStorePixelRatio
                || 1;
            return (window.devicePixelRatio || 1) / backingStore;
        }

        function HdpiCanvasElement() { }

        /* 复制HTMLCanvasElement原型方法 */
        Object.getOwnPropertyNames(HTMLCanvasElement.prototype).map(function (key) {
            if (typeof superCanvas[key] === 'function') {
                HdpiCanvasElement.prototype[key] = superCanvas[key].bind(superCanvas);
            }
        });

        /* 重写HdpiCanvasElement原型方法 */
        HdpiCanvasElement.prototype.constructor = HdpiCanvasElement;
        HdpiCanvasElement.prototype.getContext = function (type) {
            var el = superCanvas;
            if (type === '2d') {
                var ratio = getPixelRatio(el.getContext(type));
                el.style.width = el.width + 'px';
                el.style.height = el.height + 'px';
                el.width = el.width * ratio;
                el.height = el.height * ratio;
            }
            return createHdpiCanvasContext2D(el.getContext('2d'));
        };

        var hdpiCanvas = new HdpiCanvasElement();
        var propertyObj = {};
        Object.getOwnPropertyNames(HTMLCanvasElement.prototype).map(function (name) {
            if (typeof superCanvas[name] !== 'function') {
                propertyObj[name] = {
                    set: function (val) {
                        superCanvas[name] = val;
                    }
                };
            }
        });
        return Object.defineProperties(hdpiCanvas, propertyObj);
    }

    window.createHdpiCanvasElement = createHdpiCanvasElement;
}(window));
