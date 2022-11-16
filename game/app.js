import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import http from 'http'
import indexRouter from './routes/game.js'

const app = express();

// view engine setup
app.set('views', "./views");
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('./public'));

app.use('/', indexRouter);

/**
 * Create HTTP/s server.
 */

const httpServer = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
httpServer.listen(3000);

