export default class View {
    static colors = {
        '1': 'red',
        '2': 'cyan',
        '3': 'blue',
        '4': 'purple',
        '5': 'orange',
        '6': 'green',
        '7': 'yellow'
    }
    cols = 12;
    rows = 20;

    constructor() {
        this.canvasPlayField = document.querySelector('#playfield');
        this.contextPlayField = this.canvasPlayField.getContext('2d');

        this.playfieldBorderWidth = 4;
        this.playfieldX = this.playfieldBorderWidth;
        this.playfieldY = this.playfieldBorderWidth;
        this.playfieldWidth = this.canvasPlayField.width;
        this.playfieldHeight = this.canvasPlayField.height;
        this.playfieldWithoutBorderW = this.playfieldWidth - this.playfieldBorderWidth*2;
        this.playfieldWithoutBorderH = this.playfieldHeight - this.playfieldBorderWidth*2;

        console.log(this.playfieldWidth)
        console.log(this.playfieldHeight)

        this.cellWidth = this.playfieldWithoutBorderW/this.cols;
        this.cellHeight = this.playfieldWithoutBorderH/this.rows;

        this.canvasPanel = document.querySelector('#panel');
        this.contextPanel = this.canvasPanel.getContext('2d');
        this.panelX = 0;
        this.panelY = 0;
        this.panelWidth = this.canvasPanel.width;
        this.panelHeight = this.canvasPanel.height;
        console.log(this.panelWidth)
        console.log(this.panelHeight)
    }

    renderGame(state){
        this.clearScene();
        this.renderPlayField(state);
        this.renderPanel(state);
    }

    contextSettingsOne(){
        this.contextPanel.fillStyle = '#0fa';
        this.contextPanel.font = '18px "Press Start 2P"';
        this.contextPanel.textAlign = 'center';
        this.contextPanel.textBaseline = 'middle';
        this.contextPlayField.fillStyle = '#0fa';
        this.contextPlayField.font = '18px "Press Start 2P"';
        this.contextPlayField.textAlign = 'center';
        this.contextPlayField.textBaseline = 'middle';
    }
    contextSettingsTwo(){
        this.contextPanel.textAlign = 'start';
        this.contextPanel.textBaseline = 'top';
        this.contextPanel.fillStyle = '#0fa';
        this.contextPanel.font = '14px "Press Start 2P"';
    }

    renderGameOver({score}){
        this.clearScene()
        this.contextSettingsOne();
        this.contextPlayField.fillText('GAME OVER', this.playfieldWidth/2, this.playfieldHeight/2 - 96);
        this.contextPlayField.fillText(`Nick: ${localStorage.getItem('username')}`, this.playfieldWidth/2, this.playfieldHeight/2-48);
        this.contextPlayField.fillText(`Score: ${score}`, this.playfieldWidth/2, this.playfieldHeight/2);
        this.contextPlayField.fillText('press ENTER', this.playfieldWidth/2, this.playfieldHeight/2+48);
        this.contextPlayField.fillText('to see', this.playfieldWidth/2, this.playfieldHeight/2+96);
        this.contextPlayField.fillText('Records', this.playfieldWidth/2, this.playfieldHeight/2+144);
    }

    renderPlayField({playfield}){
        this.contextSettingsOne()
        for (let y = 0; y < playfield.length; y++) {
            for (let x = 0; x < playfield[y].length; x++) {
                if(playfield[y][x]){
                    this.renderCell(
                        this.playfieldX + x*this.cellWidth,
                        this.playfieldY + y*this.cellHeight,
                        this.cellWidth,
                        this.cellHeight,
                        View.colors[playfield[y][x]],
                        true);
                }
            }
        }

        this.contextPlayField.strokeStyle = '#0f8';
        this.contextPlayField.lineWidth = this.playfieldBorderWidth;
        this.contextPlayField.strokeRect(0,0,this.playfieldWidth, this.playfieldHeight)
    }

    renderPanel({level, score, lines, nextFigure}){
        this.contextSettingsTwo()

        this.contextPanel.fillText(`Next:`, this.panelX, this.panelY+4)
        for (let y = 0; y < nextFigure.blocks.length; y++) {
            for (let x = 0; x < nextFigure.blocks[y].length; x++) {
                if(nextFigure.blocks[y][x]){
                    this.renderCell(
                        this.panelX + x*this.cellWidth*0.5,
                        this.panelY + 14 + y*this.cellHeight*0.5,
                        this.cellWidth*0.5,
                        this.cellHeight*0.5,
                        View.colors[nextFigure.blocks[y][x]],
                        false
                    )
                }
            }
        }

        this.contextSettingsTwo()
        this.contextPanel.fillText(`Nick: ${localStorage.getItem('username')}`, this.panelX, this.panelY+100)
        this.contextPanel.fillText(`Level: ${level}`, this.panelX, this.panelY+124)
        this.contextPanel.fillText(`Score: ${score}`, this.panelX, this.panelY+148)
        this.contextPanel.fillText(`Lines: ${lines}`, this.panelX, this.panelY+172)

    }

    renderCell(x, y, width, height, color, flagPlayField){
        const context = flagPlayField ? this.contextPlayField : this.contextPanel;
        const gradient = flagPlayField ? context.createLinearGradient(0, 0, this.playfieldWidth, this.playfieldHeight)
                                            : context.createLinearGradient(0, 0, this.panelWidth, this.panelHeight);
        gradient.addColorStop(0, flagPlayField ? '#0fa' : color);
        gradient.addColorStop(1, flagPlayField ? color: '#0fa');

        context.fillStyle = gradient
        context.fillRect(x+2, y+2, width-2, height-2);
        context.strokeStyle = 'rgba(255,255,255,0.25)';
        context.fillRect(x+2, y+2, width-2, height-2);
        context.strokeStyle = 'rgba(255,255,255,0.5)';
        context.fillRect(x+2, y+2, width-2, height-2);
    }

    clearScene(){
        this.contextPlayField.clearRect(0, 0, this.playfieldWidth, this.playfieldHeight);
        this.contextPanel.clearRect(0, 0, this.panelWidth, this.panelHeight);
    }
}