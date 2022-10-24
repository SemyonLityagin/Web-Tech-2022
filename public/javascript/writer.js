import fs from 'fs'
import { createRequire } from "module";
const require = createRequire(import.meta.url);

export default class Writer {
    writeToJson(books) {
        fs.writeFile('./public/books.json', JSON.stringify(books), (err) => {
            if (err) throw err;
        });
    }

    filterBooks(filter) {
        const books = require("../books.json")
        console.log(filter)
        switch (filter) {
            case "в наличии": {
                const answer = []
                for (const i in books) {
                    if(books[i].state === "в наличии") answer.push(books[i])
                }
                console.log(answer)
                return answer
            }
            case "по дате возврата": {
                const temp = []
                for (const i in books) {
                    if(books[i].state !== "в наличии") temp.push([books[i], books[i].personCard.returnDate])
                }
                for (let i = 2; i >= 0; i--) {
                    temp.sort( (a,b) => {
                        a = a[1].split('-')[i];
                        b = b[1].split('-')[i];
                        return a > b ? 1 : a < b ? -1 : 0;
                    })
                }
                const answer = []
                for (const i in temp) {
                    answer.push(temp[i][0])
                }
                return answer
            }
            default: {
                return books
            }
        }
    }

    deleteBook(id) {
        const books = require("../books.json")
        let ind = books.findIndex(book => book.id === id)
        if(ind !== -1) {
            books.splice(ind, 1)
            this.writeToJson(books)
        }
    }

    findBook(id) {
        const books = require("../books.json")
        if(id === "0") {
            let maxId = 1
            for (const i in books) {
                if(books[i].id > maxId) maxId = books[i].id
            }
            return {"id": maxId+1, "title": "", "author": "", "year": "", "state": "в наличии", "personCard": {}}
        }
        let ind = books.findIndex(book => book.id === id)
        if(ind !== -1) return books[ind]
        return {"err": "Not found"}
    }

    rewriteBook(book) {
        const books = require("../books.json")
        let ind = books.findIndex(b => b.id === book.id)
        if (ind !== -1) {
            books[ind] = book
            this.writeToJson(books)
        } else books.push(book)
    }
}