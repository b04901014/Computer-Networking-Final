const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
    extended: true
}));
const http = require('http').Server(app);
const io = require('socket.io')(http, {origin:["http://localhost:*","http://*.ngrok.io"],path: '/mysocket'});
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

var serviceAccount = require("./node_modules/testtest-67640-firebase-adminsdk-rnvx2-15ab922c2e.json");
const firebaseConfig = {
  databaseURL: "https://testtest-67640.firebaseio.com",
  credential: admin.credential.cert(serviceAccount)
};

// Initialize Firebase
admin.initializeApp(firebaseConfig);
const database = admin.firestore();

//Crypto Part
const algorithm = 'aes-192-cbc';
var UserKeyMap = {}; //User to Streamkey
var UserNameMap = [];
var nextPageToken;
admin.auth().listUsers(1000, nextPageToken)
    .then(function(listUsersResult) {
      listUsersResult.users.forEach(function(userRecord) {
        console.log('user', userRecord.toJSON().displayName);
        UserNameMap.push(userRecord.toJSON().displayName);
      });
    })
    .catch(function(error) {
      console.log('Error listing users:', error);
    });

io.on('connection', (socket) => {
  socket.on('chroom', (data) => {
    socket.leave(socket.room);
    socket.room = data;
    socket.join(data);
  });
  socket.on('get tok',uid => {
    if(UserKeyMap[uid]){
      streamkey = UserKeyMap[uid];
      // console.log(streamkey);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(streamkey + uid, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      // console.log(encrypted);
      socket.emit('tok', encrypted);
    }
  });
  socket.on('tok', (data) => {
    crypto.randomBytes(32, (err, buf) => {
      if (err) throw err;
      streamkey = buf.toString('hex');
      // console.log(streamkey);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(streamkey + data.uid, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      // console.log(encrypted);
      socket.emit('tok', encrypted);
      UserKeyMap[data.uid] = streamkey;
    });
  });
  socket.on("user login",uid => {
    database.collection("Users").doc(uid).set({
      last_login:new Date().getTime()
    },{merge:true});
  });
  socket.on("save cover photo",data => {
    console.log(data);
    // const Blob = admin.firestore.Blob.fromUint8Array(data.photo);
    database.collection("Users").doc(data.uid).set({
      cover_photo: data.photo
    },{merge:true}).then(()=>{
      socket.emit("save cover photo",true);
    }).catch((e)=>{
      socket.emit("save cover photo",false);
    });
  });
  socket.on("get cover photo",uid => {
    database.collection("Users").doc(uid).get().then(doc => {
      if(doc.exists){
        socket.emit("get cover photo",doc.data().cover_photo);
      }
    });
  });
  socket.on("check user name",userName => {
    socket.emit("check user name",UserNameMap.indexOf(userName) === -1);
  });
  socket.on("turn live",data => {
    database.collection("Users").doc(data.uid).set({
      streaming:data.live
    },{merge:true});
  });


  socket.on('disconnect',()=>{});

  //Watcher Part
  watcher
    .on('add', (file) => {
      let name = path.basename(file).split(".")[0];
      console.log('add!',name);
      database.collection('StreamRooms').doc(name).set({}, {merge: true});
    })
    .on('unlink', (file) => {
      let name = path.basename(file).split(".")[0];
      console.log('unlink!',name);
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
      // console.log(encrypted);
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const uid = decrypted.substring(64);
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
