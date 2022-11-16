import objects from "../objects.js"

export default class BossFabric {
    constructor(damage = 20,health = 400, speed = 5) {
        this.health = health;
        this.damageHP = damage;
        this.speed = speed;
    }
    create(x = 0,
           y = 0,
           w= 64,
           h = 64){
        return new objects.Boss(x, y, w, h, this.damageHP, this.health, this.speed);
    }
}