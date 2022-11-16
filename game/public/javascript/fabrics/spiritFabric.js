import objects from "../objects.js"

export default class SpiritFabric {
    constructor(damage = 5,health = 50, speed = 9) {
        this.health = health;
        this.damageHP = damage;
        this.speed = speed;
        this.id = 0;
    }
    create(x = 0,
                 y = 0,
                 w= 44,
                 h = 52){
        return new objects.Spirit(x, y, w, h, this.damageHP, this.health, this.speed, this.id.toString());
    }
}