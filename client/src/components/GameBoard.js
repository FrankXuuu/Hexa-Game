import React, { Component } from 'react';
import {
  GridGenerator,
  HexGrid,
  Layout,
  Text,
  Hexagon,
  HexUtils
} from 'react-hexgrid';
import { connect } from 'react-redux';
import * as api from '../API/gameApiCalls';

import '../static/App0.css';
import '../static/index0.css';

import io from 'socket.io-client';
const socket = io();
let rez;

class GameBoard extends Component {
  async renderBoard() {
    switch (this.props.auth) {
      case null:
        console.log(this.props.auth);
      case false:
        console.log(this.props.auth);
      default:
        this.componentDidMounto();
    }
  }

  async componentDidMounto() {
    let boardId;

    console.log('creating game...');

    let board = {};
    if (this.props.location.search.length !== 0) {
      let boardId = this.props.location.search.substr(
        this.props.location.search.length - 24
      );
      board = await api.getBoard(boardId);
    } else {
      let res = await api.getUserBoard(this.props.auth.googleId);
      rez = res;
      boardId = res._id;
      let currRoom = { room: boardId, user: this.props.auth.googleId };
      socket.emit('room', currRoom);
      board = await api.getBoard(boardId);
    }
    let boardState = await api.getBoardState(board[0].board);

    console.log(boardState);
    let { hexagons } = this.state;
    const hexagonsUpdate = hexagons.map(hex => {
      hex.props = hex.props || {};
      const foundHex = board.find(
        object => object.q === hex.q && object.r === hex.r && object.s === hex.s
      );
      hex.props.className = foundHex.props.className;
      hex.props.id = foundHex._id;

      return hex;
    });

    let myState =
      boardState.rubyGoogleId === this.props.auth.googleId ? 'ruby' : 'pearl';

    this.setState({
      hexagons: hexagonsUpdate,
      myState: myState,
      currPlayer: boardState.currPlayer,
      redTotal: boardState.redTotal,
      blueTotal: boardState.blueTotal,
      runMount: true,
      boardId: boardId,
      winner: false
    });
  }

  renderGameStats() {
    switch (this.state.currPlayer) {
      case null:
        return <div>Loading...</div>;
      default:
        return [
          <div key="1">You are: {this.state.myState}</div>,
          <div key="2">Current Player: {this.state.currPlayer}</div>,
          <div key="3">Red Total: {this.state.redTotal}</div>,
          <div key="4">Blue Total: {this.state.blueTotal}</div>
        ];
    }
  }

  constructor(props) {
    super(props);

    const hexagons = GridGenerator.hexagon(4);
    this.state = {
      hexagons
    };
  }

  onClick(event, source) {
    if (this.state.myState === this.state.currPlayer) {
      this.runMove(event, source);
    }
  }

  async runMove(event, source) {
    let { hexagons } = this.state;
    console.log(source);
    let targetHex = source.state.hex;
    const parentHex = hexagons.find(
      object =>
        object.q === targetHex.q &&
        object.r === targetHex.r &&
        object.s === targetHex.s
    );
    console.log(parentHex);
    // targetHex.props = source.props;
    let updateHex = hexagons;
    // TESTING WILL ADD ACTUAL USER LATER
    const player = this.state.myState;
    if (source.props.className === player) {
      this.clearSelected();
      updateHex = this.clickedPlayerTile(
        targetHex,
        hexagons,
        parentHex.props.id
      );
    } else if (source.props.className.indexOf('clone') !== -1) {
      updateHex = await this.clonePlayerTile(targetHex, hexagons);
      socket.emit('on change', { room: this.state.boardId });
    } else if (source.props.className.indexOf('jump') !== -1) {
      updateHex = await this.jumpPlayerTile(targetHex, hexagons);
      socket.emit('on change', { room: this.state.boardId });
    } else this.clearSelected();

    let board = await api.getBoard(rez._id);
    let oppPlayer = player == 'ruby' ? 'pearl' : 'ruby';

    let gameOver = await api.gameOver(board, oppPlayer);
    if (gameOver == true) {
      let winner =
        this.state.redTotal > this.state.blueTotal ? 'ruby' : 'pearl';
      this.setState({
        currPlayer: 'None',
        winner: winner
      });
      socket.emit('you lose', { room: this.state.boardId, winner: winner });
    }

    this.setState({ hexagons: updateHex });
  }

  async clonePlayerTile(targetHex, hexagons) {
    let player = this.state.myState;
    const toBeClonedTo = hexagons.find(
      object =>
        object.q === targetHex.q &&
        object.r === targetHex.r &&
        object.s === targetHex.s
    );
    let affectedTiles = await api.clone(
      toBeClonedTo.props.parentTile,
      toBeClonedTo.q,
      toBeClonedTo.r,
      toBeClonedTo.s
    );
    let currBoard = await api.getBoardState(affectedTiles[0].board);
    const newHexMap = hexagons.map(hex => {
      const affectedTile = affectedTiles.find(
        object => object.q === hex.q && object.r === hex.r && object.s === hex.s
      );
      if (affectedTile) {
        hex.props.className = affectedTile.props.className;
      }
      return hex;
    });

    // player = this.state.currPlayer === 'ruby' ? 'pearl' : 'ruby';

    this.setState({
      currPlayer: currBoard.currPlayer,
      redTotal: currBoard.redTotal,
      blueTotal: currBoard.blueTotal
    });
    this.clearSelected();
    return newHexMap;
  }

