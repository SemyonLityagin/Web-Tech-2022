const canvas = document.querySelector("canvas");
const context = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;

document.addEventListener('keydown', event => {
    switch (event.keyCode){
        case 13:
            document.location.replace('username.html');
            break;
    }
});

context.fillStyle = '#0f8';
context.font = '18px "Press Start 2P"';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText('Table of Records', width/2, 20);
context.font = '12px "Press Start 2P"';

const records = JSON.parse(localStorage.getItem('records'));

if(records){
    for (let i = 0; i < records.length; i++) {
        context.fillText(`${i+1}. ${records[i][0]} has score ${records[i][1]}`, width/2, 40+i*20);
    }
    context.fillText(`ENTER to game again`, width/2, 40+20*records.length+48);
} else {
    context.font = '18px "Press Start 2P"';
    context.fillText(`No results`, width/2, height/2);
    context.fillText(`ENTER to game again`, width/2, height/2 + 48);
}
