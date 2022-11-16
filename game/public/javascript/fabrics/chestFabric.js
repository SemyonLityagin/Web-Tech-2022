import objects from "../objects.js"

export default class ChestFabric {
    create(x = 0,
           y = 0,
           w= 64,
           h = 64){
        return new objects.Chest(x, y, w, h);
    }
}