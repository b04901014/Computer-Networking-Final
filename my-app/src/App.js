import React, { Component } from 'react';
import { Player } from 'video-react';
import HLSSource from './player.js';
import ChatRoom from './ChatRoom.js';

import "../node_modules/video-react/dist/video-react.css";

class App extends Component {
  render() {
    return (
      <div style={{display:'flex'}}>
        <div className="PlayerContainer">
          <Player>
            <HLSSource
              isVideoChild
              src='/hls/stream.m3u8'
            />
          </Player>
        </div>
        <ChatRoom />
      </div>
    );
  }
}

export default App;
