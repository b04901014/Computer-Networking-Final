import React, { Component } from 'react';
import videojs from 'video.js'
//import "../node_modules/@videojs/http-streaming/dist/videojs-http-streaming.min.js"
import "../node_modules/video.js/dist/video-js.css"
//require('videojs-contrib-quality-levels');

class VideoPlayer extends Component {
  componentDidMount() {
    // instantiate Video.js
    this.player = videojs(this.props.name, () => {
      const reloadOptions = {errorInterval: 10};
      this.player.reloadSourceOnError(reloadOptions);
      this.player.play();
    });
  }

  // destroy player on unmount
  componentWillUnmount() {
    if (this.player) {
      this.player.dispose()
    }
  }

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    return (
      <div>    
        <video-js id={this.props.name} class="video-js vjs-default-skin" data-setup='{"liveui": true}' controls preload="auto" className="video-js">
          <source src={this.props.src} type={this.props.type} />
        </video-js>
      </div>
    )
  }
}
export default VideoPlayer;
