var express = require('express');
var router = express.Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('mydb.sqlite3');


/* GET users listing. */
router.get('/', (req, res, next) =>{
  db.serialize(() => {
    var htmlRowsString ='';
    db.each("SELECT * FROM mydata", (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      else{
        htmlRowsString +="<tr><th>" + rows.id + "</th><td>" + rows.name + "</td></tr>";
      }   
    }
      ,(err, count) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
      var data ={
        title: 'Hello!',
        content:htmlRowsString
      };
      res.render('hello', data);
    });
  });
  });


module.exports = router;
