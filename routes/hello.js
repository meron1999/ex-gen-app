var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('mydb.sqlite3');


/* GET users listing. */
router.get('/', function(req, res, next) {
  db.serialize(() => {
    db.all("SELECT * FROM mydata", (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      var data ={
        title: 'Hello!',
        content:rows
      };
      res.render('hello', data);
    });
  });
  });


module.exports = router;
