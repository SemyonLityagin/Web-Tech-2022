import objects from "../objects.js"

export default class LightsFabric {
    create(x = 0,
           y = 0,
           w= 64,
           h = 64, name = "candle"){
        return new objects.Lights(x, y, w, h, name);
    }
}