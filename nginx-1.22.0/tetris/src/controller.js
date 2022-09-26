export default class Controller {
    constructor(tetris, view) {
        this.tetris = tetris;
        this.view = view;
        this.intervalId = null;
        document.addEventListener('keydown', event => {
            const state = this.tetris.getState();

            switch (event.keyCode){
                case 65: //A left
                    this.tetris.moveLeft();
                    this.render();
                    break;
                case 83: //S down
                    this.stopTimer()
                    this.tetris.moveDown();
                    this.render();
                    break;
                case 68: //D right
                    this.tetris.moveRight();
                    this.render();
                    break;
                case 69: //E rotate
                    this.tetris.rotate();
                    this.render();
                    break;
                case 70: //F fastDown
                    this.tetris.moveFastDown();
                    this.render();

                    break;
                case 13: //Enter
                    if(state.isGameOver){
                        this.addRecords(state);
                        document.location.replace('records.html');
                    }
                    break;
            }
        });
        document.addEventListener('keyup', event => {
            switch (event.keyCode){
                case 83:
                    this.startTimer()
                    break;
            }
        });
        this.view.renderGame(this.tetris.getState())
        this.startTimer();
    }

    stopTimer(){
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    startTimer(){
        const level = this.tetris.getState().level;
        const speed = 1000*Math.pow(0.8-((level-1)*0.007),(level-1))

        this.intervalId = setInterval(() => {
            this.tetris.moveDown();
            this.render();
        }, speed >= 0.01 ? speed : 100);

    }

    addRecords(state){
        let records = JSON.parse(localStorage.getItem('records'));
        if(records == null) records = [];
        records.push([localStorage.getItem('username'), state.score]);
        records.sort((function(index){
            return function(a, b){
                return (a[index] === b[index] ? 0 : (a[index] > b[index] ? -1 : 1));
            };
        })(1));
        if(records.length > 10){
            records = records.slice(0,9);
        }
        localStorage.setItem('records', JSON.stringify(records));
    }

    render(){
        const state = this.tetris.getState();
        if(state.isGameOver) {
            this.view.renderGameOver(state)
        } else {
            this.view.renderGame(state)
        }
    }

}