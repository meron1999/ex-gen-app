var express = require('express');
var router = express.Router();
const db =require('../models/index');
const {Op} = require('sequelize');
const bcrypt = require('bcryptjs');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  try {
    const users = await db.User.findAll();
    const data = {
      title:'Users/Index',
      content:users
    };
    res.render('users/index', data);
  } catch (err) {
    next(err);
  }
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
    // パスワードをハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.pass, salt);

    await db.User.create({
      name: req.body.name,
      pass: hash, // ハッシュ化されたパスワードを保存
      mail: req.body.mail,
      age: req.body.age
    });
    res.redirect('/users');
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      // Sequelizeのバリデーションエラーを処理
      const errorMap = new Map();
      err.errors.forEach(e => {
        errorMap.set(e.path, [e.message]); // 各フィールドのエラーメッセージを配列で保持
      });
      const data = {
        title: 'Users/Add',
        form: req.body, // ユーザーが入力した値を保持
        err: errorMap
      };
      res.render('users/add', data);
    } else {
      return next(err); // その他のエラーは次のエラーハンドラへ
    }
  }
});

router.get('/edit', async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.query.id);
    if (user) {
      res.render('users/edit', {
        title: 'Users/Edit',
        form: user,
        err: null // Pass null for err on initial page load
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
    const user = await db.User.findByPk(req.body.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    // Update user properties from the form
    user.name = req.body.name;
    user.mail = req.body.mail;
    user.age = req.body.age;
    // パスワードが入力された場合のみ更新
    if (req.body.pass) {
      const salt = await bcrypt.genSalt(10);
      user.pass = await bcrypt.hash(req.body.pass, salt);
    }

    // Save changes, which will trigger validation
    await user.save();
    res.redirect('/users');
  } catch (err) {
    // If a validation error occurs, re-render the form with errors
    if (err.name === 'SequelizeValidationError') {
      const errorMap = new Map();
      err.errors.forEach(e => {
        errorMap.set(e.path, [e.message]);
      });
      return res.render('users/edit', {
        title: 'Users/Edit',
        form: req.body, // Use req.body to preserve user's input
        err: errorMap
      });
    }
    next(err); // Pass other errors to the main error handler
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

router.get('/login', (req, res, next) => {
  var data = {
    title: 'Users/Login',
    content:'名前とパスワードを入力してください',
  }
  res.render('users/login', data);
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await db.User.findOne({
      where: {
        name: req.body.name
      }
    });

    // Timing attack protection:
    // By always running the expensive bcrypt.compare function, we prevent an attacker
    // from guessing valid usernames based on response time differences.
    // If the user is not found, we use a dummy hash that is guaranteed to fail.
    const DUMMY_HASH = '$2b$10$fakedummyhashforsecuritypurposes.xxxxxxxxxxxxxxxxxx';
    const hashToCompare = user ? user.pass : DUMMY_HASH;
    const passwordFromUser = req.body.pass || ''; // Handle empty password submission

    const match = await bcrypt.compare(passwordFromUser, hashToCompare);

    if (match && user) { // Double-check user exists
      req.session.login = user; // セッションにユーザー情報を保存
      res.redirect('/'); // ログイン成功後のリダイレクト先
    } else {
      res.render('users/login', {
        title: 'Users/Login',
        content: '名前またはパスワードが間違っています。',
        // Preserve username on failed login for better UX
        name: req.body.name
      });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/users/login');
  });
});

module.exports = router;
