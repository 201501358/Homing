//coordination
class Coor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
//hitbox
class Hitbox {
    constructor(x, y, r, master) {
        this.master = master;
        this.coor_relative = new Coor(x, y);
        this.coor = new Coor(master.coor.x + x, master.coor.y + y);
        this.r = r;
    }
    update() {
        var h = Math.sqrt(this.coor_relative.x * this.coor_relative.x + this.coor_relative.y * this.coor_relative.y,2);
        this.coor.x = this.master.coor.x + -h * Math.cos(rad(this.master.dir));
        this.coor.y = this.master.coor.y + -h * Math.sin(rad(this.master.dir));
    }
    isHitWith(h) {
        if (h.r + this.r > Math.abs(this.coor.x - h.coor.x) && h.r + this.r > Math.abs(this.coor.y - h.coor.y)) {
            if (h.r + this.r > distCoor2Coor(h.coor,this.coor)) {
                this.master.hitby = h.master;
            }
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.coor.x, this.coor.y, this.r, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'red';
        ctx.stroke();
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(this.coor.x, this.coor.y, this.r * 1.1, 0, 2 * Math.PI, false);
        ctx.strokeStyle = 'blue';
        ctx.stroke();
        ctx.closePath();
    }
}

//objects class
class Objects {
    constructor(x, y) {
        this.coor = new Coor(x, y);
    }
}

//movable
class Movable extends Objects {
    constructor(x, y, speed, dir) {
        super(x, y);
        this.speed = speed;
        this.dir = dir;
        this.img = new Image();
        this.img.src = "images/default_image.png";
    }
    move() {
        if (this.speed > 100) this.speed = 100;

        this.coor.x += dpf(this.speed) * Math.cos(rad(this.dir));
        this.coor.y += dpf(this.speed) * Math.sin(rad(this.dir));

        this.coor.x = (this.coor.x + canvas.width) % canvas.width;
        this.coor.y = (this.coor.y + canvas.height) % canvas.height;
    }
    moveTo(dest) {
        this.coor.x = dest.x;
        this.coor.y = dest.y;
    }
    draw() {
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.coor.x, this.coor.y);
        ctx.rotate(rad(this.dir));
        ctx.drawImage(this.img, -this.img.naturalWidth / 2, -this.img.naturalHeight / 2, this.img.naturalWidth, this.img.naturalHeight);
        ctx.restore();
        ctx.closePath();
    }
}

//hittable
class Hittable extends Movable {
    constructor(x, y, speed, dir) {
        super(x, y, speed, dir);
        this.hitbox = [];
        this.hitby = {};
    }
    updateHitbox() {
        for (var hbox of this.hitbox) {
            hbox.update();
        }
    }
    setHitbox(x, y, r, master) {
        this.hitbox[this.hitbox.length] = new Hitbox(x, y, r, master);
    }
    drawHitbox() {
        for (var hbox of this.hitbox) {
            hbox.draw();
        }
    }
}

//pen class
class Pen extends Objects {
    constructor(x, y, r, color) {
        super(x, y, 0, 0);
        this.r = r;
        this.color = color;
        this.is_down = false;
    }
    Down() { this.is_down = true; }
    Up() { this.is_down = false; }
}

