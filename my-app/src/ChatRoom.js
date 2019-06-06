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

  handleChange(e){
    this.setState({message:e.target.value});
  }
  sendMsg(){
    var socket = this.props.socket;
    if(!this.state.message) return;

    var msgObj = {}

    var list = this.state.msgList;
    list.push({owner:'Me',content:this.state.message,date:new Date().getTime()});
    this.setState({msgList:list,message:""});
    document.querySelector(".SendingPanel input").value = "";
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
                  <span>{x.owner}</span><br></br>
                  <span>{new Date(x.date).toLocaleDateString()} {new Date(x.date).toLocaleTimeString()}</span>
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
