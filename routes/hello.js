var express = require('express');
const { check, validationResult } = require('express-validator');
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
      res.render('hello/index', data);
    });
  });
  });

  router.get('/add', (req, res, next) => {
    res.render('hello/add', { title: 'Hello/Add', content: '新しいレコードを入力：', form: { name: '', mail: '', age:0 } });
  });

  router.post('/add',[ check('name').notEmpty().withMessage('名前は必須です'),
    check('mail').isEmail().withMessage('メールアドレスは有効な形式でなければなりません'),
    check('age').isInt({ min: 0 }).withMessage('年齢は0以上の整数でなければなりません'),
    check('age','AGEは0以上120以下でなければなりません。').custom(value => {
      return value >= 0 && value <= 120;
    })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var result ='<ul class="text-danger">';
      var result_arr = errors.array();
      for (var n in result_arr){
        result += '<li>' + result_arr[n].msg + '</li>';
      }
      result += '</ul>';
      var data = {
        title: 'Hello/Add',
        content:result,
        form:req.body
      };
      res.render('hello/add', data);
    }
    else {
    const name = req.body.name;
    const mail = req.body.mail;
    const age = req.body.age;
    db.serialize(() => {
      db.run("INSERT INTO mydata (name, mail, age) VALUES (?, ?, ?)", name, mail, age);
    });
    res.redirect('/hello');
  }
});

router.get('/show',(req, res, next)=>{
  const id = req.query.id;
  db.serialize(() => {
    const q ='SELECT * FROM mydata WHERE id = ?';
    db.get(q, [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (row) {
        var data = {
          title: 'Hello/show',
          content: 'id = ' + id +' のレコード' ,
          mydata:row
        };
        res.render('hello/show', data);
        }
      else {
        res.status(404).send('Record not found');
      };
    });
    });
  });

router.get('/edit', (req, res, next) => {
  const id = req.query.id;
  db.serialize(() => {
    const q = 'SELECT * FROM mydata WHERE id = ?';
    db.get(q, [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (row) {
        var data = {
          title: 'hello/edit',
          content: 'id = ' + id + ' のレコードを編集：',
          mydata: row
        };
        res.render('hello/edit', data);
      } else {
        res.status(404).send('Record not found');
      }
    });
  });
});

router.post('/edit', (req, res, next) => {
  const id = req.body.id;
  const name = req.body.name;
  const mail = req.body.mail;
  const age = req.body.age;
  const q = "update mydata set name = ?, mail = ?, age = ? where id = ?";
  db.serialize(() => {
    db.run(q,name, mail, age, id, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
    });
  });
  res.redirect('/hello');
});

router.get('/delete', (req, res, next) => {
  const id = req.query.id;
  db.serialize(() => {
    const q = 'SELECT * FROM mydata WHERE id = ?';
    db.get(q, [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (row) {
        var data = {
          title: 'hello/delete',
          content: 'id = ' + id + ' のレコードを削除：',
          mydata: row
        };
        res.render('hello/delete', data);
      } else {
        res.status(404).send('Record not found');
      }
    });
  });
});

router.post('/delete', (req, res, next) => {
  const id = req.body.id;
  const q = "delete from mydata where id = ?";
  db.serialize(() => {
    db.run(q, id, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.redirect('/hello');
    });
  });
  });

router.get('/find', (req, res, next) => {
  db.serialize(() => {
    db.all("SELECT * FROM mydata", (err, rows) => {
      if (err) { 
        res.status(500).json({ error: err.message });
        return;
      }
      else {
          var data = {
            title: 'hello/find',
            find:'',
            content: '検索条件を入力してください：',
            mydata: rows
          }
          res.render('hello/find', data);
        }
      });
    });
  })

  router.post('/find', (req, res, next) => {
    const find = req.body.find;
    db.serialize(() => {
      const q = "SELECT * FROM mydata WHERE ";
      db.all(q+ find,[], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        else {
          var data = {
            title: 'hello/find',
            find: find,
            content: '検索条件 ' + find,
            mydata: rows
          };
          res.render('hello/find', data);
        }
      });
    });
  });
module.exports = router;