//circle class
class Circle extends Movable {
    constructor(x, y, speed, dir, r) {
        super(x, y, speed, dir);
        this.r = r;
    }
    draw() {
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.coor.x, this.coor.y);
        ctx.rotate(rad(this.dir));
        ctx.arc(0, 0, this.r, 0, 2 * Math.PI, false);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
    }
}
class CircleMain extends Circle {
    constructor(r) {
        super(canvas.width / 2, canvas.height / 2, 0, 0, r);
    }
}
class CircleSub extends Circle {
    constructor(cm, dir, r) {
        var super_r = cm.r + r;
        var x = cm.coor.x + Math.cos(dir * Math.PI / 180) * super_r;
        var y = cm.coor.y + Math.sin(dir * Math.PI / 180) * super_r;
        super(x, y, 5, (cm.dir + 180) % 360, r);
        this.pen = new Pen(this.coor.x + Math.cos(this.dir * Math.PI / 180) * this.r, this.coor.y + Math.sin(this.dir * Math.PI / 180) * this.r, 1, 'red');
        this.cm = cm;
    }
    rotate() {
        var rotate_ratio = this.cm.r / this.r;
        this.dir = (this.dir + 2 * rotate_ratio);
    }
    move() {
        var save_dir = this.dir;
        this.dir = Math.atan2(this.coor.y - this.cm.coor.y, this.coor.x - this.cm.coor.x) * 180 / Math.PI;
        var dest_dir = (this.dir + 1) % 360;
        var dest_r = this.cm.r + this.r;
        var dest_coor = new Coor(this.cm.coor.x + Math.cos(dest_dir * Math.PI / 180) * dest_r, this.cm.coor.y + Math.sin(dest_dir * Math.PI / 180) * dest_r);
        this.moveTo(dest_coor);

        /*
        this.dir = (this.dir + 90) % 360;

        if (this.speed > 100) this.speed = 100;

        this.coor.x += dpf(this.speed) * Math.cos(rad(this.dir));
        this.coor.y += dpf(this.speed) * Math.sin(rad(this.dir));

        this.coor.x = (this.coor.x + canvas.width) % canvas.width;
        this.coor.y = (this.coor.y + canvas.height) % canvas.height;
        */

        this.dir = save_dir;
        this.rotate();
        this.pen.coor.x = this.coor.x + Math.cos(this.dir * Math.PI / 180) * this.r;
        this.pen.coor.y = this.coor.y + Math.sin(this.dir * Math.PI / 180) * this.r;
    }
    draw() {
        super.draw();
        ctx2.beginPath();
        ctx2.save();
        ctx2.translate(this.pen.coor.x, this.pen.coor.y);
        ctx2.rotate(rad(this.dir));
        ctx2.arc(0, 0, this.pen.r, 0, 2 * Math.PI, false);
        ctx2.fillStyle = this.pen.color;
        ctx2.fill();
        ctx2.restore();
        ctx2.closePath();
        /*
        if (this.pen.is_down) {
            ctx2.beginPath();
            ctx2.arc(this.pen.coor.x, this.pen.coor.y, this.pen.r, 0, 2 * Math.PI, false);
            ctx2.fillStyle = this.pen.color;
            ctx2.fill();
            ctx2.closePath();
        }
        */
    }
}

