import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import ChatRoom from './ChatRoom.js';
import SubApp from './SubApp.js';
import Dashboard from './Dashboard.js';
import Setting from './Setting.js';
import Login from './Login.js';
import io from 'socket.io-client';
const _socket = io.connect('http://localhost:8001', { path: '/mysocket' });
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
      allstreams: [],
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
    let observer = db.collection('StreamRooms')
      .onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            console.log('New Room: ', change.doc.id);
            let list = this.state.allstreams,
                cover = change.doc.data().cover_photo;
            if(cover){
              cover = cover.toUint8Array();
              cover = window.URL.createObjectURL(new Blob([cover]));
            }

            list.push({id:change.doc.id,cover:cover});
            this.setState({ allstreams: list });
          } else if (change.type === 'removed') {
            console.log('Room Detatched: ', change.doc.id);
            let list = this.state.allstreams;
            const idx = list.indexOf(change.doc.id);
            if (idx > -1)
              list.splice(idx, 1);
            this.setState({ allstreams: list });
          }
        });
      });
  }

  ToggleChatRoom(){
    this.setState({showChatRoom: !this.state.showChatRoom});
  }

  render(){
    console.log(this.state.allstreams);
    return(
      <Router>
        <Switch>
          <Route path="/" exact render={() => <Dashboard socket={_socket} firebase={firebase} allstreams={this.state.allstreams}/> } />
          <Route path="/setting" exact render={() => <Setting socket={_socket} firebase={firebase} user={this.state.user} /> } />
          <Route path="/login" render={() => <Login firebase={firebase} user={this.state.user} socket={_socket}/>} />
          {this.state.allstreams.map((x,i) =>{
            return(
              <Route path={"/" + x.id} key={i} render={() => <SubApp socket={_socket} firebase={firebase} name={x.id} /> } />
            );
          })}
        </Switch>
      </Router>
    );
  }
}

export default App;
