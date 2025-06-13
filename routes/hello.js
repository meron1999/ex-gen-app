var express = require('express');
var router = express.Router();
const https = require('https');
const parseString = require('xml2js').parseString;

/* GET users listing. */
router.get('/', function(req, res, next) {
  var opt ={
    host:'news.google.com',
    // port: 443, // HTTPSのデフォルトポートなので、通常は不要
    path:'/rss?hl=ja&ie=UTF-8&oe=UTF-8&gl=JP&ceid=JP:ja',
  };
  https.get(opt, (res2) => {
    var body = '';
    res2.on('data', (data) => {
      body += data;
    });
    res2.on('end', () => {
      parseString(body.trim(), (err, result) => {
        console.log(result);
        var data={
          title: 'Google News',
          content: result.rss.channel[0].item
        };
        res.render('Hello', data)
        });
      });
    });
  });


module.exports = router;
