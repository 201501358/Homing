import { target } from '../objects/Target.js'
import { missileList } from '../objects/Missile.js'
import { canvas, ctx, frame } from './Global.js'
import { eventHandler } from '../system/EventHandler.js';
import { timer } from './Timer.js';
import { gameStatus } from './GameStatus.js';

let status_pause = false;

document.getElementById("myCanvas")?.addEventListener("click", (e) => {
    if (gameStatus.getStatus() === 1) {
        target.setDest(e.x, e.y)
    }
    else if (gameStatus.getStatus() === 0) {
        gameStatus.setStatus(1)
    }
    else if(gameStatus.getStatus()===3){
        missileList.init()
        target.init()
        timer.init()
        gameStatus.setStatus(0)
    }
})

function update() {
    if (!status_pause) {
        target.update()
        missileList.update()
    }
}
function draw() {
    if (!status_pause) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        target.draw()
        missileList.draw()
    }
}
function collision() {
    if (missileList.isHitWith(target)) {
        eventHandler.push(() => {
            gameStatus.setStatus(3)
        })
    }
}

function main() {
    eventHandler.handleEvent()

    if (gameStatus.getStatus() === 0) {        //init
        gameStatus.drawInit()
    }
    else if (gameStatus.getStatus() === 1) {        //playing
        update()
        collision()
        draw()
    }
    else if (gameStatus.getStatus() === 2) {        //pause

    }
    else if (gameStatus.getStatus() === 3) {        //gameover
        gameStatus.drawGameover(Math.floor(timer.now() / 1000), missileList.getMissileDodged())
    }
}

timer.start()
setInterval(main, frame);