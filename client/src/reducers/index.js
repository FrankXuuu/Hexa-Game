import { combineReducers } from 'redux';
import authReducer from './authReducer';
// import gameReducer from './gameReducer';
// import moveReducer from './moveReducer';

export default combineReducers({
  auth: authReducer
  // game: gameReducer
  // move: moveReducer
});