  async jumpPlayerTile(targetHex, hexagons) {
    let player = this.state.myState;
    const toBeJumpedTo = hexagons.find(
      object =>
        object.q === targetHex.q &&
        object.r === targetHex.r &&
        object.s === targetHex.s
    );
    let affectedTiles = await api.jump(
      toBeJumpedTo.props.parentTile,
      toBeJumpedTo.q,
      toBeJumpedTo.r,
      toBeJumpedTo.s
    );
    let currBoard = await api.getBoardState(affectedTiles[0].board);
    const newHexMap = hexagons.map(hex => {
      const affectedTile = affectedTiles.find(
        object => object.q === hex.q && object.r === hex.r && object.s === hex.s
      );
      if (affectedTile) {
        hex.props.className = affectedTile.props.className;
      }
      if (toBeJumpedTo.props.parentTile === hex.props.id) {
        hex.props.className = 'empty';
      }

      return hex;
    });
    // player = this.state.currPlayer === 'ruby' ? 'pearl' : 'ruby';
    this.setState({
      currPlayer: currBoard.currPlayer,
      redTotal: currBoard.redTotal,
      blueTotal: currBoard.blueTotal
    });
    this.clearSelected();
    return newHexMap;
  }

  clickedPlayerTile(targetHex, hexagons, parentId) {
    return hexagons.map(hex => {
      hex.props = hex.props || {};
      if (
        HexUtils.distance(targetHex, hex) === 1 ||
        HexUtils.distance(targetHex, hex) === 2
      ) {
        // Highlight tiles that are next to the target (1 distance away)
        if (
          !(hex.props.className === 'ruby' || hex.props.className === 'pearl')
        ) {
          hex.props.className =
            HexUtils.distance(targetHex, hex) === 1
              ? hex.props.className + ' clone'
              : // Highlight tiles that are 2 distance away from target
                HexUtils.distance(targetHex, hex) === 2
                ? hex.props.className + ' jump'
                : '';

          hex.props.parentTile = parentId;
        }
      } else {
        if (hex.props.className === 'clone') {
          hex.props.className = hex.props.className.replace('clone', '');
        } else if (hex.props.className === 'jump') {
          hex.props.className = hex.props.className.replace('jump', '');
        }
      }
      return hex;
    });
  }

  clearSelected() {
    const { hexagons } = this.state;
    const clearedHex = hexagons.map(hex => {
      hex.props = hex.props || {};

      if (hex.props.className.includes('clone')) {
        hex.props.className = hex.props.className.replace('clone', '');
      } else if (hex.props.className.includes('jump')) {
        hex.props.className = hex.props.className.replace('jump', '');
      }
      return hex;
    });
    this.setState({ hexagons: clearedHex });
  }

  async updateBoard() {
    let res = await api.getUserBoard(this.props.auth.googleId);
    let boardId = res._id;
    let currRoom = { room: boardId, user: this.props.auth.googleId };
    let board = await api.getBoard(boardId);

    let boardState = await api.getBoardState(board[0].board);

    let { hexagons } = this.state;
    const hexagonsUpdate = hexagons.map(hex => {
      hex.props = hex.props || {};
      const foundHex = board.find(
        object => object.q === hex.q && object.r === hex.r && object.s === hex.s
      );
      hex.props.className = foundHex.props.className;
      hex.props.id = foundHex._id;

      return hex;
    });

    this.setState({
      currPlayer: boardState.currPlayer,
      hexagons: hexagonsUpdate,
      redTotal: boardState.redTotal,
      blueTotal: boardState.blueTotal,
      runMount: true
    });
  }

  renderWin() {
    let win =
      this.state.winner == 'ruby' || this.state.winner == 'pearl'
        ? true
        : false;
    switch (win) {
      case false:
        return;
      case true:
        return <div className="center">{this.state.winner} wins!</div>;
    }
  }

  onMouseEnter(event, source) {}

  async setWinner(winner) {
    this.setState({winner: winner});
    await api.boardFinished(this.state.boardId);
  }

  render() {
    let { hexagons } = this.state;
    if (this.props.auth && !this.state.runMount) {
      this.componentDidMounto();
    }
    console.log('listening for change...');

    socket.on('update', data => this.updateBoard());
    socket.on('i lose', data => this.setWinner(data.winner));
    return (
      <div className="App">
        <HexGrid width={1200} height={800}>
          <Layout
            size={{ x: 6, y: 6 }}
            flat={false}
            spacing={1.1}
            origin={{ x: 0, y: 0 }}
            // onChange={this.gameUpdate()}
          >
            {/* {this.updateBoard(hexagons)} */}
            {hexagons.map((hex, i) => (
              <Hexagon
                key={i}
                q={hex.q}
                r={hex.r}
                s={hex.s}
                className={hex.props ? hex.props.className : null}
                onMouseEnter={(e, h) => this.onMouseEnter(e, h)}
                onClick={(e, h) => this.onClick(e, h)}
              />
            ))}
          </Layout>
        </HexGrid>
        {this.renderGameStats()}
        {this.renderWin()}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
    game: state.game
  };
}

export default connect(mapStateToProps)(GameBoard);
