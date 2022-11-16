import PhysicManager from "./managers/physicManager.js";
import SpriteManager from "./managers/spriteManager.js";
import FlameFabric from "./fabrics/flameFabric.js";
import DoorKeyFabric from "./fabrics/doorKeyFabric.js";
import gameManager from "./managers/gameManager.js";

const flameFabric = new FlameFabric()
const doorKeyFabric = new DoorKeyFabric()

function distance(obj1, obj2){
    let dx = obj1.pos_x + obj1.size_x / 2 - obj2.pos_x - obj2.size_x / 2
    let dy = obj1.pos_y + obj1.size_y / 2 - obj2.pos_y - obj2.size_y / 2
    let d = Math.sqrt(dx**2 + dy**2)
    return {
        dx: dx,
        dy: dy,
        d: d
    }
}

class Entity {
    constructor(x = 0, y = 0, w = 0, h = 0) {
        this.pos_x = x
        this.pos_y = y
        this.size_x = w
        this.size_y = h
        this.physicManager = new PhysicManager()
        this.spriteManager = new SpriteManager()
    }
}

class Exit extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w,h);
        this.name = "exit"
        this.score = 30
    }
}

class Player extends Entity {
    constructor(x, y, w, h, health = 100, speed = 0, move_x = 0, move_y = 0) {
        super(x, y, w, h);
        this.health = health
        this.maxHealth = health
        this.move_x = move_x
        this.move_y = move_y
        this.speed = speed
        this.chestKeys = 0
        this.doorKeys = 0
        this.score = 0
        this.name = "player"
        this.leftFace = false
        this.hasDamage = false
        this.frameIdx = 1;
        this.lastTimeDraw = Date.now();
        this.lastPeaksDamage = Date.now();
        this.lastAttack = Date.now();
        this.lastStepSound = Date.now();
    }

    draw(ctx) {
        let side = (this.leftFace) ? "left" : "right";
        let wait = (this.move_x !== 0 || this.move_y !== 0) ? "step" : "wait";

        if(this.hasDamage){
            if(this.frameIdx%2 === 0) {
                this.spriteManager.drawSprite(ctx, side+"player"+wait+this.frameIdx.toString(), this.pos_x, this.pos_y)
            }
        } else {
            this.spriteManager.drawSprite(ctx, side+"player"+wait+this.frameIdx.toString(), this.pos_x, this.pos_y)
        }
        let now = Date.now();
        let dt = (now - this.lastTimeDraw) / 1000.0;
        if (dt > 0.1) {
            this.lastTimeDraw = now
            this.frameIdx = (this.frameIdx) % 5 + 1
        }

        this.spriteManager.drawHealth(ctx, this.pos_x, this.pos_y, this.size_x, this.size_y, this.health, this.maxHealth)
    }

    update(dt) {
        if(this.move_x !== 0 || this.move_y !== 0){
            let now = Date.now()
            let dt = (now - this.lastStepSound)/1000.0;
            if(dt > 0.5){
                gameManager.soundManager.playWithDist("../sounds/playerStep.wav", this.pos_x, this.pos_y)
                this.lastStepSound = now
            }
        }
        this.physicManager.update(this, dt)
    }

    zeroMove(){
        this.move_x = 0
        this.move_y = 0
    }

