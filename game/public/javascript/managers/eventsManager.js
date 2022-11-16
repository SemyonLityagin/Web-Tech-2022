let instance = null;

class EventsManager{
    constructor() {
        if(!instance) {
            instance = this;
            instance.bind = [];
            instance.action = [];
        }
        return instance;
    }
    setup(canvas){
        instance.bind[87] = 'up';    //w
        instance.bind[65] = 'left';  //a
        instance.bind[83] = 'down';  //s
        instance.bind[68] = 'right'; //d
        instance.bind[32] = 'fire';  //space

        canvas.addEventListener("mousedown", instance.onMouseDown);
        canvas.addEventListener("mouseup", instance.onMouseUp);

        document.body.addEventListener("keydown", instance.onKeyDown);
        document.body.addEventListener("keyup", instance.onKeyUp);
    }
    onMouseDown(event){
        instance.action["fire"] = true;
    }
    onMouseUp(event){
        instance.action["fire"] = false;
    }
    onKeyDown(event){
        let action = instance.bind[event.keyCode];
        if(action) {
            instance.action[action] = true;
        }
    }
    onKeyUp(event){
        let action = instance.bind[event.keyCode];
        if(action) {
            instance.action[action] = false;
        }
    }
}

export default EventsManager;