import React, { Component } from 'react';
import { FormGroup, FormControl } from 'react-bootstrap';

class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message:"",
      msgList: [],
    }
    this.sendMsg = this.sendMsg.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.onEnterPress = this.onEnterPress.bind(this);
  }

  autoScroll(){
    var target = document.querySelector(".Message:last-of-type");
    if(target) target.scrollIntoView()
  }

  componentDidMount(){
    if(!this.props.name) return;
    let db = this.props.firebase.firestore();
    let observer = db.collection('StreamRooms').doc(this.props.name).collection('Messages').orderBy("date")
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
  handleChange(e){
    this.setState({message:e.target.value});
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
    if(!this.props.user){alert("Login to use this function!!!");e.preventDefault();return false;}

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
  parseTime(date){
    var now = new Date().getTime(),
        delta = now - date;

    delta /= 1000;
    if(delta < 60 ) return delta.toFixed(0)+" s";
    delta /= 60;
    if(delta < 60) return delta.toFixed(0)+" min";
    delta /= 60;
    if(delta < 24) return delta.toFixed(0)+" hr";
    delta /= 24;
    if(delta <7) return delta.toFixed(0)+" days";
    return new Date(date).toLocaleDateString();
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
                  <span>{x.displayName}．{this.parseTime(x.date)}</span>
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
