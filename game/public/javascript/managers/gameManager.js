import MapManager from "./mapManager.js";
import SpriteManager from "./spriteManager.js";
import EventsManager from "./eventsManager.js";
import PlayerFabric from "../fabrics/playerFabric.js";
import HealFabric from "../fabrics/healFabric.js";
import FlameFabric from "../fabrics/flameFabric.js";
import DedFabric from "../fabrics/dedFabric.js";
import DoorFabric from "../fabrics/doorFabric.js";
import DoorKeyFabric from "../fabrics/doorKeyFabric.js";
import ChestKeyFabric from "../fabrics/chestKeyFabric.js";
import ChestFabric from "../fabrics/chestFabric.js";
import PeaksFabric from "../fabrics/peaksFabric.js";
import LightsFabric from "../fabrics/lightsFabric.js";
import ExitFabric from "../fabrics/exitFabric.js";
import SpiritFabric from "../fabrics/spiritFabric.js";
import BossFabric from "../fabrics/bossFabric.js";
import SoundManager from "./soundManager.js";


const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

function contextSettingsOne(){
    ctx.fillStyle = "orange";
    ctx.font = '18px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
}

function renderTextOnScreen(text){
    contextSettingsOne()
    ctx.fillText(text, canvas.width/2+2, canvas.height/2+2);
    ctx.fillStyle = "#FFDA00";
    ctx.fillText(text, canvas.width/2, canvas.height/2);
}

let instance = null;
let requestId;

class GameManager{
    constructor() {
        if(!instance) {
            instance = this;
            instance.init()
            instance.initForAllGame()
        }
        return instance;
    }

