import React, { Component } from 'react';
import Token from './Token.js'
import { Redirect, Link, Router } from 'react-router-dom';

class Setting extends Component {
  constructor(props) {
    super(props);
    this.setUserdata = this.setUserdata.bind(this);
    this.logout = this.logout.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidMount(){
    this.props.socket.emit("get cover photo",this.props.user.uid);
    this.props.socket.on("get cover photo",photo => {
      console.log(photo);
      const blob = new Blob([photo]);
      console.log(blob);
      var objectURL = window.URL.createObjectURL(blob);
      console.log(objectURL);
      this.preview.style.backgroundImage = `url("${objectURL}")`
    });
  }
  setUserdata(){
    var userName = document.querySelectorAll(".Setting input")[0].value,
        coverphoto = document.querySelectorAll(".Setting input")[2].files[0],
        streamRoom = document.querySelectorAll(".Setting input")[1].value;
        console.log(streamRoom);
    if(userName){
      this.props.user.updateProfile({
        displayName: userName
      }).then(function() {
        // Update successful.
        alert("Update success!");
      }).catch(function(error) {
        // An error happened.
        console.log(error);
      });
    }
    if(coverphoto){
      this.props.socket.emit("save cover photo",{
        uid:this.props.user.uid,
        photo: coverphoto
      });
    }
    if(streamRoom){
      this.props.socket.emit("attach stream room",{
        uid:this.props.user.uid,
        name: streamRoom
      });
    }
  }
  logout(){
    this.props.firebase.auth().signOut().then(function() {
      window.location.reload(); // Sign-out successful.
    }, function(error) {
      console.log(error); alert("登出錯誤，請重試"); // An error happened.
    });
    this.setState({user:null});
  }
  handleChange(e){
    var file = e.target.files[0];
    var objectURL = window.URL.createObjectURL(file);
    console.log(objectURL);
    this.preview.style.backgroundImage = `url("${objectURL}")`
  }

  render(){
    if(!this.props.user) return <Redirect to="/" />;
    var user = this.props.user;
     return(
      <div className="Setting">
        <div>
          <div>
            <span>User Name:</span>
            <input defaultValue={user.displayName} placeholder="set up the user name"/>
          </div>
          <div>
            <Token socket={this.props.socket} user={user} />
          </div>
          <div>
          <span>attach stream room:</span>
            <input placeholder="key in stream room name"/>
          </div>
          <div>
            <span>cover photo</span>
            <input type="file" accept="image/*" onChange={this.handleChange} />
            <div className="Preview" ref={(el) => this.preview = el}></div>
          </div>
          <button onClick={this.setUserdata}> Save </button>
          <div className="FunctionalText" onClick={this.logout}>Logout</div>
          <div className="FunctionalText"><Link to="/">Back</Link></div>
        </div>
      </div>
    );
  }
}

export default Setting;
