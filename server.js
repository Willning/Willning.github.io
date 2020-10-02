const express = require('express')
var fs = require('fs');
var http = require('http');
var https = require('https');

const app = express();
const port = 3000;
const path = require('path');

app.use('/js', express.static('js'));
app.use('/images', express.static('images'));
app.use('/css', express.static('css'));
app.use('/', express.static(__dirname));



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})