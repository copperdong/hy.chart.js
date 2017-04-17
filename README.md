# Chart.js

## 功能

- Canvas绘制折线图、柱状图、k线图
- 支持动画
- 支持移动端手势事件

## DEMO
http://121.199.30.160:7080/chart/

## 调用
```
// 实例化画布
var cv = new window.chart($('#chart'), {
    width: 600,
    height: 400,
    xAxis: {
        data: d.timeLine.map(function (o) { return o.date }),
        max: 256
    }
});

// 接口方法

//绘制折线
cv.line(lineArr,{
    onDraw: function (ctx) {
        ctx.strokeStyle = '#3383fa';
        ctx.lineWidth = 1;
    }
});

// 绘制柱图
cv.bar(barArr,{
    onDraw: function (ctx, d, i, arr) {
        ctx.fillStyle = '#2aa52a';
    }
});

// 绘制k线
cv.k(kArr,{
    onDraw: function (ctx, d) {
        if (!!d) {
            var color = d.close > d.open ? '#f54545' : '#2aa52a';
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
        }
    }
});
```
