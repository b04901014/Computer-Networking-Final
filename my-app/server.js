const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
const firebase = require("firebase/app");
// Add the Firebase products that you want to use
const admin = require("firebase-admin");
require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDn0nddtCgTPVmkyJ4geIqS-CGsoYnrCCk",
  authDomain: "network-final-9729e.firebaseapp.com",
  databaseURL: "https://network-final-9729e.firebaseio.com",
  projectId: "network-final-9729e",
  storageBucket: "network-final-9729e.appspot.com",
  messagingSenderId: "sender-id",
  appID: "app-id",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
admin.initializeApp(firebaseConfig);
const database = firebase.firestore();

const PORT = 8001 ;
http.listen(process.env.PORT || PORT, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

var UserNameMap = {}; // Maintain users displayName
var ChatHistory = []; // Maintain chat History
// When server start load chat history from firebase
database.collection('ChatRoom').orderBy('date').get()
.then(snapshot => {
  snapshot.forEach(doc => {
    // console.log(doc.id, '=>', doc.data());
    ChatHistory.push({...doc.data(),chatID:doc.id});
    // Update users' name who has chat before
    if(!UserNameMap[doc.data().owner]){
      // FIXME: multiple query before first promise resolve
      admin.auth().getUser(doc.data().owner)
      .then(function(userRecord) {
        // See the UserRecord reference doc for the contents of userRecord.
        var userData = userRecord.toJSON();
        console.log('Successfully fetched user data');
        UserNameMap[userData.uid] = userData.displayName;
      })
      .catch(function(error) {
        console.log('Error fetching user data:', error);
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
    console.log(data);
    // Add a new document with a generated id.
    database.collection('ChatRoom').add(data)
    .then(ref => {
      console.log('Added document with ID: ', ref.id);

      // OPTIMIZE: using Promise to check if user displayName exist.
      if(UserNameMap[data.owner]){  // User displayName can be foundd in name map
        var response = {
              ...data,
              displayName: UserNameMap[data.owner],
              chatID: ref.id
            };
        socket.emit('chat',response);  // Send data to client
        ChatHistory.push(response);  // Record data in server
      } else {  // User displayName can't be foundd in name map
        admin.auth().getUser(data.owner)
        .then(function(userRecord) {
          // See the UserRecord reference doc for the contents of userRecord.
          console.log('Successfully fetched user data');
          var userData = userRecord.toJSON(),
              response = {
                ...data,
                displayName: userData.displayName,
                chatID: ref.id
              };
          socket.emit('chat',response);  // Send data to client
          ChatHistory.push(response);  // Record data in server
          UserNameMap[data.owner] = userData.displayName;  // Update user name map
        })
        .catch(function(error) {
          console.log('Error fetching user data:', error);
        });
      }

    });
  });
  socket.on('disconnect',()=>{});
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/my-app/public/index.html');
});
app.use(express.static(__dirname + '/public'));// to import css and javascript
