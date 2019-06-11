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
// const firebaseConfig = {
//   databaseURL: "https://testtest-67640.firebaseio.com",
//   credential: admin.credential.applicationDefault()
// };

// Initialize Firebase
admin.initializeApp(firebaseConfig);
const database = admin.firestore();

//Crypto Part
const algorithm = 'aes-192-cbc';
var UserKeyMap = {}; //User to Streamkey
var UserIvMap = {}; //User to IV

var UserNameMap = {}; // Maintain users displayName
var ChatHistory = []; // Maintain chat History

// When server start load chat history from firebase
database.collection('ChatRoom').orderBy('date').get()
.then(snapshot => {
  var waitingQueue = [];
  snapshot.forEach(doc => {
    var chatData = doc.data();
    // console.log(doc.id, '=>', chatData);
    ChatHistory.push({...chatData,chatID:doc.id});
    // Update users' name who has chat before
    if(!UserNameMap[chatData.owner] && waitingQueue.indexOf(chatData.owner) === -1){
      waitingQueue.push(chatData.owner);

      admin.auth().getUser(chatData.owner)
      .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        var userData = userRecord.toJSON();
        console.log('Successfully fetched user data');
        UserNameMap[userData.uid] = userData.displayName;
      })
      .catch(function(error) {
        console.log('Error fetching user data:', error);
        waitingQueue.slice(waitingQueue.indexOf(chatData.owner),1);
      });
    }

  });
})
.catch(err => {
  console.log('Error getting documents', err);
});


io.on('connection', (socket) => {
  // console.log('a user connected');
  socket.on('chat history',()=>{
    socket.emit('chat history',ChatHistory.map(x => {return {...x,displayName:UserNameMap[x.owner]}}));
  });
  socket.on('chat',(data)=>{
    // Add a new document with a generated id.
    database.collection('ChatRoom').add(data)
    .then(ref => {
      console.log('Added document with ID: ', ref.id);

      // OPTIMIZE: using Promise to check if user displayName exist.
      console.log(data);
      getUserName(data.owner).then(userName => {
        var response = {
          ...data,
          displayName: userName,
          chatID: ref.id
        };
        socket.emit('chat',response);  // Send data to client
        ChatHistory.push(response);  // Record data in server
      });
    });
  });
  socket.on('get tok',uid => {
    if(UserKeyMap[uid]){
      streamkey = UserKeyMap[uid];
      console.log(streamkey);
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(streamkey + uid, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      console.log(encrypted);
      socket.emit('tok', encrypted);
    }
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
  socket.on('up_usrname', (data) => {
    console.log(data);
    UserNameMap[data.uid] = data.displayName;  // Update user name map
  });
  socket.on('allstreams', () => {
    socket.emit('allstreams', watcher.getWatched()['public/hls']);
  });
  socket.on('disconnect',()=>{});

  //Watcher Part
  watcher
    .on('add', () => {
      console.log('add!');
      io.sockets.emit('allstreams', watcher.getWatched()['public/hls']);
    })
    .on('unlink', () => {
      console.log('unlink!');
      io.sockets.emit('allstreams', watcher.getWatched()['public/hls']);
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
      console.log(UserNameMap);
      const encrypted = req.body.token;
      const name = req.body.name;
      console.log(encrypted);
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      const uid = decrypted.substring(128);
      console.log(uid);
      if (decrypted !== (UserKeyMap[uid] + uid) || name !== UserNameMap[uid]) {
        console.log('Invalid Token Attempt!');
        res.sendStatus(401);
      } else {
        //Allow Publish and assign a url to the user
        res.sendStatus(200);
      }
    } catch (err) {
      console.log('Invalid Token Attempt: ', err);
      res.sendStatus(401);
    }
  }
});

function getUserName(uid) {
  return new Promise(function(resolve, reject) {
    if(UserNameMap[uid]) resolve(UserNameMap[uid]);
    else{
      admin.auth().getUser(uid)
      .then(function(userRecord) {
        var userData = userRecord.toJSON();
        UserNameMap[uid] = userData.displayName;  // Update user name map
        resolve(userData.displayName);
      })
      .catch(function(error) {
        console.log('Error fetching user data:', error);
        reject();
      });
    }
  });
}

const PORT = 8001 ;
http.listen(process.env.PORT || PORT, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
