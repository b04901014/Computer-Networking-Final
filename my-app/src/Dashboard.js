import React, { Component } from 'react';
import { BrowserRouter as Router,  Link } from "react-router-dom";
import ChatRoom from './ChatRoom.js';
import VideoPlayer from './player.js'
import Token from './Token.js'
import "videojs-resolution-switcher/lib/videojs-resolution-switcher.js"

class Dashboard extends Component {
  constructor(props){
    super(props);
    this.state = {
      user:null
    }
  }

  componentDidMount(){
    const auth = this.props.firebase.auth();

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

  render() {
    console.log(this.props.allstreams);
    return (
      <div style={{display:'flex'}}>
        <div className="Navigation">
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
        <div className="Dashboard">
          {this.props.allstreams.map((x,i)=>{
            return(
              <Link className="card" key={i} to={'/'+x.id} style={{backgroundImage:`url("${x.cover}")`}}>
                  <span>{x.id}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }
}

export default Dashboard;
