import React, { Component } from 'react';
import { Player } from 'video-react';
import HLSSource from './player.js';

import "../node_modules/video-react/dist/video-react.css";

class App extends Component {
  render() {
    return (
      <Player>
        <HLSSource
          isVideoChild
          src='/hls/stream.m3u8'
        />
      </Player>
    );
  }
}

export default App;