    onTouchEntity(obj) {
        if (obj.name.match(/heal/)) {
            gameManager.soundManager.playWithDist("../sounds/heal.wav", this.pos_x, this.pos_y)

            this.health += obj.health
            obj.kill(gameManager)
        }
        if (obj.name.match(/exit/)) {
            this.score += obj.score
            gameManager.levelEnd = true
        }
        if (obj.name.match(/flame[\d*]/) && !obj.fromPlayer) {
            if((obj.pos_y + obj.size_y >= this.pos_y ||
                obj.pos_y <= this.pos_y + this.size_y) &&
                ((this.pos_x <= obj.size_x+obj.pos_x && this.pos_x >= obj.pos_x) ||
                (this.pos_x + this.size_x <= obj.size_x+obj.pos_x && this.pos_x + this.size_x >= obj.pos_x)
                )){
                this.damage(obj.damageHP)
                gameManager.kill(obj)
            }
        }
        if (obj.name.match(/chestkey[\d*]/)) {
            gameManager.soundManager.playWithDist("../sounds/key.wav", this.pos_x, this.pos_y)

            this.chestKeys++
            obj.kill(gameManager)
            gameManager.addMessage("You up key for chest")
        } else if (obj.name.match(/chest/) && this.chestKeys > 0 && !obj.isOpen) {
            this.chestKeys--
            obj.open()
        }
        if (obj.name.match(/doorkey[\d*]/)) {
            gameManager.soundManager.playWithDist("../sounds/key.wav", this.pos_x, this.pos_y)

            this.doorKeys++
            obj.kill(gameManager)
            gameManager.addMessage("You up key for doors")
        }else if (obj.name.match(/door/) && this.doorKeys > 0 && !obj.isOpen) {
            gameManager.soundManager.playWithDist("../sounds/door.wav", obj.pos_x, obj.pos_y)
            this.doorKeys--
            obj.open()
        }
        this.checkHealth()
    }
    checkHealth(){
        if(this.health <= 0) {
            gameManager.score = this.score
            gameManager.kill(this)
        }
        if(this.health >= 100) {
            this.health = 100
        }
    }
    damageFromPeaks(obj){
        let now = Date.now()
        let dt = (now - this.lastPeaksDamage) / 1000.0;
        if (dt > 1 && obj.isActive) {
            this.lastPeaksDamage = now
            this.damage(obj.damageHP)
        }
        this.checkHealth()
    }
    damage(dm){
        if(!this.hasDamage){
            gameManager.soundManager.playWithDist("../sounds/hit.wav", this.pos_x, this.pos_y)

            this.health -= dm
            this.score -= 3
            if(this.score < 0) this.score = 0
            this.changeDamageFlag()
            setTimeout(this.changeDamageFlag.bind(this), 1000)
            this.checkHealth()
        }
    }
    changeDamageFlag(){
        this.hasDamage = (!this.hasDamage)
    }
    kill() {
        gameManager.laterKill.push(this)
    }

    fire() {
        let now = Date.now()
        if((now - this.lastAttack)/1000.0 > 0.8){
            this.lastAttack = now
            let r = flameFabric.create(0,0,34, 34, this.move_x, this.move_y)
            r.move_y = this.move_y
            r.move_x = this.move_x
            if(this.move_x === -1 && this.move_y === 0) {
                r.pos_x = this.pos_x - r.size_x/2
                r.pos_y = this.pos_y
            } else if (this.move_x === 1 && this.move_y === 0) {
                r.pos_x = this.pos_x + r.size_x/2
                r.pos_y = this.pos_y
            } else if(this.move_x === 0 && this.move_y === -1) {
                r.pos_x = this.pos_x
                r.pos_y = this.pos_y - r.size_y/2
            } else if(this.move_x === 0 && this.move_y === 1) {
                r.pos_x = this.pos_x
                r.pos_y = this.pos_y + r.size_y/2
            } else if(this.move_x === -1 && this.move_y === -1) {
                r.pos_x = this.pos_x - r.size_x/2
                r.pos_y = this.pos_y - r.size_y/2
            } else if(this.move_x === -1 && this.move_y === 1) {
                r.pos_x = this.pos_x - r.size_x/2
                r.pos_y = this.pos_y + r.size_y/2
            } else if(this.move_x === 1 && this.move_y === -1) {
                r.pos_x = this.pos_x + r.size_x/2
                r.pos_y = this.pos_y - r.size_y/2
            } else if(this.move_x === 1 && this.move_y === 1) {
                r.pos_x = this.pos_x + r.size_x/2
                r.pos_y = this.pos_y + r.size_y/2
            } else if(this.move_x === 0 && this.move_y === 0) {
                if(this.leftFace){
                    r.pos_x = this.pos_x - r.size_x/2
                    r.pos_y = this.pos_y
                    r.move_x = -1
                } else {
                    r.pos_x = this.pos_x + r.size_x/2
                    r.pos_y = this.pos_y
                    r.move_x = 1
                }
            }
            r.fromPlayer = true
            gameManager.entities.push(r)

            gameManager.soundManager.playWithDist("../sounds/fire.wav", this.pos_x, this.pos_y)
        }
    }
}

