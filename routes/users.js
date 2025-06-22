var express = require('express');
var router = express.Router();
const db =require('../models/index');
const {Op} = require('sequelize');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var id = req.query.id ? parseInt(req.query.id) : 1000; // デフォルト値を設定
  db.User.findAll({where:{id:{[Op.lte]:id}}}).then(users => {
    var data ={
      title:'Users/Index',
      content:users
    }
    res.render('users/index', data);
  });
});

router.get('/add',(req, res, next) => {
  var data={
    title: 'Users/Add',
    form: new db.User(), // 新しいUserインスタンスを作成
    err: null
  }
  res.render('users/add',data);
});

router.post('/add', async (req, res, next) => {
  try {
    await db.User.create({
      name: req.body.name,
      pass: req.body.pass,
      mail: req.body.mail,
      age: req.body.age
    });
    res.redirect('/users');
  } catch (err) {
    var data = {
      title: 'Users/Add',
      form: req.body, // ユーザーが入力した値を保持
      err: null // 初期化
    };
    if (err.name === 'SequelizeValidationError') {
      // Sequelizeのバリデーションエラーを処理
      const errorMap = new Map();
      err.errors.forEach(e => {
        errorMap.set(e.path, [e.message]); // 各フィールドのエラーメッセージを配列で保持
      });
      data.err = errorMap;
    } else {
      next(err); // その他のエラーは次のエラーハンドラへ
    }
    res.render('users/add', data);
  }
});

router.get('/edit', async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.query.id);
    if (user) {
      res.render('users/edit', {
        title: 'Users/Edit',
        form:user
      });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/edit', async (req, res, next) => {
  try {
    const [updatedCount] = await db.User.update(
      {
        name: req.body.name,
        pass: req.body.pass,
        mail: req.body.mail,
        age: req.body.age,
      },
      {
        where: { id: req.body.id }
      }
    );
    if (updatedCount > 0) {
      res.redirect('/users');
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    next(err);
  }
}); 

router.get('/delete', async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.query.id);
    if (user) {
      res.render('users/delete', {
        title: 'Users/Delete',
        form: user
      });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    next(err);
  }
});

router.post('/delete', async (req, res, next) => {
  try {
    const deletedCount = await db.User.destroy({
      where: { id: req.body.id }
    });
    if (deletedCount > 0) {
      res.redirect('/users');
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    next(err);      
  }
});

module.exports = router;
