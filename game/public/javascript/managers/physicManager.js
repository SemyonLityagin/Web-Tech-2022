import MapManager from "./mapManager.js";
import gameManager from "./gameManager.js";

let instance = null;
class PhysicManager{
    constructor() {
        if(!instance) {
            instance = this;
            instance.walls = [0,78,1,2,3,4,5,10,15,20,25,30,35,40,41,42,43,44,45,50,51,52,53,54,55]
            instance.mapManager = new MapManager();
        }
        return instance;
    }
    update(obj, dt) {
        if (obj.move_x === 0 && obj.move_y === 0)
            return "stop";

        if(obj.name === "player" || obj.name.match(/enemy[\d*]/) || obj.name.match(/spirit[\d*]/) ||obj.name.match(/boss/)) {
            obj.leftFace = obj.move_x === -1 || obj.move_x === 0 ;
        }

        if(dt > 2) dt = 1/30
        let dx = obj.move_x*obj.speed*dt*10
        let dy = obj.move_y*obj.speed*dt*10
        if(dx > 0) dx += 1
        if(dy > 0) dy += 1
        let newX = obj.pos_x + Math.floor(dx);
        let newY = obj.pos_y + Math.floor(dy);
        let tryingCoords = [{newX: newX, newY: newY, id: 1},{newX: obj.pos_x, newY: newY, id: 2},{newX: newX, newY: obj.pos_y, id: 3}];
        for (const newCoord of tryingCoords) {
            let ts = instance.mapManager.getTilesetIdx(newCoord.newX + 5, newCoord.newY + obj.size_y/2);
            let tsy = instance.mapManager.getTilesetIdx(newCoord.newX + obj.size_x - 5, newCoord.newY + obj.size_y/2);


            let e = instance.entityAtXY(obj, newCoord.newX, newCoord.newY);
            if (e !== null && obj.onTouchEntity) {
                obj.onTouchEntity(e);
            }
            if ((e !== null && (e.name !== "door" ? 1 : (e.isOpen))) || e === null){
                if(instance.walls.indexOf(ts-1) === -1 && instance.walls.indexOf(tsy-1) === -1) {
                    obj.pos_x = newCoord.newX;
                    obj.pos_y = newCoord.newY;
                    break
                }
                if(obj.onTouchMap) {
                    obj.onTouchMap();
                }
            }
        }
    }
    entityAtXY(obj, x, y) {
        for (let i = 0; i < gameManager.entities.length; i++) {
            let e = gameManager.entities[i]
            if(e.name !== obj.name) {
                if(x + obj.size_x < e.pos_x ||
                    y + obj.size_y < e.pos_y ||
                    x > e.pos_x + e.size_x ||
                    y > e.pos_y + e.size_y) {
                    continue;
                } else {
                    return e;
                }
            }
        }
        return null
    }
}

export default PhysicManager