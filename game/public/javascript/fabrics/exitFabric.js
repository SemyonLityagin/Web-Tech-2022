import objects from "../objects.js"

export default class ExitFabric {
    create(x = 0,
           y = 0,
           w= 64,
           h = 64){
        return new objects.Exit(x, y, w, h);
    }
}