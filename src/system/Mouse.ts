import {Coor} from '../objects/Objects.js'

class Mouse {
	public coor:Coor
	public down:boolean
	public ch:any
	public selected:any
    constructor() {
        this.coor = new Coor(0, 0);
        this.down = false;
        this.ch = undefined;
        this.selected = undefined;
    }
    update(event:any) {
        this.coor.x = event.offsetX;
        this.coor.y = event.offsetY;
    }
    clicked() {
        this.down = true;
    }
    unclicked() {
        this.down = false;
        this.selected = undefined;
    }
}

const mouse:Mouse=new Mouse()
export {mouse}