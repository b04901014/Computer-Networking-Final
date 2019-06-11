import React, { Component } from 'react';
import Token from './Token.js'
import { Redirect, Link, Router } from 'react-router-dom';

class Setting extends Component {
  constructor(props) {
    super(props);
    this.setUserdata = this.setUserdata.bind(this);
    this.logout = this.logout.bind(this);

  }
  setUserdata(){
    var userName = document.querySelectorAll(".Setting input")[0].value;
    console.log(userName);
    if(userName){
      this.props.user.updateProfile({
        displayName: userName
      }).then(function() {
        // Update successful.
        alert("Update success!")
        const msgObj = {
          uid: this.props.user.uid,
          displayName: userName
        };
      }).catch(function(error) {
        // An error happened.
        console.log(error);
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
          <button onClick={this.setUserdata}> Save </button>
          <div className="FunctionalText" onClick={this.logout}>Logout</div>
          <div className="FunctionalText"><Link to="/">Back</Link></div>
        </div>
      </div>
    );
  }
}

export default Setting;