class Ded extends Entity {
    constructor(x, y, w, h, health = 100, speed = 1, id = "0", move_x = 0, move_y = 0) {
        super(x, y, w, h);
        this.health = health
        this.maxHealth = health
        this.move_x = move_x
        this.move_y = move_y
        this.speed = speed
        this.score = 20
        this.name = "enemy"+id
        this.leftFace = false
        this.hasDamage = false
        this.frameIdx = 1;
        this.lastTimeDraw = Date.now();
        this.lastPeaksDamage = Date.now();
        this.lastAttack = Date.now();
        this.lastStepSound = Date.now();
    }

    draw(ctx) {
        let side = (this.leftFace) ? "left" : "right";
        let wait = (this.move_x !== 0 || this.move_y !== 0) ? "step" : "wait";
        if(this.hasDamage){
            if(this.frameIdx%2 === 0) {
                this.spriteManager.drawSprite(ctx, side+"enemy"+wait+this.frameIdx.toString(), this.pos_x, this.pos_y)
            }
        } else {
            this.spriteManager.drawSprite(ctx, side+"enemy"+wait+this.frameIdx.toString(), this.pos_x, this.pos_y)
        }
        let now = Date.now();
        let dt = (now - this.lastTimeDraw) / 1000.0;
        if (dt > 0.1) {
            this.lastTimeDraw = now
            this.frameIdx = (this.frameIdx) % 5 + 1
        }
        this.spriteManager.drawHealth(ctx, this.pos_x, this.pos_y, this.size_x, this.size_y, this.health, this.maxHealth)
    }
    zeroMove(){
        this.move_x = 0
        this.move_y = 0
    }

    update(dt){
        if(gameManager.player){
            const distances = distance(gameManager.player, this)
            if(distances.d > 200 && distances.d < 600){
                this.move_x = (distances.dx < -5) ? -1 : ((distances.dx > 5) ? 1 : 0)
                this.move_y = (distances.dy < -5) ? -1 : ((distances.dy > 5) ? 1 : 0)
            } else if(distances.d <= 200) {
                let move_x = (distances.dx < -this.size_x/2) ? -1 : ((distances.dx > this.size_x/2) ? 1 : 0)
                let move_y = (distances.dy < -this.size_y/2) ? -1 : ((distances.dy > this.size_y/2) ? 1 : 0)
                this.fire(move_x, move_y)
            }
        }
        if(this.move_x !== 0 || this.move_y !== 0){
            let now = Date.now()
            let dt = (now - this.lastStepSound)/1000.0;
            if(dt > 0.5){
                gameManager.soundManager.playWithDist("../sounds/enemyStep.wav", this.pos_x, this.pos_y)
                this.lastStepSound = now
            }
        }
        this.physicManager.update(this, dt)
    }

    onTouchEntity(obj) {
        if (obj.name.match(/flame[\d*]/)) {
            if(obj.fromPlayer && (obj.pos_y + obj.size_y >= this.pos_y ||
                    obj.pos_y <= this.pos_y + this.size_y) &&
                ((this.pos_x <= obj.size_x+obj.pos_x && this.pos_x >= obj.pos_x) ||
                    (this.pos_x + this.size_x <= obj.size_x+obj.pos_x && this.pos_x + this.size_x >= obj.pos_x)
                )){
                this.damage(obj.damageHP)
                gameManager.kill(obj)
            }
        }
        this.checkHealth()
    }
    checkHealth(){
        if(this.health <= 0) {
            this.health = 1
            gameManager.player.score += this.score
            gameManager.kill(this)
        }
    }
    damageFromPeaks(obj){
        let now = Date.now()
        let dt = (now - this.lastPeaksDamage) / 1000.0;
        if (dt > 1 && obj.isActive && !this.hasDamage) {
            this.lastPeaksDamage = now
            this.damage(obj.damageHP)
        }
        this.checkHealth()
    }
    damage(dm){
        if(!this.hasDamage){
            gameManager.soundManager.playWithDist("../sounds/hit.wav", this.pos_x, this.pos_y)
            this.health -= dm
            this.changeDamageFlag()
            setTimeout(this.changeDamageFlag.bind(this), 1000)
            this.checkHealth()
        }
    }
    changeDamageFlag(){
        this.hasDamage = (!this.hasDamage)
    }
    kill() {
        gameManager.laterKill.push(this)
    }

