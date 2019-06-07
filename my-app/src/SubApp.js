import React, { Component } from 'react';
import { BrowserRouter as Router,  Link } from "react-router-dom";
import ChatRoom from './ChatRoom.js';
import io from 'socket.io-client';
import VideoPlayer from './player.js'
import "videojs-resolution-switcher/lib/videojs-resolution-switcher.js"

const _socket = io.connect('http://localhost:8000');

const videoJsOptions = {
  autoplay: true,
  controls: true,
  liveui: true,
  sources: [{
    src: '/hls/stream.m3u8',
    type: 'application/x-mpegURL'
  }],
  plugins: {
    videoJsResolutionSwitcher: {
    default: 'low',
    dynamicLabel: true
    }
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      showChatRoom: true,
      user:null
    }
    this.ToggleChatRoom = this.ToggleChatRoom.bind(this);
  }

  componentDidMount(){
    const auth = this.props.firebase.auth(),
          socket = _socket;

    // Get the user object from firebase
    auth.onAuthStateChanged((user) => {
      if (user){
        this.setState({user: user});
        console.log(user);
        this.setState({user: user});
      }
      else  { console.log('did not sign in'); }
    });
  }

  ToggleChatRoom(){ this.setState({showChatRoom: !this.state.showChatRoom}); }

  render() {
    return (
      <div style={{display:'flex'}}>
        <div className="Navigation">
          <div className="ToggleChatRoom" onClick={this.ToggleChatRoom}>
            <i className="material-icons">forum</i>
          </div>
          {
            this.state.user?
            <span style={{color: "white", fontSize: "20px", padding: "10px"}}>Hi, {this.state.user.displayName?this.state.user.displayName:""}</span>:
            null
          }
          <div style={{display:'flex'}}>
            {this.state.user?
              <Link to='/setting'> <i className="material-icons">settings</i> </Link>:
              <Link to='/login'>Login</Link>
            }
          </div>
        </div>
        <div className="PlayerContainer" style={{left:this.state.showChatRoom?'0':'150px'}}>
          <VideoPlayer { ...videoJsOptions }/>
        </div>
        <ChatRoom style={{left:this.state.showChatRoom?'0':'300px'}} socket={this.props.socket} user={this.state.user}/>
      </div>
    );
  }
}

export default App;