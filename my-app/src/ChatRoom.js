import React, { Component } from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';
import 'firebase/firestore';


class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message:"",
      msgList: []
    }
    this.sendMsg = this.sendMsg.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onEnterPress = this.onEnterPress.bind(this);
  }

  componentDidMount(){
    let db = this.props.firebase.firestore();
    let observer = db.collection('StreamRooms').doc(this.props.name).collection('Messages')
      .onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            console.log('New data', change.doc.data());
            let list = this.state.msgList;
            list.push(change.doc.data());
            this.setState({ msgList: list });
          } else if (change.type === 'removed') {
            let allmsgs = db.collection('StreamRooms').doc(this.props.name).collection('Messages').get()
              .then(snapshot => {
                var list = [];
                snapshot.forEach(doc => {
                  list.push(doc.data());
                })
                this.setState({ msgList: list, message: ""});
                console.log('Removed: ', change.doc.data());
              })
              .catch(err => {
                console.log('Error getting documents', err);
              });
          }
        });
      });
  this.msgend.scrollIntoView({ behavior: "auto" });
  }

  componentWillUnmount() {
    let db = this.props.firebase.firestore();
    let unsub = db.collection('cities').onSnapshot(() => {
    });
    unsub();
  }

  componentDidUpdate() {
    this.msgend.scrollIntoView({ behavior: "auto" });
  }

  handleChange(e) {
    this.setState({message: e.target.value});
  }

  onEnterPress(e) {
    console.log(e.keyCode);
    var l = this.state.message.replace(/\s/g, '').length;
    if (e.keyCode === 13 && l === 0 && e.shiftKey === false)
      e.preventDefault();
    else if (e.keyCode === 13 && e.shiftKey === false)
      this.sendMsg(e);
  }

  sendMsg(e){
    /*
    var socket = this.props.socket,
        user = this.props.user;
        */
    if(!this.state.message) return;
    if(!this.props.user){alert("Login to use this function!!!");return;}

    let db = this.props.firebase.firestore();
    let data = {
      displayName: this.props.user.displayName,
      content: this.state.message,
      date: new Date().getTime()
    };
    db.collection('StreamRooms').doc(this.props.name).collection('Messages').add(data);
    console.log(data);
    this.setState({ message: "" });
    this.myform.reset();
    e.preventDefault();
    //    socket.emit("chat",msgObj);
  }

  render(){
    return(
      <div className="ChatRoom" style={this.props.style}>
        <div className="HistoryMessage">
          {this.state.msgList.map((x,i) =>{
            return(
              <div className="Message" key={i}>
                <div>{x.content}</div>
                <div>
                  <span>{x.displayName}．{new Date(x.date).toLocaleDateString()} {new Date(x.date).toLocaleTimeString()}</span>
                </div>
              </div>
            );
          })}
          <div
            style={{ float:"left", clear: "both" }}
            ref={(el) => { this.msgend = el; }}
          >
          </div>
        </div>
        <div className="SendingPanel">
          <form onSubmit={this.handleSubmit} ref={(el) => this.myform = el}>
            <FormGroup controlId="formControlsTextarea">
              <FormControl
                type="text"
                componentClass="textarea"
                placeholder='Please Enter Message...'
                autoComplete="off"
                onChange={this.handleChange}
                onKeyDown={this.onEnterPress}
                rows="3"
              >
              </FormControl>
            </FormGroup>
          </form>
        </div>
      </div>
    );
  }
}

export default ChatRoom
