import objects from "../objects.js"

export default class PeaksFabric {
    create(x = 0,
           y = 0,
           w= 64,
           h = 64){
        return new objects.Peaks(x, y, w, h);
    }
}