    fire(move_x, move_y) {
        let now = Date.now()
        if((now - this.lastAttack)/1000.0 > 1.5){
            this.lastAttack = now
            let r = flameFabric.create(0,0,34, 34, move_x, move_y)
            if(move_x === -1 && move_y === 0) {
                r.pos_x = this.pos_x - r.size_x/2
                r.pos_y = this.pos_y
            } else if (move_x === 1 && move_y === 0) {
                r.pos_x = this.pos_x + r.size_x/2
                r.pos_y = this.pos_y
            } else if(move_x === 0 && move_y === -1) {
                r.pos_x = this.pos_x
                r.pos_y = this.pos_y - r.size_y/2
            } else if(move_x === 0 && move_y === 1) {
                r.pos_x = this.pos_x
                r.pos_y = this.pos_y + r.size_y/2
            } else if(move_x === -1 && move_y === -1) {
                r.pos_x = this.pos_x - r.size_x/2
                r.pos_y = this.pos_y - r.size_y/2
            } else if(move_x === -1 && move_y === 1) {
                r.pos_x = this.pos_x - r.size_x/2
                r.pos_y = this.pos_y + r.size_y/2
            } else if(move_x === 1 && move_y === -1) {
                r.pos_x = this.pos_x + r.size_x/2
                r.pos_y = this.pos_y - r.size_y/2
            } else if(move_x === 1 && move_y === 1) {
                r.pos_x = this.pos_x + r.size_x/2
                r.pos_y = this.pos_y + r.size_y/2
            } else if(move_x === 0 && move_y === 0) {
                if(this.leftFace){
                    r.pos_x = this.pos_x - r.size_x/2
                    r.pos_y = this.pos_y
                    r.move_x = -1
                } else {
                    r.pos_x = this.pos_x + r.size_x/2
                    r.pos_y = this.pos_y
                    r.move_x = 1
                }
            }
            gameManager.entities.push(r)

            gameManager.soundManager.playWithDist("../sounds/fire.wav", this.pos_x, this.pos_y)
        }
    }
}

class Spirit extends Entity {
    constructor(x, y, w, h, damage = 5, health = 50, speed = 1, id = "0", move_x = 0, move_y = 0) {
        super(x, y, w, h);
        this.health = health
        this.maxHealth = health
        this.move_x = move_x
        this.move_y = move_y
        this.speed = speed
        this.score = 20
        this.damageHP = damage
        this.name = "spirit"+id
        this.leftFace = false
        this.hasDamage = false
        this.frameIdx = 1;
        this.lastTimeDraw = Date.now();
        this.lastPeaksDamage = Date.now();
        this.lastAttack = Date.now();
        this.lastStepSound = Date.now();
    }

    draw(ctx) {
        let side = (this.leftFace) ? "left" : "right";
        if(this.hasDamage){
            if(this.frameIdx%2 === 0) {
                this.spriteManager.drawSprite(ctx, side+"spirit"+this.frameIdx.toString(), this.pos_x, this.pos_y)
            }
        } else {
            this.spriteManager.drawSprite(ctx, side+"spirit"+this.frameIdx.toString(), this.pos_x, this.pos_y)
        }
        let now = Date.now();
        let dt = (now - this.lastTimeDraw) / 1000.0;
        if (dt > 0.3) {
            this.lastTimeDraw = now
            this.frameIdx = (this.frameIdx) % 5 + 1
        }
        this.spriteManager.drawHealth(ctx, this.pos_x, this.pos_y, this.size_x, this.size_y, this.health, this.maxHealth)
    }
    zeroMove(){
        this.move_x = 0
        this.move_y = 0
    }

