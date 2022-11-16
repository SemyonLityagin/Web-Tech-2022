import MapManager from "./mapManager.js";

let instance = null;

class SpriteManager{
    constructor() {
        if(!instance){
            instance = this
            instance.init()
        }
        return instance
    }

    init(){
        instance.image = new Image();
        instance.sprites = [];
        instance.imgLoaded = false;
        instance.jsonLoaded = false;
        instance.mapManager = new MapManager();
    }

    loadAtlas(atlasJSON, imgName) {
        let request = new XMLHttpRequest();

        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                instance.parseAtlas(request.responseText);
            }
        }
        request.open("GET", atlasJSON, true);
        request.send();
        instance.loadImage(imgName);
    }
    loadImage(imgName) {
        instance.image.onload = () => {
            instance.imgLoaded = true;
        }
        console.log(this, imgName);
        instance.image.src = imgName;
    }
    parseAtlas(atlasJSON) {
        let atlas = JSON.parse(atlasJSON);
        for (const name in atlas.frames) {
            let frame = atlas.frames[name].frame;
            instance.sprites.push({name: name, x: frame.x, y: frame.y, w: frame.w, h: frame.h});
        }
        instance.jsonLoaded = true;
    }
    drawSprite(ctx, name, x, y,) {
        if (!instance.imgLoaded || !instance.jsonLoaded) {
            setTimeout(() => {
                instance.drawSprite(ctx, name, x, y);
            }, 100);
        } else {
            let sprite = instance.getSprite(name);
            if (!instance.mapManager.isVisible(x, y, sprite.w, sprite.h)) {
                return;
            }
            x -= instance.mapManager.view.x;
            y -= instance.mapManager.view.y;
            ctx.drawImage(instance.image, sprite.x, sprite.y, sprite.w, sprite.h, x, y, sprite.w, sprite.h);
        }
    }
    drawHealth(ctx, x, y, w, h, health, maxHealth) {
        if (!instance.imgLoaded || !instance.jsonLoaded) {
            setTimeout(() => {
                instance.drawSprite(ctx, name, x, y);
            }, 100);
        } else {
            if (!instance.mapManager.isVisible(x, y, w, h)) {
                return;
            }
            x -= instance.mapManager.view.x;
            y -= instance.mapManager.view.y;
            ctx.fillStyle = "black";
            ctx.fillRect((x+w/2)-22, y - 7, 44, 7)
            ctx.fillStyle = "brown";
            ctx.fillRect((x+w/2)-20, y - 5, 40*health/maxHealth, 3)
        }
    }
    getSprite(name) {
        for (let i = 0; i < instance.sprites.length; i++) {
            let sprite = instance.sprites[i];
            if (sprite.name === name) {
                return sprite;
            }
        }
        return null;
    }
}

export default SpriteManager;