//car class
class Car extends Movable {
    constructor(x, y, speed, dir) {
        super(x, y, speed, dir);
        this.img.src = "images/car.png";
    }
}
//ball class
class Ball extends Movable {
    constructor(x, y, speed, dir, radius, color) {
        super(x, y, speed, dir);
        this.r = radius;
        this.color = color;
    }
    move() {
        var dpfx = dpf(this.speed) * Math.cos(rad(this.dir));
        var dpfy = dpf(this.speed) * Math.sin(rad(this.dir));
        if (!(0 <= this.coor.x - this.r + dpfx && this.coor.x + this.r + dpfx < canvas.width)) {
            this.dir = 180 - this.dir;
            this.speed *= 80 / 100;
        }
        if (!(0 <= this.coor.y - this.r + dpfy && this.coor.y + this.r + dpfy < canvas.height)) {
            this.dir = 360 - this.dir;
            this.speed *= 80 / 100;
        }

        this.coor.x += dpf(this.speed) * Math.cos(rad(this.dir));
        this.coor.y += dpf(this.speed) * Math.sin(rad(this.dir));
    }
    draw() {
        ctx.beginPath();
        ctx.save();
        ctx.translate(this.coor.x, this.coor.y);
        ctx.arc(0, 0, this.r, 0, 6.28, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
        ctx.closePath();

        /*ctx.beginPath();
        ctx.save();
        ctx.translate(this.coor.x + dpf(this.speed * Math.cos(rad(this.dir))), this.coor.y + dpf(this.speed * Math.sin(rad(this.dir))));
        ctx.arc(0, 0, this.r / 2, 0, 6.28, false);
        ctx.fillStyle = "rgba(255,255,255,1)";
        ctx.fill();
        ctx.restore();
        ctx.closePath();

        var dist = Math.sqrt(Math.pow((bhole.coor.x - this.coor.x), 2) + Math.pow((bhole.coor.y - this.coor.y), 2));
        if (dist < bhole.r) {
            var destination = new Movable(this.coor.x, this.coor.y, this.speed, this.dir);
            destination.move();
            destination.speed = bhole.g;
            destination.dir = deg(Math.atan2((bhole.coor.y - this.coor.y), (bhole.coor.x - this.coor.x)));
            destination.move();

            ctx.beginPath();
            ctx.save();
            ctx.translate(destination.coor.x, destination.coor.y);
            ctx.arc(0, 0, this.r / 4, 0, 6.28, false);
            ctx.fillStyle = "red";
            ctx.fill();
            ctx.restore();
            ctx.closePath();
        }*/
    }
}

class Target extends Hittable {
    constructor(x = canvas.width / 2, y = canvas.height / 2, speed = 6, dir = 0, r = 10) {
        super(x, y, speed, dir);
        this.dest = new Coor(x, y);
        this.r = r;
        this.setHitbox(0, 0, 10, this);
    }
    setDest() {
        if (mouse.ch) {
            this.dest.x = mouse.coor.x;
            this.dest.y = mouse.coor.y;
        }
    }
    move() {
        if (!(this.dest.x == this.coor.x && this.dest.y == this.coor.y)) {
            this.dir = deg(Math.atan2(this.dest.y - this.coor.y, this.dest.x - this.coor.x));
            this.coor.x += dpf(this.speed) * Math.cos(rad(this.dir));
            this.coor.y += dpf(this.speed) * Math.sin(rad(this.dir));
            if (Math.pow(this.speed, 2) > Math.pow(this.dest.x - this.coor.x, 2) + Math.pow(this.dest.y - this.coor.y, 2)) {
                this.coor.x = this.dest.x;
                this.coor.y = this.dest.y;
            }
        }
    }
    update() {
        this.setDest();
        this.move();
        this.updateHitbox();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.coor.x, this.coor.y, this.r, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'coral';
        ctx.fill();
        ctx.closePath();
        for (var hbox of this.hitbox) {
            hbox.draw();
        }
    }
}
class Missile extends Hittable {
    constructor(x, y, speed, dir, tar, exist) {
        super(x, y, speed, dir);
        this.exist = exist;
        this.img.src = "images/missile.png"
        this.RoG = 2
        this.tar = tar;

        this.setHitbox(-25, 0, 14, this);
        this.setHitbox(-4, 0, 4, this);
    }
    homing() {
        var dest_degree = deg(Math.atan2(this.tar.coor.y - this.coor.y, this.tar.coor.x - this.coor.x));
        var offset_degree = (dest_degree - this.dir) % 360;
        if (offset_degree < -180) offset_degree += 360;
        if (offset_degree >= 180) offset_degree -= 360;

        if (-90 <= offset_degree && offset_degree < 90) {
            if (Math.abs(offset_degree) <= this.RoG) this.dir = dest_degree;
            else {
                if (offset_degree < 0)
                    this.dir = this.dir - this.RoG;
                else
                    this.dir = this.dir + this.RoG;

                this.dir %= 360;
                if (this.dir < 0) this.dir += 360;
            }
        }
        //ctx.beginPath();
        //ctx.fillText(dest_degree, canvas.width / 2, 50)
        //ctx.fillText(offset_degree, canvas.width / 2, 60)
        //ctx.closePath();
    }
    parish() {
        if (!(-40 < this.coor.x && this.coor.x < canvas.width + 40 && -40 < this.coor.y && this.coor.y < canvas.height + 40)) {
            this.exist = false;
        }
    }
    move() {
        this.coor.x += this.speed * Math.cos((this.dir) * Math.PI / 180);
        this.coor.y += this.speed * Math.sin((this.dir) * Math.PI / 180);
    }
    update() {
        if (this.exist) {
            this.homing();
            this.move();
            this.updateHitbox();
            this.parish();
        }
    }
    draw() {
        if (this.exist) {
            ctx.save();
            ctx.translate(this.coor.x, this.coor.y);
            ctx.rotate((this.deg) * (Math.PI / 180));
            ctx.beginPath();
            ctx.rotate((this.dir + 180) * (Math.PI / 180));
            drawEllipseByCenter(ctx, 64 + randint(12), 0, 40, 20)
            ctx.fillStyle = this.fire_color[randint(this.fire_color.length)];
            ctx.fill();
            ctx.closePath();
            ctx.rotate(-45 * (Math.PI / 180));
            ctx.drawImage(this.img, 0, 0);
            ctx.restore();
            for (var hbox of this.hitbox) {
                hbox.draw();
            }
        }
    }
}
Missile.prototype.fire_color = ["red", "orange", "darkorange", "gold"];