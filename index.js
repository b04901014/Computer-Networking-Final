const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
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

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");


const PORT = 8000 ;
http.listen(process.env.PORT || PORT, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

io.on('connection', (socket) => {
  console.log('a user connected');
  

});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/my-app/public/index.html');
});
app.use(express.static(__dirname + '/public'));// to import css and javascript
