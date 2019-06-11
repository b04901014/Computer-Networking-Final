const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
})); 
const http = require('http').Server(app);
const io = require('socket.io')(http, {origins: "http://localhost:*", path: '/mysocket'});
// Add the Firebase products that you want to use
const admin = require("firebase-admin");
require("firebase/firestore");
const crypto = require('crypto');
const path = require('path');
var buf = crypto.randomBytes(256);
const key = crypto.scryptSync(buf.toString('hex'), 'salt', 24);
const iv = crypto.scryptSync(buf.toString('hex'), 'salt', 16);
const chokidar = require('chokidar');
const watcher = chokidar.watch("public/hls/*.m3u8", { cwd: '.' });

const firebaseConfig = {
  databaseURL: "https://testtest-67640.firebaseio.com",
  credential: admin.credential.applicationDefault()
};

// Initialize Firebase
admin.initializeApp(firebaseConfig);
const database = admin.firestore();

//Crypto Part
const algorithm = 'aes-192-cbc';
var UserKeyMap = {}; //User to Streamkey

io.on('connection', (socket) => {
  socket.on('chroom', (data) => {
    socket.leave(socket.room);
    socket.room = data;
    socket.join(data);
  });
  socket.on('tok', (data) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) throw err;
      streamkey = buf.toString('hex');
      console.log(streamkey);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(streamkey + data.uid, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      console.log(encrypted);
      socket.emit('tok', encrypted);
      UserKeyMap[data.uid] = streamkey;
    });
  });
  socket.on('disconnect',()=>{});

  //Watcher Part
  watcher
    .on('add', (file) => {
      console.log('add!');
      let name = path.basename(file).slice(0, -5);
      database.collection('StreamRooms').doc(name).set({}, {merge: true});
    })
    .on('unlink', () => {
      console.log('unlink!');
      //Do something?
    });
});

app.post('/auth', function(req, res) {
  const requestIP = req.connection.remoteAddress;
  if (requestIP !== '::ffff:127.0.0.1') {
    console.log('Invalid IP address from rtmp server:', requestIP);
    res.sendStatus(401);
    return;
  } else {
    try {
      console.log(req.body);
      const encrypted = req.body.token;
      const name = req.body.name;
      console.log(encrypted);
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const uid = decrypted.substring(128);
      console.log(uid);
      admin.auth().getUser(uid)
        .then((userRecord) => {
          const userData = userRecord.toJSON();
          if (decrypted !== (UserKeyMap[uid] + uid) || name !== userData.displayName) {
            console.log('Invalid Token Attempt!');
            res.sendStatus(401);
           } else {
            //Allow Publish and assign a url to the user
            res.sendStatus(200);
          }
        })
        .catch ((err) => {
          console.log('Invalid Token Attempt: ', err);
          res.sendStatus(401);
        });
    } catch (err) {
      console.log('Invalid Token Attempt: ', err);
      res.sendStatus(401);
    }
  }
});

const PORT = 8001 ;
http.listen(process.env.PORT || PORT, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

