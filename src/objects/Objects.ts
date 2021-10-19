import { ctx, canvas, dpf, rad, distCoor2Coor, deg, drawEllipseByCenter, randint } from '../game/Global.js'

class Coor {
	constructor(public x: number, public y: number) {
		this.x = x
		this.y = y
	}
}
//hitbox
class Hitbox {
	public master: Hittable
	public coor_relative: Coor
	public coor: Coor
	public r: number
	constructor(x: number, y: number, r: number, master: Hittable, relX:number=0, relY:number=0) {
		this.master = master
		this.coor_relative = new Coor(relX, relY)
		this.coor = new Coor(master.coor.x + x, master.coor.y + y)
		this.r = r
	}
	setRelativeCoor(relX:number=0, relY:number=0){
		this.coor_relative = new Coor(relX, relY)
		this.coor = new Coor(this.master.coor.x + this.coor.x, this.master.coor.y + this.coor.y)
	}
	update() {
		var h = distCoor2Coor(this.coor_relative, new Coor(0,0))
		this.coor.x = this.master.coor.x + -h * Math.cos(rad(this.master.dir))
		this.coor.y = this.master.coor.y + -h * Math.sin(rad(this.master.dir))
	}
	isHitWith(h:Hitbox) {
		if (h.r + this.r > Math.abs(this.coor.x - h.coor.x) && h.r + this.r > Math.abs(this.coor.y - h.coor.y)) {
			if (h.r + this.r > distCoor2Coor(h.coor, this.coor)) {
				return true
			}
		}
		return false
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
	public coor: Coor
	constructor(x:number, y:number) {
		this.coor = new Coor(x, y);
	}
}

//movable
class Movable extends Objects {
	public speed: number
	public dir: number
	public img: HTMLImageElement
	constructor(x:number, y:number, speed:number, dir:number) {
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
	moveTo(dest:Coor) {
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
	public hitbox:Hitbox[]
	public hitby:Hitbox[]
	constructor(x:number, y:number, speed:number, dir:number) {
		super(x, y, speed, dir);
		this.hitbox = [];
		this.hitby = [];
	}
	isHitWith(other:Hittable){
		for(let j of this.hitbox){
			for(let k of other.hitbox){
				if(j.isHitWith(k)){
					return true
				}
			}
		}
		return false
	}
	updateHitbox() {
		for (let hbox of this.hitbox) {
			hbox.update();
		}
	}
	setHitbox(x:number, y:number, r:number, master:Hittable, relX:number=0, relY:number=0) {
		this.hitbox[this.hitbox.length] = new Hitbox(x, y, r, master, relX, relY);
	}
	drawHitbox() {
		for (var hbox of this.hitbox) {
			hbox.draw();
		}
	}
}

//pen class
class Pen extends Objects {
	public r: number
	public color: string
	public is_down: boolean
	constructor(x:number, y:number, r:number, color:string) {
		super(x, y);
		this.r = r;
		this.color = color;
		this.is_down = false;
	}
	Down() { this.is_down = true; }
	Up() { this.is_down = false; }
}

export { Coor, Hittable }