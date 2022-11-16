import express from 'express'
import fs from 'fs'
const router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('start');
  next()
});
router.get('/game', function(req, res, next) {
  console.log(res.body)
  res.render('game');
  next()
});
router.get('/start', function(req, res, next) {
  let records = JSON.parse(fs.readFileSync('./bd/records.json', 'utf8'));
  res.render('start');
  next()
});
router.get('/records', function(req, res, next) {
  let records = JSON.parse(fs.readFileSync('./bd/records.json', 'utf8'));
  res.render('records', {records: records});
  next()
});
router.post('/game', function(req, res, next) {
  console.log(req.body)
  let records = JSON.parse(fs.readFileSync('./bd/records.json', 'utf8'));
  records.push(req.body)
  records.sort((rec1, rec2) => {
    let k1 = rec1.score, k2 = rec2.score;
    return (k1 < k2) ? 1 : -1;
  } );
  for (let i = 0; i < records.length; i++) {
    records[i].id = i+1;
  }
  fs.writeFile('./bd/records.json', JSON.stringify(records), (err) => {
    console.log("hello")
    if (err) throw err;
  });
  res.end(JSON.stringify({success: true}));
  next()
});

export default router