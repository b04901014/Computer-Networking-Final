import React, {Component} from 'react';
import { Redirect } from 'react-router';

class LoginButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      waiting: false
    }
    this.loginFunction = this.loginFunction.bind(this);
  }

  loginFunction(){
    const firebase = this.props.firebase;
    const auth = firebase.auth();
    const facebook_provider = new firebase.auth.FacebookAuthProvider();
    const google_provider = new firebase.auth.GoogleAuthProvider();
    var provider = this.props.provider;
    var email = document.querySelectorAll(".Login input")[0].value,
        password = document.querySelectorAll(".Login input")[1].value,
        passwordCheck =  document.querySelectorAll(".Login input")[2].value,
        userName =  document.querySelectorAll(".Login input")[3].value;

    if(provider){
      if(provider === 'google'){
        auth.signInWithPopup(google_provider).then((result) => {
          // This gives you a Facebook Access Token. You can use it to access the Facebook API.
          // var token = result.credential.accessToken;
          // The signed-in user info.
          var user = result.user;
          // console.log(user);
          this.props.socket.emit("user login",user) ;
          this.props.update({success:true});
        }).catch((error) => {
          console.log(error);
          // Handle Errors here.
          var errorCode = error.code;
          this.props.update({success:false,error:errorCode});

          // var errorMessage = error.message;
          // The email of the user's account used.
          // var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          // var credential = error.credential;
        });
      }
      else if(provider === 'email'){
        firebase.auth().signInWithEmailAndPassword(email, password).then(()=>{
          window.location.pathname = '/';
        }).catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // ...
          console.log(error);
          if(errorCode === "auth/user-not-found"){
            alert("Not yet sign up!!");
          }
          if(errorCode === "auth/wrong-password"){
            alert("wrong password");
          }
          window.location.pathname = '/';
        });
      }
      else if(provider === 'signUp'){
        if(password !== passwordCheck){
          alert("Password not match!");
          return;
        }
        this.setState({waiting:true});
        this.props.socket.emit("check user name",userName);
        this.props.socket.on("check user name",result => {
          if(result){
            firebase.auth().createUserWithEmailAndPassword(email, password).then(()=>{
                let db = firebase.firestore();
                db.collection('Users').doc(firebase.auth().currentUser.uid).set({
                  first_login: new Date().getTime(),
                  user_name: userName
                },{merge:true}).then(()=>{
                  this.setState({waiting:false});
                }).catch(function(e) {console.log(e);});
                firebase.auth().currentUser.updateProfile({
                  displayName: userName
                }).then(() => {
                  // Update successful.
                  setTimeout(()=>{
                    window.location.pathname = '/';
                  },1000);
                }).catch(function(error) {
                  // An error happened.
                  console.log(error);
                });
              }).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // ...
              console.log(error);
              if(errorCode === "auth/weak-password"){
                alert(errorMessage);
              }
              else if(errorCode === "auth/email-already-in-use"){
                alert("email already in use");
              }
            });
          } else {
            alert("User name exist!")
          }

        });

      }
      else alert("未知錯誤，請重新整理");


    }
  }

  render(){
    return(
      <span onClick={this.loginFunction}>
        {this.props.content}
      </span>
    )
  }
}

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {loginResult: {},signUp:false};
    this.UpdateState = this.UpdateState.bind(this);
    this.handlekeypress = this.handlekeypress.bind(this);
  }

  UpdateState(state){
    this.setState({loginResult: state})
  }
  handlekeypress(e){
    if(e.key === 'Enter'){
      document.querySelectorAll(".login_box span")[1].click();
    }
  }

  render(){
    var content = (
      <div>
        <h4>請選擇一種登入方式</h4>
        <div className="inputArea">
          <div>
            <span>Email: </span><input type="text" onKeyPress={this.handlekeypress}/>
          </div>
          <div>
            <span>password: </span><input type="password" onKeyPress={this.handlekeypress}/>
          </div>
          <div style={{display:this.state.signUp?"flex":"none"}}>
            <span>re-Enter: </span><input type="password" onKeyPress={this.handlekeypress}/>
          </div>
          <div style={{display:this.state.signUp?"flex":"none"}}>
            <span>user name: </span><input type="text" onKeyPress={this.handlekeypress}/>
          </div>
        </div>
        <div className="login_box">
          <LoginButton content={<img src="./google.png" width="30px" alt="" />} firebase={this.props.firebase} socket={this.props.socket} provider="google" update={this.UpdateState}/>
          <LoginButton content={<i className="material-icons">person</i>} firebase={this.props.firebase} socket={this.props.socket} provider={this.state.signUp?"signUp":"email"} update={this.UpdateState}/>
        </div>
        <div className="FunctionalText" onClick={()=>{this.setState({signUp:!this.state.signUp});}}>Sign {this.state.signUp?"In":"Up"}</div>
      </div>
    );
    return(
      <div className="Login">
        {content}
      </div>
    );
  }
}

export default Login;
