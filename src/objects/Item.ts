import { canvas, ctx, randColor, randint } from "../game/Global";
import { Missile, missileList } from "./Missile";
import { Hittable } from "./Objects";
import { target } from "./Target";
import {timer} from '../game/Timer'

const ITEM_RADIUS=10

class Item_ extends Hittable {
	static color_list: string[] = ["silver", "white", "black"]
	static letter_list: string[] = ["B", "S", "T"];

	private model:number
	private duration:number
	private startTime:number
	private r:number=ITEM_RADIUS
	constructor(x:number,y:number, model:number, duration:number){
		super(x,y,0,0)
		this.model=model
		this.startTime=timer.now()
		this.duration=duration
	}
	getModel(){return this.model}
	isValid(){
		if(this.startTime+this.duration<timer.now()) return false
		else return true
	}
	draw(){
		ctx.beginPath();
		ctx.arc(this.coor.x, this.coor.y, this.r, 0, Math.PI * 2);
		ctx.fillStyle = Item_.color_list[this.model];
		ctx.fill();
		ctx.closePath();
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillStyle = Item_.color_list[(this.model + 1) % Item_.color_list.length];
		ctx.fillText(Item_.letter_list[this.model], this.coor.x, this.coor.y + 7);
		ctx.closePath();
	}
}
class ItemEffect{
	affect(){}
	draw(){}
}
class ItemEffect0 extends ItemEffect {
	draw(){
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillText("I T E M : 0", canvas.width / 2, 50);
		ctx.closePath();

		ctx.beginPath();
		ctx.arc(target.coor.x, target.coor.y, 5 * (timer.now()%1000), 0, 2 * Math.PI, false)
		ctx.fillStyle = randColor((25 - (timer.now()%1000)) / 50.0)
		ctx.fill();
		ctx.closePath();
	}
	affect(){
		missileList.affect((i: Missile) => {
			let tmp_degree = Math.atan((target.coor.y - i.coor.y) / (target.coor.x - i.coor.x)) * 180 / Math.PI;
			if (target.coor.x < i.coor.x) tmp_degree -= 180;
			i.coor.x += 2 * Math.cos((tmp_degree + 180) * Math.PI / 180);
			i.coor.y += 2 * Math.sin((tmp_degree + 180) * Math.PI / 180);
		})
	}
}
class ItemEffect1 extends ItemEffect{
	draw(){
		ctx.beginPath();
		ctx.textAlign = "center";
		ctx.fillText("I T E M : 1", canvas.width / 2, 60);
		ctx.closePath();
		if (timer.now() % 2 == 0) {
			var lightning = new Image();
			lightning.src = "images/lightning" + randint(4) + ".png";
			ctx.save();
			ctx.drawImage(lightning
				, 0, 0
				, lightning.naturalWidth, lightning.naturalHeight
				, target.coor.x + Math.cos(2 * Math.PI * (timer.now() / 25.0)) * 50 - lightning.naturalWidth / 2, target.coor.y + Math.sin(2 * Math.PI * (timer.now() / 25.0)) * 50 - lightning.naturalHeight / 2
				, lightning.naturalWidth, lightning.naturalHeight);
			ctx.drawImage(lightning
				, 0, 0
				, lightning.naturalWidth, lightning.naturalHeight
				, target.coor.x - Math.cos(2 * Math.PI * (timer.now() / 25.0)) * 50 - lightning.naturalWidth / 2, target.coor.y - Math.sin(2 * Math.PI * (timer.now() / 25.0)) * 50 - lightning.naturalHeight / 2
				, lightning.naturalWidth, lightning.naturalHeight);
			ctx.restore();
		}
	}
	affect(){
		missileList.affect((i) => {
			if (10 <= i.coor.x && i.coor.x < canvas.width - 10 && 10 <= i.coor.y && i.coor.y < canvas.height - 10) {
				i.RoG = 0;
			}
			if (i.getModelNum() === 2 || i.getModelNum() === 3) {
				if (0.4 < i.speed) i.speed -= 0.1;
			}
		})
	}
}
class ItemManager{
	private itemCount:number[]=[0,0,0]
	private itemInField:Item_[]=[]
	private itemEffect:ItemEffect[]=[new ItemEffect0(), new ItemEffect1()]
	constructor(){}
	addItemInField(){
		this.itemInField.push(new Item_(randint(canvas.width - 20) + 10, randint(canvas.height - 20) + 10, randint(2), 96))
	}
	update(){
		for(let i=0;i<this.itemInField.length;i++){
			if(!this.itemInField[i].isValid){
				this.itemInField=this.itemInField.filter((i)=>(i.isValid()))
			}
			for(let i of this.itemInField){
				if(i.isHitWith(target)){
					this.itemCount[i.getModel()]=100
				}
			}
		}

		for(let i =0;i<this.itemCount.length;i++){
			if(0<this.itemCount[i]){
				this.itemCount[i]--
				this.itemEffect[i].affect()
			}
		}

	}
	draw(){
		this.itemInField.map((i)=>{i.draw()})
		for(let i=0;i<this.itemCount.length;i++){
			if(0 < this.itemCount[i]){
				this.itemEffect[i].draw()
			}
		}
	}
}