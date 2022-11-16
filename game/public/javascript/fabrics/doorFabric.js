import objects from "../objects.js"

export default class DoorFabric {
    create(x = 0,
           y = 0,
           w= 128,
           h = 64){
        return new objects.Door(x, y, w, h);
    }
}