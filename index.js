var express = require('express');
var app = express();
console.log(__dirname + '/images')
app.use(express.static(__dirname + '/images'));
app.listen(3500, function () {
    console.log('Express server is listening, use this url - localhost:3500/default.png');
});