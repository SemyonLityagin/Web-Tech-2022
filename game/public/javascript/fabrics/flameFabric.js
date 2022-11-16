import objects from "../objects.js"

export default class FlameFabric {
    constructor(damage = 40, speed = 15) {
        this.damage = damage;
        this.speed = speed;
        this.id = 0;
    }
    create(x = 0,
                 y = 0,
                 w= 34,
                 h = 34, move_x = 0, move_y = 0){
        this.id++;
        return new objects.Flame(x, y, w, h, this.damage, this.speed, this.id.toString(), move_x, move_y);
    }
}