    init(){
        instance = this;
        instance.factory = {}
        instance.entities = []
        instance.player = null
        instance.laterKill = []
        instance.lateDrawMessage = []

        instance.levelEnd = false
        instance.gameOver = false
        instance.onPause = false
        instance.gameStart = false

        instance.lastTimeUpdate = Date.now()
    }
    initForAllGame(){
        instance.score = 0
        instance.level = 0
        instance.lastPlayer = null
        instance.levels = [
            {map: "../map.json", spritesJSON: "/sprites.json",  spritesPNG: 'spritesheet.png', levelSound: "../sounds/level1.wav",
                soundPaths: ["../sounds/level1.wav","../sounds/door.wav","../sounds/hit.wav","../sounds/fire.wav",
                            "../sounds/chest.wav","../sounds/playerStep.wav","../sounds/enemyStep.wav","../sounds/key.wav",
                            "../sounds/heal.wav","../sounds/peaks.wav"]},
            {map: "../map2.json", spritesJSON: "/sprites.json",  spritesPNG: 'spritesheet.png', levelSound: "../sounds/level2.wav",
                soundPaths: ["../sounds/level2.wav","../sounds/spirit.wav","../sounds/hit.wav","../sounds/playerStep.wav",
                            "../sounds/boss.wav","../sounds/bossDie.wav","../sounds/bossSpeedUp.wav","../sounds/fire.wav",
                            "../sounds/heal.wav","../sounds/peaks.wav"],
                wallsWhenBossFight: [{x: 896,y: 704}], peaksWhenBossFight: [{x: 896,y: 832, isVertical: true},{x: 896,y: 1024, isVertical: true},{x: 896,y: 1280, isVertical: true},{x: 896,y: 1472, isVertical: true},{x: 706,y: 960, isVertical: true},{x: 1088,y: 960, isVertical: true},{x: 706,y: 1344, isVertical: true},{x: 1088,y: 1344, isVertical: true},{x: 768,y: 1152, isVertical: true},{x: 1024,y: 1152, isVertical: true}]}
        ]
    }
    initPlayer(obj){
        instance.player = obj;
    }
    kill(obj){
        if(instance.laterKill.indexOf(obj) === -1) {
            instance.laterKill.push(obj);
        }
    }
    async pushScore(data) {
        let fetchResponse = await fetch(document.location.href, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return await fetchResponse.text()
    }
    update(dt){
        if(instance.levelEnd){
            console.log("LEVEL END ", requestId)
            instance.stop()
            instance.level++
            instance.score = instance.player.score
            if(instance.level === instance.levels.length){
                instance.addMessage("YOU WIN!")
                instance.end()
                return;
            }
            instance.lastPlayer = instance.player
            instance.levelEnd = false
            instance.init()
            instance.loadAll()
            instance.play()
            instance.addMessage("NEXT LEVEL " + instance.level.toString())
            return
        }
        if(dt === undefined) dt = 60/1000
        if(instance.player === null) {
            return;
        }

        if(instance.eventsManager.action["up"]) instance.player.move_y = -1;
        if(instance.eventsManager.action["down"]) instance.player.move_y = +1;
        if(instance.eventsManager.action["left"]) instance.player.move_x = -1;
        if(instance.eventsManager.action["right"]) instance.player.move_x = +1;
        if(instance.eventsManager.action["fire"]) {
            instance.eventsManager.action["fire"] = false
            instance.player.fire(instance);
        }
        instance.entities.forEach((entity) => {
            try {
                if(entity.update) entity.update(dt);
            } catch (e) {
                console.log(e);
            }
        })
        for (let i = 0; i < instance.laterKill.length; i++) {
            if(instance.laterKill[i] === instance.player) {
                instance.score = instance.player.score
                instance.player = null
                instance.gameOver = true
            }
            let idx = instance.entities.indexOf(instance.laterKill[i]);
            if(idx !== -1){
                instance.entities.splice(idx,1);
            }
        }
        if(instance.laterKill.length !== 0) {
            instance.laterKill.length = 0;
        }

        if(instance.player !== null){
            instance.mapManager.centerAt(instance.player.pos_x, instance.player.pos_y);
        }
        instance.entities.sort((en1, en2) => {
            let k1 = en1.pos_y, k2 = en2.pos_y;
            let isPeaks1 = en1.name === "peaks", isPeaks2 = en2.name === "peaks"
            return (k1 >= k2) ? (isPeaks1 ? -1 : 1) : (isPeaks2 ? 1 : -1);
        } );
        instance.draw(ctx);
        if(instance.gameOver){
            instance.addMessage("GAME OVER")
            instance.end()
            instance.stop()
        }
    }
    async end() {
        instance.draw(ctx);
        instance.renderEndScreen()
        await instance.pushScore({nickname: localStorage.getItem('username'), score: instance.score})
    }
    draw(){
        //maybe bad
        instance.mapManager.drawBack(ctx);
        instance.entities.forEach((entity) => {
            if(entity.draw) entity.draw(ctx);
            if(entity.zeroMove){
                entity.zeroMove()
            }
        });
        instance.mapManager.drawFront(ctx);
        instance.lateDrawMessage.forEach((message) => {
            renderTextOnScreen(message)
        });
    }
    createPeaksWhenBossFight(){
        const levelInfo = instance.levels[instance.level]
        if(levelInfo.peaksWhenBossFight){
            for (const peak of levelInfo.peaksWhenBossFight) {
                const newPeak = instance.factory["peaks"].create(peak.x, peak.y)
                if(peak.isVertical) newPeak.isVertical = true
                newPeak.isForBoss = true
                instance.entities.push(newPeak)
            }
        }
    }
    removePeaksWhenBossFight(){
        instance.entities.forEach((entity) => {
            if(entity.name === "peaks" && entity.isForBoss) {
                instance.kill(entity)
            }
        })
    }
    contextSettingsOne(){
        ctx.fillStyle = "orange";
        ctx.font = '18px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }
    renderTextOnScreen(text){
        instance.contextSettingsOne()
        ctx.fillText(text, canvas.width/2+2, canvas.height/2+2);
        ctx.fillStyle = "#FFDA00";
        ctx.fillText(text, canvas.width/2, canvas.height/2);
    }
    renderStartScreen(){
        ctx.fillStyle = "#3d253b"
        ctx.fillRect(0,0,canvas.width,canvas.height)
        renderTextOnScreen("Press ENTER to start")
    }
    renderEndScreen(){
        instance.contextSettingsOne()
        ctx.fillText("Press ENTER to continue", canvas.width/2+2, canvas.height/2+2 + 64);
        ctx.fillStyle = "#FFDA00";
        ctx.fillText("Press ENTER to continue", canvas.width/2, canvas.height/2 + 64);
    }
    addMessage(message){
        instance.lateDrawMessage.push(message)
        setTimeout(gameManager.clearMessage, 2000)
    }
    clearMessage(){
        instance.lateDrawMessage = []
    }
    loadAll(){
        if(!instance.mapManager) instance.mapManager = new MapManager()
        else instance.mapManager.init();
        if(!instance.spriteManager) instance.spriteManager = new SpriteManager()
        else instance.spriteManager.init();
        if(!instance.eventsManager) {
            instance.eventsManager = new EventsManager();
            instance.eventsManager.setup(canvas);
        }
        if(!instance.soundManager) {
            instance.soundManager = new SoundManager()
            instance.soundManager.init()
        }
        else instance.soundManager.init()

        let curLVL = instance.levels[instance.level]
        instance.mapManager.loadMap(curLVL.map)
        instance.spriteManager.loadAtlas(curLVL.spritesJSON, curLVL.spritesPNG);
        instance.soundManager.loadArray(curLVL.soundPaths)
        instance.soundManager.play(curLVL.levelSound, {looping: true, volume: 1})

        instance.factory["boss"] = new BossFabric();
        instance.factory["chest"] = new ChestFabric();
        instance.factory["chestkey"] = new ChestKeyFabric();
        instance.factory["enemy"] = new DedFabric();
        instance.factory["door"] = new DoorFabric();
        instance.factory["doorkey"] = new DoorKeyFabric();
        instance.factory["exit"] = new ExitFabric();
        instance.factory["flame"] = new FlameFabric();
        instance.factory["heal"] = new HealFabric();
        instance.factory["lights"] = new LightsFabric();
        instance.factory["player"] = new PlayerFabric();
        instance.factory["peaks"] = new PeaksFabric();
        instance.factory["spirit"] = new SpiritFabric();
        instance.mapManager.parseEntities(instance);
        instance.gameStart = true

        instance.draw(ctx);
    }
    play(){
        requestId = undefined
        let now = Date.now();
        let dt = (now - instance.lastTimeUpdate) / 1000.0;
        instance.lastTimeUpdate = now;
        requestId = requestAnimationFrame(instance.play);

        instance.update(dt);
    }
    stop() {
        if (requestId) {
            cancelAnimationFrame(requestId);
            requestId = undefined;
        }
    }
}

const gameManager = new GameManager()
export default gameManager;


document.addEventListener('keydown', event => {
    switch (event.keyCode){
        case 13:
            if(instance.gameStart){
                if(instance.gameOver || instance.levelEnd){
                    document.location.replace("records")
                } else if(!instance.onPause){
                    instance.onPause = true
                    instance.renderTextOnScreen("PAUSE")
                    instance.soundManager.pauseSounds()
                    instance.stop()
                } else if(instance.onPause){
                    instance.soundManager.pauseSounds()
                    instance.play()
                    instance.onPause = false
                } else if(instance.levelEnd){
                    document.location.replace("records")
                }
            } else {
                gameManager.loadAll();
                gameManager.play();
            }
            break;
    }
});

gameManager.renderStartScreen()
window.gameManager = instance