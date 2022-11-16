import objects from "../objects.js"

export default class HealFabric {
    constructor(health = 20) {
        this.health = health;
    }
    create(x = 0,
                 y = 0,
                 w= 40,
                 h = 44){
        return new objects.Heal(x, y, w, h, this.health);
    }
}