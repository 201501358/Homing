/*
 *PRINCIPLE: function draw must not change the status.
 * */

// JavaScript source code
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const standard_frame = 25;//term given as millisecond, DON'T CHANGE
const frame = 50;
const fps = 1000 / frame;
const ratio = frame / standard_frame;

function dpf(n) { return n; }//distance per frame
function rad(n) { return n * Math.PI / 180; }
function deg(n) { return n / Math.PI * 180 }

//drawings
function drawLine(x1, y1, x2, y2, thickness, color) {
    var degree;
    if (x1 < x2) {
        degree = Math.atan((y2 - y1) / (x2 - x1));
    }
    else if (x1 > x2) {
        degree = Math.PI + Math.atan((y2 - y1) / (x2 - x1));
    }
    else {
        if (y1 < y2)
            degree = 90;
        else if (y1 > y2)
            degree = 270;
        else
            degree = 0;//p1==p2
    }

    ctx.save();
    ctx.beginPath();
    ctx.translate(x1, y1);
    ctx.rotate(degree);
    ctx.rect(0, 0, Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), thickness / 2);
    ctx.rect(0, 0, Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), -thickness / 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}
function drawEllipseByCenter(ctx, cx, cy, w, h) {
    drawEllipse(ctx, cx - w / 2.0, cy - h / 2.0, w, h);
}
function drawEllipse(ctx, x, y, w, h) {
    var kappa = .5522848,
        ox = (w / 2) * kappa, // control point offset horizontal
        oy = (h / 2) * kappa, // control point offset vertical
        xe = x + w,           // x-end
        ye = y + h,           // y-end
        xm = x + w / 2,       // x-middle
        ym = y + h / 2;       // y-middle

    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    //ctx.closePath(); // not used correctly, see comments (use to close off open path)
    ctx.stroke();
}
//random integer generator
function randint(min, max) {
    if (max == undefined) {
        max = min;
        min = 0;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//pause-play
var status_pause = false;

myobj = new Target(canvas.width / 2, canvas.height / 2, 6, 0, 10);
mymissile = new Missile(canvas.width / 2, canvas.height / 4, 4, 0, myobj, true);

function update() {
    myobj.update();
    mymissile.update();
}
function draw() {
    if (!status_pause) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        update();
        myobj.draw();
        mymissile.draw();
    }
}
setInterval(draw, frame);