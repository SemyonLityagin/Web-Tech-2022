import express from 'express'
import Writer from "../public/javascript/writer.js";

const router = express.Router()
const writer = new Writer()

router.get("/:id([0-9]{1,})", (req, res,next) => {
    const book = writer.findBook(req.params.id)
    if(!book.err) {
        res.render("editBook", {book: book});
    } else if(book.err) {
        res.status(404); // Ошибка – нет такой страницы
        res.render("error");
    }
    next();
})

router.put('/:id([0-9]{1,})', (req, res,next)=>{
    const body = req.body;
    writer.rewriteBook(body);
    res.status(200)
    res.render("editBook", {book: body});
    next();
});
//
// router.get("*", (req, res)=>{
//     res.status(404); // Ошибка – нет такой страницы
//     res.header('X-XSS-Protection', "0" );
//     res.render("error");
//     res.end();
// });

export default router