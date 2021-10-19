import { canvas, ctx, deg, dpf, rad } from "../game/Global.js";
import { mouse } from "../system/Mouse.js";
import { Coor, Hittable } from "./Objects.js";

class Target extends Hittable {
	public dest:Coor
	public r:number
	constructor(x = canvas.width / 2, y = canvas.height / 2, speed = 6, dir = 0, r = 10) {
		super(x, y, speed, dir);
		this.dest = new Coor(x, y);
		this.r = r;
		this.setHitbox(0, 0, 10, this);
	}
	init(x = canvas.width / 2, y = canvas.height / 2){
		this.coor=new Coor(x,y)
	}
	setDest(x:number, y:number) {
		this.dest.x = x
		this.dest.y = y
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

const target:Target=new Target()
export {target}