    update(dt) {
        if(gameManager.player) {
            const distances = distance(gameManager.player, this)
            if (distances.d > 20 && distances.d < 400) {
                this.move_x = (distances.dx < -5) ? -1 : ((distances.dx > 5) ? 1 : 0)
                this.move_y = (distances.dy < -5) ? -1 : ((distances.dy > 5) ? 1 : 0)
            }

            if(this.move_x !== 0 || this.move_y !== 0){
                let now = Date.now()
                let dt = (now - this.lastStepSound)/1000.0;
                if(dt > 0.5){
                    gameManager.soundManager.playWithDist("../sounds/spirit.wav", this.pos_x, this.pos_y)
                    this.lastStepSound = now
                }
            }

            let entity = gameManager.player

            let inpx = 5

            let left = Math.max(entity.pos_x, this.pos_x + inpx);
            let bottom = Math.max(entity.pos_y, this.pos_y);
            let right = Math.min(entity.pos_x + entity.size_x, this.pos_x + this.size_x - inpx);
            let top = Math.min(entity.pos_y + entity.size_y, this.pos_y + this.size_y);

            let width = right - left;
            let height = top - bottom;
            if (width > 0 && height > 0) {
                let now = Date.now();
                let dt = (now - this.lastAttack) / 1000.0;
                if (dt > 0.8) {
                    this.lastAttack = now
                    entity.damage(this.damageHP)
                }
            }
        }
        this.physicManager.update(this, dt)
    }

    onTouchEntity(obj) {
        if (obj.name.match(/flame[\d*]/)) {
            if(obj.fromPlayer && (obj.pos_y + obj.size_y >= this.pos_y ||
                    obj.pos_y <= this.pos_y + this.size_y) &&
                ((this.pos_x <= obj.size_x+obj.pos_x && this.pos_x >= obj.pos_x) ||
                    (this.pos_x + this.size_x <= obj.size_x+obj.pos_x && this.pos_x + this.size_x >= obj.pos_x)
                )){
                this.damage(obj.damageHP)
                gameManager.kill(obj)
            }
        }
        this.checkHealth()
    }
    checkHealth(){
        if(this.health <= 0) {
            this.health = 1
            gameManager.player.score += this.score
            gameManager.kill(this)
        }
    }
    damage(dm){
        if(!this.hasDamage){
            console.log("I have dm!")
            console.log("My health before ", this.health)
            this.health -= dm
            console.log("My health after ", this.health)
            this.changeDamageFlag()
            setTimeout(this.changeDamageFlag.bind(this), 1000)
            this.checkHealth()
        }
    }
    changeDamageFlag(){
        this.hasDamage = (!this.hasDamage)
    }
    kill(gameManager) {
        gameManager.laterKill.push(this)
    }
}

class Boss extends Entity {
    constructor(x, y, w, h, damage = 10, health = 300, speed = 1, move_x = 0, move_y = 0) {
        super(x, y, w, h);
        this.health = health
        this.maxHealth = health
        this.move_x = move_x
        this.move_y = move_y
        this.speed = speed
        this.minSpeed = speed
        this.score = 200
        this.stage = 1
        this.damageHP = damage
        this.name = "boss"
        this.leftFace = false
        this.hasDamage = false
        this.isAttack = false
        this.isDead = false
        this.isSetWall = false
        this.frameIdx = 1;
        this.lastTimeDraw = Date.now();
        this.lastPeaksDamage = Date.now();
        this.lastAttack = Date.now();
        this.lastTimeSpeedUp = Date.now();
        this.lastStepSound = Date.now();
    }

