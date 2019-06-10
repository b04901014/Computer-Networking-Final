import React, { Component } from 'react';


class ChatRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message:"",
      msgList: []
    }
    this.sendMsg = this.sendMsg.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount(){
    this.props.socket.emit('chat history')
    this.props.socket.on('chat history',(data)=>{
      this.setState({msgList:data});
    });
    this.props.socket.on('chat',(data)=>{
      var list = this.state.msgList;
      list.push(data);
      this.setState({msgList:list,message:""});
      document.querySelector(".SendingPanel input").value = "";
    });
  }
  handleChange(e){
    this.setState({message:e.target.value});
  }
  sendMsg(){
    var socket = this.props.socket,
        user = this.props.user;
    if(!this.state.message) return;
    if(!user){alert("Login to use this function!!!");return;}

    var msgObj = {owner:user.uid,content:this.state.message,date:new Date().getTime()};
    console.log(msgObj)
    socket.emit("chat",msgObj);
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
        </div>
        <div className="SendingPanel">
          <input type='text' onChange={this.handleChange} onKeyPress={(e)=>{if(e.key==='Enter')this.sendMsg()}}/>
          <i className="material-icons" onClick={this.sendMsg}>send</i>
        </div>
      </div>
    );
  }
}

export default ChatRoom
