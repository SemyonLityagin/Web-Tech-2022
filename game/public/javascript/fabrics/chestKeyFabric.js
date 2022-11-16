import objects from "../objects.js"

export default class ChestKeyFabric {
    constructor() {
        this.id = 0
    }
    create(x = 0,
           y = 0,
           w= 44,
           h = 32){
        return new objects.ChestKey(x, y, w, h, (this.id++).toString());
    }
}