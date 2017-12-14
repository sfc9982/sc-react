import { Position } from './models';

import { mnemonic } from './helpers';

import {
  UPDATE_POSITION_VALUE,
  LOAD_POSITION,
  SAVE_POSITION,
  DELETE_SAVED_POSITION,

  UPDATE_CORRECTION_VALUES,
  APPLY_CORRECTION
} from './actions';

// {
//   positions: {
//     mortar: null,
//     target: null,
//   },
//   values: {
//     mortar: '',
//     target: ''
//     n: '',
//     s: '',
//     e: '',
//     w: ''
//   },
//   saved: []
// }
const rootReducer = (state = {}, action) => {
  switch (action.type) {
    case UPDATE_POSITION_VALUE:
      return Object.assign({}, state, {
        positions: Object.assign({}, state.positions, {
          [action.positionId]: Position.fromString(action.positionValue)
        }),
        values: Object.assign({}, state.values, {
          [action.positionId]: action.positionValue
        })
      });
    case LOAD_POSITION:
      return Object.assign({}, state, {
        positions: Object.assign({}, state.positions, {
          [action.positionId]: action.position
        }),
        values: Object.assign({}, state.values, {
          [action.positionId]: action.position.toStringShort()
        })
      });
    case DELETE_SAVED_POSITION:
      return Object.assign({}, state, {
        saved: state.saved.filter((_,i) => i !== action.index)
      });
    case SAVE_POSITION:
      return Object.assign({}, state, {
        saved: [
          {
            name: action.name !== undefined ? action.name : mnemonic(),
            position: state.positions[action.positionId]
          },
          ...state.saved]
      });
    case UPDATE_CORRECTION_VALUES:
      return Object.assign({}, state, {
        values: Object.assign({}, state.values, action.values)
      });
    case APPLY_CORRECTION:
      let { n, s, e, w } = state.values;

      const position = state.positions[action.positionId].translate(
          [(+e) - (+w), (+s) - (+n)]
         )
      ;

      if (!state.values.locked) {
        n = s = e = w = '';
      }

      return Object.assign({}, state, {
        positions: Object.assign({}, state.positions, {
          [action.positionId]: position
        }),
        values: Object.assign({}, state.values, {
          [action.positionId]: position.toStringShort(),
          n, s, e, w
        })
      });
    default:
      return state;
  }
};

export default rootReducer;
