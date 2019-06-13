import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import ChatRoom from './ChatRoom.js';
import SubApp from './SubApp.js';
import Dashboard from './Dashboard.js';
import Setting from './Setting.js';
import Login from './Login.js';
import io from 'socket.io-client';
const _socket = io.connect('dalolicorn.duckdns.org:8001', { path: '/mysocket' });
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const FireBaseConfig = {
  apiKey: "AIzaSyBHv4G2wIZmpBx1ml_VZ05bvWpMdCyPCnE",
  authDomain: "testtest-67640.firebaseapp.com",
  databaseURL: "https://testtest-67640.firebaseio.com",
  projectId: "testtest-67640",
  storageBucket: "testtest-67640.appspot.com",
  messagingSenderId: "1023789121288",
  appId: "1:1023789121288:web:0212d383afb4e577"
};
firebase.initializeApp(FireBaseConfig);

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      showChatRoom: true,
      roomList: [],
      user: null
    }
    this.ToggleChatRoom = this.ToggleChatRoom.bind(this);
  }
  componentDidMount(){
    const auth = firebase.auth();
    auth.onAuthStateChanged((user) => {
      if (user){
        this.setState({user: user});
        // console.log(user);
        this.setState({user: user});
      }
      else  { console.log('did not sign in'); }
    });
    let db = firebase.firestore();
    let observer = db.collection('Users')
        .onSnapshot(querySnapshot => {
          querySnapshot.docChanges().forEach(change => {
            if (change.type === 'added' || change.type === 'modified') {
              console.log('New data', change.doc.data());
              let list = this.state.roomList,
                  cover = change.doc.data().cover_photo;
              if(cover){
                cover = cover.toUint8Array();
                cover = window.URL.createObjectURL(new Blob([cover]));
              };
              var pos = list.indexOf(list.find((x,i,a)=>{return x.id === change.doc.data().user_name}));
              if(pos !== -1){ list.splice(pos,1); }
              list.push({id:change.doc.data().user_name,streaming:change.doc.data().streaming,cover:cover});
              this.setState({ roomList: list });
            } else if (change.type === 'removed') {
              let allmsgs = db.collection('Users').get()
                .then(snapshot => {
                  var list = [];
                  snapshot.forEach(doc => {
                    list.push(doc.data());
                  })
                  this.setState({ roomList: list});
                  console.log('Removed: ', change.doc.data());
                })
                .catch(err => {
                  console.log('Error getting documents', err);
                });
            }
          });
        });
  }

  ToggleChatRoom(){
    this.setState({showChatRoom: !this.state.showChatRoom});
  }

  render(){
    return(
      <Router>
        <Switch>
          <Route path="/" exact render={() => <Dashboard socket={_socket} firebase={firebase} roomList={this.state.roomList}/> } />
          <Route path="/setting" exact render={() => <Setting socket={_socket} firebase={firebase} user={this.state.user} /> } />
          <Route path="/login" render={() => <Login firebase={firebase} user={this.state.user} socket={_socket}/>} />
          {this.state.roomList.map((x,i) =>{
            return(
              <Route path={"/" + x.id} key={i} render={() => <SubApp socket={_socket} firebase={firebase} name={x.id} bg={x.cover} />} />
            );
          })}
        </Switch>
      </Router>
    );
  }
}

export default App;
