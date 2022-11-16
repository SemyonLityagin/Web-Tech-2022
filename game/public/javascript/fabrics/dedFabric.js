import objects from "../objects.js"

export default class DedFabric {
    constructor(health = 100, speed = 5) {
        this.health = health;
        this.speed = speed;
        this.id = 0;
    }
    create(x = 0,
                 y = 0,
                 w= 64,
                 h = 64){
        return new objects.Ded(x, y, w, h, this.health, this.speed, this.id.toString());
    }
}