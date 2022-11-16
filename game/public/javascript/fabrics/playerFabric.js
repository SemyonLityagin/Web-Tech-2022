import objects from "../objects.js"

export default class PlayerFabric {
    constructor(health = 100, speed = 10) {
        this.health = health;
        this.speed = speed;
    }
    create(x = 0,
                 y = 0,
                 w= 64,
                 h = 64){
        return new objects.Player(x, y, w, h, this.health, this.speed);
    }
}