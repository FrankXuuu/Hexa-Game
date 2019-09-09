import { JUMP_TILE, CLONE_TILE } from '../actions/types';

export default function(state = null, action) {
  switch (action.type) {
    case JUMP_TILE:
      return action.payload || false;
    case CLONE_TILE: 
      return action.payload || false;
    default:
      return state;
  }
}
