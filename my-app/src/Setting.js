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
    if(!this.props.user) return;
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
    var coverphoto = document.querySelectorAll(".Setting input")[1].files[0];
      //        live_on = document.querySelectorAll(".Setting input")[0].checked;
      //    console.log(live_on);
    //    this.props.socket.emit("turn live",{uid:this.props.user.uid,live:live_on});
    if(coverphoto){
      this.props.socket.emit("save cover photo",{
        uid:this.props.user.uid,
        photo: coverphoto
      });
      this.props.socket.on("save cover photo",result=>{if(result)alert("photo save success");else alert("photo save success");})
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
    /*
          <div>
            <span>live on: </span><input type='checkbox'/>
          </div>
          */
  render(){
    if(!this.props.user) return <Redirect to="/" />;
    var user = this.props.user;
    if(!user) return <Redirect to='/' />;
     return(
      <div className="Setting">
        <div>
          <div>
            <Token socket={this.props.socket} user={user} />
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
