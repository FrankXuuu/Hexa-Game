import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from '../actions';

import Header from './Header';
import Landing from './Landing';
import Dashboard from './Dashboard';
import GameBoard from './GameBoard';

class App extends Component {
  constructor() {
    super();
    this.state = {
      // response: false,
      // endpoint: "http://localhost:3000/"
    };
  }

  componentDidMount() {
    this.props.fetchUser();
    // this.props.getBoard("5ab1b8fbc451c32babe97a6a");
    // const { endpoint } = this.state;
    /*const socket = socketIOClient(endpoint);
    socket.on("FromAPI", data => {
      console.log("YOOOOOOOOOOOOO", data)
      this.setState({ response: data })
    });
    socket.on("connectToRoom", data=> {
      console.log(data);
    });*/
  }

  // async createNewGame() {
  //   console.log('creating game...');
  //   let res = await api.createGame();
  //   console.log(this.state);
  //   await this.props.getBoard(res._id);
  //   console.log(res);
  //   window.location = '/testboard';
  // }

  render() {
    // const { response } = this.state;
    return (
      <div className="container">
        <BrowserRouter>
          <div>
            <Header />
            {/* {response ? <p>iffy uh {response}</p> : <p>Loading...</p>} */}
            <Route exact path="/" component={Landing} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route path="/gameboard" component={GameBoard} />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default connect(null, actions)(App);
