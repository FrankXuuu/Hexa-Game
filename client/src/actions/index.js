import axios from 'axios';
import {
  FETCH_USER
  // CREATE_GAME
  // CLONE_TILE,
  // JUMP_TILE,
  // FETCH_BOARD
} from './types';

export const fetchUser = () => async dispatch => {
  const res = await axios.get('/api/current_user');
  dispatch({ type: FETCH_USER, payload: res.data });
};
