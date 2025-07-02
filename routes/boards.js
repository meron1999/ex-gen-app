const express = require('express');
const router = express.Router();
const db = require('../models/index');

const pnum = 10; // ページネーションの1ページあたりのアイテム数

// Middleware to check for an active login session
function requireLogin(req, res, next) {
  if (req.session.login) {
    // If logged in, proceed to the next handler
    next();
  } else {
    // If not logged in, redirect to the login page
    res.redirect('/users/login');
  }
}

router.get('/', requireLogin, async (req, res, next) => {
    res.redirect('/boards/0');
});

router.get('/:page', requireLogin, async (req, res, next) => {
  const page = parseInt(req.params.page) || 0;
  const offset = page * pnum;

  try {
    const boards = await db.Board.findAll({
      include: [{
        model: db.User,
        as: 'user',
        attributes: ['name']
      }],
      limit: pnum,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.render('boards/index', {
      title: 'Boards',
      login: req.session.login,
      content:boards,
      page: page,
      pnum: pnum
    });
  } catch (err) {
    next(err);
  }
} );

router.post('/add', requireLogin, async (req, res, next) => {
  try {
    await db.Board.create({
      message: req.body.msg,
      userId: req.session.login.id
    });
    res.redirect('/boards');
  } catch (err) {
    next(err);
  }
});

router.get('/home/:id/:page', requireLogin, async (req, res, next) => {
  const id = parseInt(req.params.id);
  const page = parseInt(req.params.page) || 0;
  const offset = page * pnum;

  try {
    const boards = await db.Board.findAll({
      // [BUG FIX] Use the numeric 'id' from the URL for the query, not the string name.
      where: {
        userId: id,
      },
      include: [{
        model: db.User,
        required: true,
        as: 'user' // Ensure you have the alias defined in your model association
      }],
      limit: pnum,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.render('boards/home', {
      title: 'Boards',
      login: req.session.login,
      userId: id,
      // The user's name is available in the first board's user object, if boards exist.
      userName: boards.length > 0 ? boards[0].user.name : 'User',
      content: boards,
      page: page,
      pnum: pnum
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;