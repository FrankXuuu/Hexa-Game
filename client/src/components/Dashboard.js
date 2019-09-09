import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { Link, BrowserRouter, Route } from 'react-router-dom';
// import * as actions from '../actions';
// import { Link } from 'react-router-dom';

import '../static/styles.css';
import * as api from '../API/gameApiCalls';

import io from 'socket.io-client';
const socket = io();

class Dashboard extends Component {
  componentWillMount() {
    this.setState({});
  }

  renderContent() {
    switch (this.state.startClicked) {
      case false:
        return;
      case true:
        return [
          <div key="1" id="loading">
            Loading for another user to join, please wait...
          </div>
        ];
    }
  }

  // async createNewGame() {
  // console.log('creating game...');
  // let res = await api.createGame();S
  // console.log(this.state);
  // await this.props.getBoard(res._id);
  // console.log(res);
  // window.location = '/testboard';
  // }

  socketStuff() {
    let queue = { room: 'queue', user: this.props.auth };
    socket.emit('queue', queue);
    let user2 = this.props.auth.googleId;
    socket.on('users in queue', function(data) {
      if (Object.keys(data.roster).length === 2) {
        console.log('FIRST CLICKER', data.user);
        api.createGame(data.user.googleId, user2);
        socket.emit('leave room', { room: 'queue' });
        window.location.href = '/gameBoard';
      }
    });
    socket.on('user left room', function(data) {
      socket.emit('leave room', data);
      window.location.href = '/gameBoard';
    });

    this.setState({ startClicked: true });

    //console.log(clients, clients.length);
  }

  render() {
    return (
      <div style={{ textAlign: 'center' }}>
        <button onClick={() => this.socketStuff()} className="startGame btn">
          Start Game
        </button>

        {this.renderContent()}

        {/* <BrowserRouter>
          <div>
            <Route exact path="/dashboard/game" component={TestBoard} />
          </div>
        </BrowserRouter> */}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return { auth: state.auth };
}

export default connect(mapStateToProps)(Dashboard);

// export default connect(null, actions)(Dashboard);
