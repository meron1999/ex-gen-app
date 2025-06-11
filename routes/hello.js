var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('Hello', { 
    title: 'Hello' ,
    content:'これはサンプルのコンテンツです。<br>this is a sample content.'
    });
});

module.exports = router;
