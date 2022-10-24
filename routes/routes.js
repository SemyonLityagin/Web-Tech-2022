import express from 'express'
import Writer from "../public/javascript/writer.js";
const router = express.Router()
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const writer = new Writer();

router.get("/", (req, res,next) => {
    let books = []
    try {
        books = require("../public/books.json")
    } catch (e) {
        res.status(404); // Ошибка – нет такой страницы
        res.render("error");
        res.end();

    }
    res.render("booksList", {books: books});
    next();
})

router.put("/", (req, res,next) => {
    let books = []
    try {
        books = writer.filterBooks(req.body.state)
    } catch (e) {
        res.status(404); // Ошибка – нет такой страницы
        res.render("error");
        res.end();
    }
    res.render("booksList", {books: books});
    next();
})


router.delete("/", (req, res,next) => {
    writer.deleteBook(req.body.id);
    const books = require("../public/books.json")
    res.render("booksList", {books: books});
    next();
})

router.get("/*", (req, res, next)=>{
    res.status(404); // Ошибка – нет такой страницы
    res.render("error");
    res.end();
});

export default router