    draw(ctx) {
        let side = (this.leftFace) ? "left" : "right";
        let wait = (this.move_x !== 0 || this.move_y !== 0) ? "step" : "wait";
        if(this.isAttack) wait = "step"
        else if(wait === "wait") side = ""
        if(this.isDead){
            this.spriteManager.drawSprite(ctx, "dieboss"+this.frameIdx.toString(), this.pos_x, this.pos_y)
            if(this.frameIdx === 4) gameManager.levelEnd = true
        } else if(this.hasDamage){
            if(this.frameIdx%2 === 0) {
                this.spriteManager.drawSprite(ctx, side+"boss"+wait+this.frameIdx.toString(), this.pos_x, this.pos_y)
            }
        } else {
            this.spriteManager.drawSprite(ctx, side+"boss"+wait+this.frameIdx.toString(), this.pos_x, this.pos_y)
        }
        let now = Date.now();
        let dt = (now - this.lastTimeDraw) / 1000.0;
        if (dt > 0.4) {
            this.lastTimeDraw = now
            this.frameIdx = (this.frameIdx) % 4 + 1
        }
        this.spriteManager.drawHealth(ctx, this.pos_x, this.pos_y, this.size_x, this.size_y, this.health, this.maxHealth)
    }
    zeroMove(){
        this.move_x = 0
        this.move_y = 0
    }

    update(dt) {
        let now = Date.now();
        if(gameManager.player && !this.isDead){
            const distances = distance(gameManager.player, this)
            if(distances.d > 20 && distances.d < 400){
                let dt = (now - this.lastTimeSpeedUp)/1000.0;
                if(dt > 3){
                    if(this.speed === this.minSpeed) {
                        this.speed = 9
                        gameManager.soundManager.playWithDist("../sounds/bossSpeedUp.wav", this.pos_x, this.pos_y)
                    } else {
                        this.speed = this.minSpeed
                        gameManager.soundManager.playWithDist("../sounds/boss.wav", this.pos_x, this.pos_y)
                    }
                    this.lastTimeSpeedUp = now
                    this.lastStepSound = now
                }
                if(!this.isSetWall){
                    gameManager.mapManager.setWall()
                    this.isSetWall = true
                }
                this.move_x = (distances.dx < -5) ? -1 : ((distances.dx > 5) ? 1 : 0)
                this.move_y = (distances.dy < -5) ? -1 : ((distances.dy > 5) ? 1 : 0)
            }

            let entity = gameManager.player
            let inpx = 5

            let left = Math.max(entity.pos_x, this.pos_x + inpx);
            let bottom = Math.max(entity.pos_y, this.pos_y);
            let right = Math.min(entity.pos_x + entity.size_x, this.pos_x + this.size_x - inpx);
            let top = Math.min(entity.pos_y + entity.size_y, this.pos_y + this.size_y);

            let width = right - left;
            let height = top - bottom;
            if (width > -5 && height > -5) {
                this.isAttack = true
                let dt = (now - this.lastAttack) / 1000.0;
                if (dt > 2) {
                    this.speed = this.minSpeed
                    this.lastAttack = now
                    this.lastTimeSpeedUp = now
                    entity.damage(this.damageHP)
                }
            } else this.isAttack = false
        }
        this.physicManager.update(this, dt)
    }

    onTouchEntity(obj) {
        if (obj.name.match(/flame[\d*]/)) {
            if(obj.fromPlayer && (obj.pos_y + obj.size_y >= this.pos_y ||
                    obj.pos_y <= this.pos_y + this.size_y) &&
                ((this.pos_x <= obj.size_x+obj.pos_x && this.pos_x >= obj.pos_x) ||
                    (this.pos_x + this.size_x <= obj.size_x+obj.pos_x && this.pos_x + this.size_x >= obj.pos_x)
                )){
                this.damage(obj.damageHP)
                gameManager.kill(obj)
            }
        }
        this.checkHealth()
    }
    checkHealth(){
        if(this.health <= 0.5*this.maxHealth && this.stage === 1) {
            this.stage++
            gameManager.createPeaksWhenBossFight()
        }
        if(this.health <= 0) {
            this.health = 1

            gameManager.soundManager.playWithDist("../sounds/bossDie.wav", this.pos_x, this.pos_y)
            gameManager.player.score += this.score
            this.isDead = true
            this.frameIdx = 1
            gameManager.removePeaksWhenBossFight()
            //gameManager.kill(this)
        }
    }
    damage(dm){
        if(!this.hasDamage){
            gameManager.soundManager.playWithDist("../sounds/hit.wav", this.pos_x, this.pos_y)
            this.health -= dm
            this.changeDamageFlag()
            setTimeout(this.changeDamageFlag.bind(this), 1000)
            this.checkHealth()
        }
    }
    changeDamageFlag(){
        this.hasDamage = (!this.hasDamage)
    }
    kill(gameManager) {
        gameManager.laterKill.push(this)
    }
}


