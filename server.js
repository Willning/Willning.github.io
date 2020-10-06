const express = require('express')
const webpush = require('web-push')
var fs = require('fs');
var http = require('http');
var https = require('https');

const app = express();
const port = 3000;
const path = require('path');

const vapidPublicKey = 'BDL6S2C706gO9ZzxvaPV_BKVM3gO4aeoCMFWbREmBMDMlshqd4rA9ybl5PHqtKRPKQCkfoE2K560mwIY5TK4seM';
const vapidPrivateKey = 'ALJa4PefR22p61KnnGscc8ztC1IrOlf3ZmohKW94VGs';

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

//Push notification using webpush
app.get('/push_test', function(req,res) {
  //Post to the endpoint in 30 seconds.
  var endpoint = req.query['url_endpoint'];
  var auth_key= req.query['auth_key'];
  var hash_key= req.query['hash_key'];

  const subscription = {
    endpoint: endpoint,
    keys: {
      auth: auth_key,
      p256dh: hash_key,
    }
  };

  webpush.setVapidDetails(
    endpoint,
    vapidPublicKey,
    vapidPrivateKey,
  );
  
  webpush.sendNotification(subscription, "This is a push event");

  res.sendStatus(200);
})