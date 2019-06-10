import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";
import ChatRoom from './ChatRoom.js';
import SubApp from './SubApp.js';
import Setting from './Setting.js';
import Login from './Login.js';
import io from 'socket.io-client';
const _socket = io.connect('http://localhost:8001', { path: '/mysocket' });
import firebase from 'firebase/app';
import 'firebase/auth';

/*
const FireBaseConfig = {
  apiKey: "AIzaSyDn0nddtCgTPVmkyJ4geIqS-CGsoYnrCCk",
  authDomain: "network-final-9729e.firebaseapp.com",
  databaseURL: "https://network-final-9729e.firebaseio.com",
  projectId: "network-final-9729e",
  storageBucket: "network-final-9729e.appspot.com",
  messagingSenderId: "sender-id",
  appID: "app-id",
};
*/

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
    _socket.on('allstreams', (data)=>{
      this.setState({allstreams: data});
    });
    _socket.emit('allstreams');
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
          {this.state.allstreams.map((x,i) =>{
            return(
              <Route path={"/" + x.slice(0, -5)} key={i} render={() => <SubApp socket={_socket} firebase={firebase} name={x} /> } />
            );
          })}
        </Switch>
      </Router>
    );
  }
}

export default App;
