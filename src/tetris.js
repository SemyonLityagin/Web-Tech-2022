export default class Tetris {
    static points = {
        '1': 100,
        '2': 300,
        '3': 700,
        '4': 1500
    }

    get level(){
        return Math.floor(this.lines*0.1);
    }

    constructor() {
        this.score = 0;
        this.lines = 0;
        this.gameOver = false;
        this.playfield = this.createPlayfield();
        this.nextFigure = this.createFigure();
        this.currentFigure = this.createFigure()
    }

    createPlayfield(){
        const playfield = new Array(20);
        for(let i = 0; i < 20; i++){
            playfield[i] = new Array(12).fill(0);
        }
        return playfield
    }

    createFigure(){
        const type = Math.floor(Math.random()*7);
        const newFigure = { }

        if(type === 0) {
            newFigure.blocks = [
                [0, 0, 0, 0],
                [1, 1, 1, 1],
                [0, 0, 0, 0],
                [0, 0, 0, 0],
            ];
        } else if(type === 1) {
            newFigure.blocks = [
                [0, 0, 0],
                [2, 2, 2],
                [0, 0, 2]
            ];
        } else if (type === 2) {
            newFigure.blocks = [
                [0, 0, 0],
                [3, 3, 3],
                [3, 0, 0]
            ];
        } else if (type === 3) {
            newFigure.blocks = [
                [0, 0, 0],
                [0, 4, 4],
                [0, 4, 4]
            ];
        } else if (type === 4) {
            newFigure.blocks = [
                [0, 0, 0],
                [0, 5, 5],
                [5, 5, 0]
            ];
        } else if (type === 5) {
            newFigure.blocks = [
                [0, 0, 0],
                [6, 6, 6],
                [0, 6, 0]
            ];
        } else if (type === 6) {
            newFigure.blocks = [
                [0,0,0],
                [7,7,0],
                [0,7,7]
            ];
        }

        newFigure.x = Math.floor((10-newFigure.blocks[0].length)/2)
        newFigure.y = -3;
        return newFigure
    }

    clearLines(){
        const rows = 20;
        const cols = 12;
        let lines = [];

        for (let y = rows -1; y >= 0; y--) {
            if(!this.playfield[y].includes(0)){
                lines.unshift(y);
            }
        }
        for (let index of lines){
            this.playfield.splice(index,1);
            this.playfield.unshift(new Array(cols).fill(0))
        }
        return lines.length;
    }

    updateScore(lines){
        if(lines > 0){
            this.score += Tetris.points[lines] * (this.level + 1);
            this.lines += lines;
        }
    }


    rotate(){
        const blocks = this.currentFigure.blocks;
        const length = blocks.length;
        const temp = structuredClone(blocks)

        for(let y = 0; y < length; y++){
            for(let x = 0; x < length; x++){
                temp[x][y] = blocks[length-y-1][x];
            }
        }

        this.currentFigure.blocks = temp;

        if(this.hasCollision()) this.currentFigure.blocks = blocks;
    }

    getState(){
        const playfield = structuredClone(this.playfield)
        const {x: figureX, y: figureY, blocks} = this.currentFigure;

        for (let y = 0; y < blocks.length; y++) {
            for (let x = 0; x < blocks[y].length; x++) {
                if(blocks[y][x] && figureY+y >= 0){
                    playfield[figureY+y][figureX+x] = blocks[y][x];
                }
            }
        }
        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            nextFigure: this.nextFigure,
            playfield,
            isGameOver: this.gameOver
        };
    }

    moveLeft(){
        this.currentFigure.x -= 1;
        if(this.hasCollision()){
            this.currentFigure.x += 1;
        }
    }

    moveRight(){
        this.currentFigure.x += 1;
        if(this.hasCollision()){
            this.currentFigure.x -= 1;
        }
    }

    moveDown(){
        if(this.gameOver) return false;

        this.currentFigure.y += 1;
        if(this.hasCollision()){
            this.currentFigure.y -= 1;
            this.fixFigure();
            this.newFigures();
            this.updateScore(this.clearLines());
            return false;
        }
        return true;
    }

    moveFastDown(){
        while(this.moveDown()){}
    }

    hasCollision(){
        const {x: figureX, y: figureY, blocks} = this.currentFigure;
        for(let y = 0; y < blocks.length; y++){
            for(let x = 0; x < blocks[y].length; x++){
                //blocks[y][x] - > шобы проверить, что там есть единица в blocks, а мы не вышли за границу просто так по x y
                //хрень в скобках - выход за границу
                // хрень последняя в условии - коллизия снизу
                if(blocks[y][x] && (figureY+y >= 0 || figureX+x > 11 || figureX+x < 0 ) &&
                    ((this.playfield[figureY+y] === undefined || this.playfield[figureY+y][figureX+x] === undefined)
                        || this.playfield[figureY+y][figureX+x])){
                    return true
                }
            }
        }
        return false
    }

    fixFigure(){
        const {x: figureX, y: figureY, blocks} = this.currentFigure;
        for(let y = 0; y < blocks.length; y++){
            for(let x = 0; x < blocks[y].length; x++){
                //шоб за границу корзины не выйти
                if(figureY+y < 0 && blocks[y][x]) {
                    this.gameOver = true;
                }
                if(blocks[y][x] && figureY+y >= 0){
                    this.playfield[figureY+y][figureX+x] = blocks[y][x];
                }
            }
        }
    }

    newFigures(){
        this.currentFigure = this.nextFigure;
        this.nextFigure = this.createFigure();
    }
}