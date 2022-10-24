import Tetris from './tetris.js'
import View from './view.js'
import Controller from './controller.js'

const tetris = new Tetris();
const view = new View();
const controller = new Controller(tetris, view);

