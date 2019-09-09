import axios from 'axios';

export const createGame = async (rubyGoogleId, pearlGoogleId) => {
  const res = await axios.post('/api/board/create', {
    name: 'board',
    size: 4,
    redTotal: 3,
    rubyGoogleId: rubyGoogleId,
    pearlGoogleId: pearlGoogleId,
    blueTotal: 3,
    nullSpaces: []
  });
  return res.data;

  // dispatch({ type: CREATE_GAME, payload: res.data });
};

export const jump = async (hexagonId, q, r, s) => {
  const res = await axios.patch('/api/hexagon/' + hexagonId + '/jump', {
    q: q,
    r: r,
    s: s
  });
  return res.data;
  // dispatch({ type: JUMP_TILE, payload: res.data });
};

export const clone = async (hexagonId, q, r, s) => {
  console.log(hexagonId);
  const res = await axios.patch('/api/hexagon/' + hexagonId + '/clone', {
    q: q,
    r: r,
    s: s
  });
  return res.data;
  // dispatch({ type: CLONE_TILE, payload: res.data });
};

export const getUserBoard = async userId => {
  const res = await axios.get('/api/user/' + userId + '/board', null);
  return res.data;
  // dispatch({ type: FETCH_BOARD, payload: res.data });
};

export const boardFinished = async boardId => {
  console.log("boardFinished");
  const res = await axios.patch('/api/board/' + boardId + '/gamedone', null);
  return res.data;
  // dispatch({ type: FETCH_BOARD, payload: res.data });
}; 
export const gameOver = async (hexagons, state) => {
  const res = await axios.post('/api/board/options/', {
    hexagons: hexagons,
    state: state
  });
  return res.data;
}

export const getBoard = async boardId => {
  const res = await axios.get('/api/' + boardId + '/hexagons', null);
  return res.data;
  // dispatch({ type: FETCH_BOARD, payload: res.data });
};

export const getBoardState = async boardId => {
  const res = await axios.get('/api/board/' + boardId, null);
  return res.data;
};
