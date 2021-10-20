import { canvas, ctx, deg, drawEllipseByCenter, rad, randint } from '../game/Global.js'
import { MessageDelivery } from '../system/MessageInteraction.js'
import { Hittable } from './Objects.js'
import { target } from './Target.js'


class Missile extends Hittable {
	static fireColor: string[] = ["red", "orange", "darkorange", "gold"]

	private exist: boolean
	private RoG: number = 2
	protected tar: Hittable
	constructor(x: number, y: number, speed: number, dir: number, tar: Hittable, exist: boolean) {
		super(x, y, speed, dir);
		this.exist = exist;
		this.img.src = "images/missile.png"
		this.RoG = 2
		this.tar = tar;

		this.setHitbox(0, 0, 14, this, -25, 0);
		this.setHitbox(0, 0, 4, this, -4, 0);
	}
	setRoG(val: number) { this.RoG = val }
	isExist() { return this.exist }
	getModelNum() { return 0 }
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
			ctx.rotate(rad(this.dir + 180));
			ctx.beginPath();
			drawEllipseByCenter(64 + randint(0, 12), 0, 40, 20)
			ctx.fillStyle = Missile.fireColor[randint(0, Missile.fireColor.length)];
			ctx.fill();
			ctx.closePath();
			ctx.rotate(rad(-45));
			ctx.drawImage(this.img, 0, 0);
			ctx.restore();
			// for (var hbox of this.hitbox) {
			// 	hbox.draw();
			// }
		}
	}
}
class MissileFast extends Missile {
	static model: number = 1
	constructor(x: number, y: number, speed: number, dir: number, tar: Hittable, exist: boolean) {
		super(x, y, speed, dir, tar, exist)
		this.img.src = "images/missile_fast.png";
	}
	getModelNum() { return 1 }
}
class MissileStraight extends Missile {
	static model: number = 2
	constructor(x: number, y: number, speed: number, dir: number, tar: Hittable, exist: boolean) {
		super(x, y, speed, dir, tar, exist)
		this.dir = deg(Math.atan2(this.tar.coor.y - this.coor.y, this.tar.coor.x - this.coor.x))
		this.img.src = "images/missile_straight.png";
	}
	getModelNum() { return 2 }
	homing() { }
}
class MissileAccelerate extends Missile {
	static model: number = 3
	constructor(x: number, y: number, speed: number, dir: number, tar: Hittable, exist: boolean) {
		super(x, y, speed, dir, tar, exist)
		this.speed = 0.1
		this.dir = deg(Math.atan2(this.tar.coor.y - this.coor.y, this.tar.coor.x - this.coor.x))
		this.img.src = "images/missile_accelerate.png";
	}
	getModelNum() { return 3 }
	homing() { }
	update() {
		super.update()
		this.speed += this.speed / 5 + 0.04;
	}
}

class MissileList {
	private list: Missile[] = []
	private MD: MessageDelivery = new MessageDelivery()
	private missile_dodged: number = 0
	constructor() {
		this.MD.setAction("second", (data: number) => {
			if (data % 10 === 0) {
				this.addMissile()
			}
		})
	}
	init() {
		this.list = []
		this.missile_dodged = 0
		for (let i = 0; i < 3; i++) {
			this.addMissile()
		}
	}
	private createMissile(model?: number) {
		//네 모서리 중 아디서 나오는지
		let x, y, deg
		switch (randint(4)) {
			case 0:
				x = 0, y = randint(canvas.height), deg = 1
				break
			case 1:
				x = randint(canvas.width), y = 0, deg = 91
				break
			case 2:
				x = canvas.width, y = randint(canvas.height), deg = 181
				break
			case 3:
			default:
				x = randint(canvas.width), y = canvas.height, deg = 271
				break
		}

		//어떤 모델이 나오는지(모델명 입력 안 되었으면 랜덤)
		if (model === undefined) model = randint(4)
		switch (model) {
			case 1:
				return new MissileFast(x, y, randint(7, 9), deg, target, true)
			case 2:
				return new MissileStraight(x, y, randint(9, 11), deg, target, true)
			case 3:
				return new MissileAccelerate(x, y, 0, deg, target, true)
			case 0:
			default:
				return new Missile(x, y, randint(3, 6), deg, target, true)
		}
	}
	isHitWith(other: Hittable) {
		for (let i of this.list) {
			if (i.isHitWith(other)) {
				return true
			}
		}
		return false
	}
	addMissile() {
		this.list.push(this.createMissile())
	}
	affect(effect: (i: Missile) => void) {
		for (let i of this.list) {
			effect(i)
		}
	}
	getMissileDodged() { return this.missile_dodged }
	manage() {
		//parish된 미사일을 새로운 것으로 교체
		for (var i = 0; i < this.list.length; i++) {
			if (this.list[i].isExist() == false) {
				this.missile_dodged += 1
				this.list[i] = this.createMissile()
			}
		}
	}
	update() {
		this.manage()
		this.list.map((i) => { i.update() })
	}
	draw() {
		this.list.map((i) => { i.draw() })
	}
}

const missileList: MissileList = new MissileList()
missileList.init()
export { Missile, missileList }