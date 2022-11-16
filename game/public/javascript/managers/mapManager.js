let instance = null;

class MapManager{
    constructor() {
        if(!instance) {
            instance = this;
            instance.init()
        }
        return instance;
    }

    init(){
        instance.mapData = null;
        instance.tLayer = [];
        instance.xCount = 0;
        instance.yCount = 0;
        instance.tSize = {x: 30, y: 20};
        instance.mapSize = {x: 64, y: 64};
        instance.tilesets = [];
        instance.view = {x: 0, y: 0, w: 800, h: 600};

        instance.imgLoadCount = 0;
        instance.imgLoaded = false;
        instance.jsonLoaded = false;
    }

    loadMap(path) {
        let request = new XMLHttpRequest();
        request.onreadystatechange = () => {
            if (request.readyState === 4 && request.status === 200) {
                instance.parseMap(request.responseText);
            }
        };
        request.open("GET", path, true);
        request.send();
    }
    parseMap(tilesJSON) {
        instance.mapData = JSON.parse(tilesJSON);
        instance.xCount = instance.mapData.width;
        instance.yCount = instance.mapData.height;
        instance.tSize.x = instance.mapData.tilewidth;
        instance.tSize.y = instance.mapData.tileheight;
        instance.mapSize.x = instance.xCount * this.tSize.x;
        instance.mapSize.y = instance.yCount * this.tSize.y;
        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            let img = new Image();
            img.onload = () => {
                instance.imgLoadCount++;
                if (instance.imgLoadCount === instance.mapData.tilesets.length) {
                    instance.imgLoaded = true;
                }
            };
            img.src = instance.mapData.tilesets[i].image;
            let t = instance.mapData.tilesets[i];
            let ts = {
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / this.tSize.x),
                yCount: Math.floor(t.imageheight / this.tSize.y)
            };
            instance.tilesets.push(ts);
        }
        instance.jsonLoaded = true;
    }
    parseEntities(gameManager) {
        if (!instance.imgLoaded || !instance.jsonLoaded) {
            setTimeout(() => {
                instance.parseEntities(gameManager);
            }, 100)
        } else {
            const lenght = instance.mapData.layers.length
            for (let j = 0; j < lenght; j++) {
                if (instance.mapData.layers[j].type === "objectgroup"){
                    let entities =instance.mapData.layers[j];
                    for (let i = 0; i < entities.objects.length; i++) {
                        let e = entities.objects[i];
                        try {
                            let obj = null;
                            if(["fronttorch", "walltorch","candle"].indexOf(e.class) !== -1) {
                                obj = gameManager.factory["lights"].create(e.x, e.y, e.width, e.height, e.class);
                            } else {
                                obj = gameManager.factory[e.class].create(e.x, e.y, e.width, e.height);
                            }
                            if(e.properties){
                                for (const prop of e.properties) {
                                    if(prop.name === "isVertical") obj.isVertical = prop.value
                                }
                            }

                            if(obj.name === "player"){
                                if(gameManager.lastPlayer !== null){
                                    console.log("yap!")
                                    gameManager.lastPlayer.pos_x = obj.pos_x
                                    gameManager.lastPlayer.pos_y = obj.pos_y
                                    gameManager.initPlayer(gameManager.lastPlayer)
                                    gameManager.lastPlayer = null
                                    gameManager.entities.push(gameManager.player);
                                } else {
                                    gameManager.initPlayer(obj);
                                    gameManager.entities.push(obj);
                                }
                            } else {
                                gameManager.entities.push(obj);
                            }
                        } catch (ex){
                            console.log("Error while creating [" + e.gid + "]" + e.class + ", " + ex);
                        }
                    }
                }
            }
            return null;
        }
    }
    drawFront(ctx) {
        if (!instance.imgLoaded || !instance.jsonLoaded) {
            setTimeout(() => {
                instance.drawFront(ctx);
            }, 100)
        } else {
            if (instance.tLayer.length === 0) {
                for (let i = 0; i < instance.mapData.layers.length; i++) {
                    let layer = instance.mapData.layers[i];
                    if (layer.type === "tilelayer") {
                        instance.tLayer.push(layer);
                    }
                }
            }
            const idx = instance.tLayer.findIndex(tLayer => tLayer.name === "front_walls")
            if(idx !== -1) {
                const tLayer = instance.tLayer[idx]
                for (let i = 0; i < tLayer.data.length; i++) {
                    if (tLayer.data[i] !== 0) {
                        let tile = instance.getTile(tLayer.data[i]);
                        let pX = (i % instance.xCount) * instance.tSize.x;
                        let pY = Math.floor(i / instance.xCount) * instance.tSize.y;
                        if (!instance.isVisible(pX, pY, instance.tSize.x, instance.tSize.y)){
                            continue;
                        }

                        pX -= instance.view.x;
                        pY -= instance.view.y;
                        ctx.drawImage(tile.img, tile.px, tile.py, instance.tSize.x, instance.tSize.y, pX, pY, instance.tSize.x, instance.tSize.y);
                    }
                }
            }
        }
    }
    drawBack(ctx) {
        if (!instance.imgLoaded || !instance.jsonLoaded) {
            setTimeout(() => {
                instance.drawBack(ctx);
            }, 100)
        } else {
            if (instance.tLayer.length === 0) {
                for (let i = 0; i < instance.mapData.layers.length; i++) {
                    let layer = instance.mapData.layers[i];
                    if (layer.type === "tilelayer") {
                        instance.tLayer.push(layer);
                    }
                }
            }
            // ctx.clearRect(0, 0, instance.view.w, instance.view.h);
            for (const tLayer of instance.tLayer) {
                if(tLayer.name === "front_walls") {
                    continue;
                }
                for (let i = 0; i < tLayer.data.length; i++) {
                    if (tLayer.data[i] !== 0) {
                        let tile = instance.getTile(tLayer.data[i]);
                        let pX = (i % instance.xCount) * instance.tSize.x;
                        let pY = Math.floor(i / instance.xCount) * instance.tSize.y;
                        if (!instance.isVisible(pX, pY, instance.tSize.x, instance.tSize.y)){
                            // console.log(pX, pY, instance.tSize.x, instance.tSize.y)
                            continue;
                        }
                        // console.log(pX, pY, instance.tSize.x, instance.tSize.y)
                        pX -= instance.view.x;
                        pY -= instance.view.y;
                        // console.log("PXPY")
                        // console.log(pX, pY)
                        ctx.drawImage(tile.img, tile.px, tile.py, instance.tSize.x, instance.tSize.y, pX, pY, instance.tSize.x, instance.tSize.y);
                    }
                }
            }
        }
    }
    isVisible(x, y, w, h) {
        return !(x + w < instance.view.x || y + h < instance.view.y ||
            x - instance.view.x > instance.view.w || y - instance.view.y > instance.view.h);
    }
    getTile(tileIndex) {
        let tile = {
            img: null,
            px: 0, py: 0
        };
        let tileset = instance.getTileset(tileIndex);
        tile.img = tileset.image;
        let id = tileIndex - tileset.firstgid;
        let x = id % tileset.xCount;
        let y = Math.floor(id / tileset.yCount);
        tile.px = x * instance.tSize.x;
        tile.py = y * instance.tSize.y;
        return tile;
    }
    getTileset(tileIndex) {
        for (let i = instance.tilesets.length - 1; i >= 0; i--) {
            if (instance.tilesets[i].firstgid <= tileIndex) {
                return instance.tilesets[i];
            }
        }
        return null;
    }

    //некое Idx
    getTilesetIdx(x,y){
        let wX = x;
        let wY = y;
        let idx = Math.floor(wY/instance.tSize.y) * instance.xCount + Math.floor(wX/instance.tSize.x);
        return instance.tLayer[0].data[idx];
    }

    setWall(){
        const levelInfo = gameManager.levels[gameManager.level]
        if(levelInfo.wallsWhenBossFight){
            for (const wall of levelInfo.wallsWhenBossFight) {
                instance.setWallOnIdx(wall.x, wall.y)
            }
        }
    }
    setWallOnIdx(x, y){
        let wX = x;
        let wY = y;
        let idx = Math.floor(wY/instance.tSize.y) * instance.xCount + Math.floor(wX/instance.tSize.x);
        instance.tLayer[0].data[idx] = 2;

    }

    //для центрирования карты относительно игрока
    centerAt(x,y){
        if(x < instance.view.w / 2) {
            instance.view.x = 0;
        } else if(x > instance.mapSize.x - instance.view.w/2){
            instance.view.x = instance.mapSize.x - instance.view.w;
        } else {
            instance.view.x = x - instance.view.w / 2;
        }

        if(y < instance.view.h / 2) {
            instance.view.y = 0;
        } else if(y > instance.mapSize.y - instance.view.h/2){
            instance.view.y = instance.mapSize.y - instance.view.h;
        } else {
            instance.view.y = y - instance.view.h / 2;
        }
    }
}

export default MapManager;