class Flame extends Entity {
    constructor(x, y, w, h, damage = 40, speed = 4, id = "", move_x = 0, move_y = 0) {
        super(x, y, w, h);
        this.move_x = move_x
        this.move_y = move_y
        this.damageHP = damage
        this.speed = speed
        this.name = "flame" + id
        this.fromPlayer = false
        this.leftFace = (move_x <= 0);
        this.frameIdx = 1;
        this.lastTimeDraw = Date.now();
    }

    draw(ctx) {
        let side = (this.leftFace) ? "left" : "right";
        let player = (this.fromPlayer) ? "player" : "enemy";

        this.spriteManager.drawSprite(ctx, side+player+"flame"+this.frameIdx.toString(), this.pos_x, this.pos_y)
        let now = Date.now();
        let dt = (now - this.lastTimeDraw) / 1000.0;
        if (dt > 0.1) {
            this.lastTimeDraw = now
            this.frameIdx = (this.frameIdx) % 5 + 1
        }
    }
    update(dt) {
        this.physicManager.update(this, dt)
    }
    onTouchEntity(obj, gameManager) {
        if ((obj.name.match(/player/) && !this.fromPlayer) || obj.name.match(/enemy[\d*]/) ||
            obj.name.match(/spirit[\d*]/) || obj.name.match(/boss/)) {
            obj.onTouchEntity(this, gameManager)
        } else if(obj.name.match(/door/) && !obj.isOpen) this.kill(gameManager)
    }
    onTouchMap() {
        this.kill()
    }
    kill() {
        gameManager.kill(this)
    }
}

class Heal extends Entity {
    constructor(x, y, w, h, health = 10) {
        super(x, y, w, h);
        this.health = health
        this.name = "heal"
    }
    draw(ctx) {
        this.spriteManager.drawSprite(ctx, "heal", this.pos_x, this.pos_y)
    }
    kill(gameManager) {
        gameManager.kill(this)
    }
}

class DoorKey extends Entity {
    constructor(x, y, w, h, id = "") {
        super(x, y, w, h);
        this.name = "doorkey"+id
    }
    draw(ctx) {
        this.spriteManager.drawSprite(ctx, "doorkey", this.pos_x, this.pos_y)
    }
    kill(gameManager) {
        gameManager.kill(this)
    }
}

class ChestKey extends Entity {
    constructor(x, y, w, h, id = "") {
        super(x, y, w, h);
        this.name = "chestkey"+id
    }
    draw(ctx) {
        this.spriteManager.drawSprite(ctx, "chestkey", this.pos_x, this.pos_y)
    }
    kill(gameManager) {
        gameManager.kill(this)
    }
}

class Lights extends Entity {
    constructor(x, y, w, h, name = "candle") {
        super(x, y, w, h);
        if(["fronttorch","walltorch","candle"].indexOf(name) === -1) name = "candle"
        this.name = name
        this.frameIdx = 1;
        this.lastTimeDraw = Date.now();
    }

    draw(ctx) {
        this.spriteManager.drawSprite(ctx, this.name+this.frameIdx.toString(), this.pos_x, this.pos_y)
        let now = Date.now();
        let dt = (now - this.lastTimeDraw) / 1000.0;
        if (dt > 0.1) {
            this.lastTimeDraw = now
            this.frameIdx = (this.frameIdx) % 5 + 1
        }
    }
    kill(gameManager) {
        gameManager.kill(this)
    }
}

