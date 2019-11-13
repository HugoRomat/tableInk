import {guid} from './../components/Helper';
import update from 'immutability-helper';
import { combineReducers } from 'redux';
import undoable, { distinctState } from 'redux-undo';
import { includeAction, excludeAction } from 'redux-undo';

const initialState = { 
    sketchLines: []
  };

  const rootReducer = (state = initialState, action) => {
    // console.log(action.type)
    switch (action.type) {
      
      case 'ADD_SKETCH_LINE':
        return { 
          ...state, 
          sketchLines: [ ...state.sketchLines, action.data] 
        };

      default:
        return state;
    }
  }
    

  export default combineReducers({
    rootReducer : undoable(rootReducer)
  })

  