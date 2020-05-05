// JavaScript source code
class Mouse {
    constructor() {
        this.coor = new Coor(0, 0);
        this.down = false;
        this.ch = undefined;
        this.selected = undefined;
    }
    update(ch,event) {
        this.ch = ch;
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
var mouse = new Mouse();
