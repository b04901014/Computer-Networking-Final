import React, { Component } from 'react';
import VideoPlayer from './player.js'
import "videojs-resolution-switcher/lib/videojs-resolution-switcher.js"

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
  render() {
    return (
      <VideoPlayer { ...videoJsOptions }/>
    );
  }
}

export default App;
