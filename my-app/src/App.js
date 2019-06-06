import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import { Player } from 'video-react';
import HLSSource from './player.js';
import ChatRoom from './ChatRoom.js';
import SubApp from './SubApp.js';
import Setting from './Setting.js';
import Login from './Login.js';
import io from 'socket.io-client';
const _socket = io.connect('http://localhost:8000');
import firebase from 'firebase/app';
import 'firebase/auth';

const FireBaseConfig = {
  apiKey: "AIzaSyDn0nddtCgTPVmkyJ4geIqS-CGsoYnrCCk",
  authDomain: "network-final-9729e.firebaseapp.com",
  databaseURL: "https://network-final-9729e.firebaseio.com",
  projectId: "network-final-9729e",
  storageBucket: "network-final-9729e.appspot.com",
  messagingSenderId: "sender-id",
  appID: "app-id",
};
firebase.initializeApp(FireBaseConfig);


import "../node_modules/video-react/dist/video-react.css";

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      showChatRoom: true,
      user: null
    }
    this.ToggleChatRoom = this.ToggleChatRoom.bind(this);
  }
  componentDidMount(){
    const auth = firebase.auth(),
          socket = _socket;
    auth.onAuthStateChanged((user) => {
      if (user){
        this.setState({user: user});
        // console.log(user);
        this.setState({user: user});
      }
      else  { console.log('did not sign in'); }
    });
  }

  ToggleChatRoom(){
    this.setState({showChatRoom: !this.state.showChatRoom});
  }

  render(){
    return(
      <Router>
        <Switch>
          <Route path="/" exact render={() => <SubApp socket={_socket} firebase={firebase} /> } /> // Original App Component
          <Route path="/setting" exact render={() => <Setting socket={_socket} firebase={firebase} user={this.state.user} /> } /> 
          <Route path="/login" render={() => <Login firebase={firebase} user={this.state.user}/>} />
        </Switch>
      </Router>
    );
  }
}

export default App;
