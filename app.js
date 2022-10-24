import express from 'express'
import routes1 from './routes/routes.js'
import routes2 from './routes/editRoutes.js'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
const server = express();

server.set("view engine", "pug")
server.use(express.json());       // to support JSON-encoded bodies
server.use(express.urlencoded()); // to support URL-encoded bodies
// server.use(express.static(path.join(__dirname, 'public')));
server.use(express.static('public'))
server.use('/editBook', routes2)
server.use('/', routes1)
server.use(logger('dev'));
server.use(cookieParser())
server.listen(3000)