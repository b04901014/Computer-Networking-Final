import React, {Component} from 'react';
import { Button } from 'react-bootstrap'
import Popup from "reactjs-popup";

class Token extends Component {
  constructor(props) {
    super(props);
    this.state = {
      IsLoading: false,
      open: false,
      CurrentKey: null
    };
    this.RequestToken = this.RequestToken.bind(this);
    this.ShowToken = this.ShowToken.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  closeModal() {
    this.setState({ open: false })
  }

  componentDidMount() {
    this.props.socket.on('tok', (data)=>{
      this.setState({ isloading: false });
      this.setState({ open: true })
      this.setState({ CurrentKey: data })
    });
  }

  RequestToken() {
    this.setState({IsLoading: true});
    if (!this.props.user) {
      alert("Login to use this function!!!");
      this.setState({IsLoading: false});
      return;
    }
    var msgObj = {
      uid: this.props.user.uid,
      date: new Date().getTime()
    };
    this.props.socket.emit("tok", msgObj);
    this.setState({IsLoading: false});
  }

  ShowToken() {
    this.setState({IsLoading: true});
    if (!this.props.user) {
      alert("Login to use this function!!!");
      this.setState({IsLoading: false});
      return;
    }
    this.setState({ open: true })
    this.setState({IsLoading: false});
  }

  render() {
    return (
      <div>
        <Button
          variant="primary"
          disabled={this.state.IsLoading}
          onClick={!this.state.IsLoading ? this.RequestToken : null}
          className='stbut'
        >
          {this.state.IsLoading ? 'Loading…' : 'New Stream Key'}
        </Button>
        <Button
          variant="primary"
          disabled={this.state.IsLoading}
          onClick={!this.state.IsLoading ? this.ShowToken : null}
          className='stbut'
        >
          {this.state.IsLoading ? 'Loading…' : 'Current Stream Key'}
        </Button>
        <Popup
          className="popup"
          open={this.state.open}
          position="right center"
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <div className="modal">
            <div className="streamkey">
              {this.state.CurrentKey ? "Your Stream Key: " + this.state.CurrentKey : "You have not created any Stream Key yet!"} 
            </div>
          </div>
        </Popup>
      </div>
    );
  }
}

export default Token;