class Chest extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.isOpen = false
        this.frameIdx = 1;
        this.name = "chest"
        this.lastTimeDraw = Date.now();
    }
    draw(ctx) {
        if(this.isOpen && this.frameIdx <= 5){
            this.spriteManager.drawSprite(ctx, this.name+this.frameIdx.toString(), this.pos_x, this.pos_y)
            let now = Date.now();
            let dt = (now - this.lastTimeDraw) / 1000.0;
            if (dt > 0.1) {
                this.lastTimeDraw = now
                this.frameIdx++
            }
        } else {
            this.spriteManager.drawSprite(ctx, (this.isOpen) ? this.name+"5" : this.name+"1", this.pos_x, this.pos_y)
        }
    }
    open(){
        gameManager.soundManager.playWithDist("../sounds/chest.wav", this.pos_x, this.pos_y)
        this.isOpen = true
        let key = doorKeyFabric.create(this.pos_x-this.size_x,this.pos_y,this.size_x, this.size_y)
        gameManager.entities.push(key)
    }
    kill(gameManager) {
        gameManager.kill(this)
    }
}

class Door extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.isOpen = false
        this.frameIdx = 1;
        this.name = "door"
        this.lastTimeDraw = Date.now();
    }
    draw(ctx) {
        if(this.isOpen && this.frameIdx <= 5){
            this.spriteManager.drawSprite(ctx, this.name+this.frameIdx.toString(), this.pos_x, this.pos_y)
            let now = Date.now();
            let dt = (now - this.lastTimeDraw) / 1000.0;
            if (dt > 0.1) {
                this.lastTimeDraw = now
                this.frameIdx++
            }
        } else {
            this.spriteManager.drawSprite(ctx, (this.isOpen) ? this.name+"5" : this.name+"1", this.pos_x, this.pos_y)
        }
    }
    open(){
        gameManager.soundManager.playWithDist("../sounds/door.wav", this.pos_x, this.pos_y)
        this.isOpen = true
    }
    kill(gameManager) {
        gameManager.kill(this)
    }
}
class Peaks extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.frameIdx = 1;
        this.name = "peaks"
        this.lastTimeDraw = Date.now();
        this.lastTimeFrameDraw = Date.now();
        this.isActive = false
        this.isVertical = false
        this.damageHP = 40
    }
    update() {
        gameManager.entities.forEach((entity) => {
            let inpx = 5

            let left = Math.max(entity.pos_x, this.pos_x+inpx);
            let bottom = Math.max((!this.isVertical) ? entity.pos_y : entity.pos_y + entity.size_y*3/4, this.pos_y);
            let right = Math.min(entity.pos_x+entity.size_x, this.pos_x+this.size_x-inpx);
            let top = Math.min(entity.pos_y+entity.size_y, this.pos_y+this.size_y);

            let width = right - left;
            let height = top - bottom;
            if (width > 0 && height > 0)
                if(entity.damageFromPeaks) entity.damageFromPeaks(this)
        })
    }

    draw(ctx) {
        let now = Date.now();
        if(this.isActive){
            this.spriteManager.drawSprite(ctx, this.name+this.frameIdx.toString(), this.pos_x, this.pos_y)

            let dtf = (now - this.lastTimeFrameDraw) / 1000.0;
            if (dtf > 0.1) {
                this.lastTimeFrameDraw = now
                this.frameIdx = (this.frameIdx) % 4 + 1
                if(this.frameIdx === 1) this.isActive = false
            }
        } else {
            this.spriteManager.drawSprite(ctx, this.name+"1", this.pos_x, this.pos_y)
            let dt = (now - this.lastTimeDraw) / 1000.0;
            if(dt > 2 || (dt > 0.5 && this.isForBoss)){
                gameManager.soundManager.playWithDist("../sounds/peaks.wav", this.pos_x, this.pos_y)
                this.isActive = true
                this.lastTimeDraw = now
            }
        }
    }
    kill(gameManager) {
        gameManager.kill(this)
    }
}

export default {Player: Player, Ded: Ded, Flame: Flame, Heal: Heal, Spirit: Spirit,
                Chest: Chest, ChestKey: ChestKey, Door: Door, DoorKey: DoorKey,
                Lights: Lights, Peaks: Peaks, Exit: Exit, Boss: Boss}