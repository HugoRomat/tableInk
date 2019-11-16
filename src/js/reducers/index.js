import {guid} from './../components/Helper';
import update from 'immutability-helper';
import { combineReducers } from 'redux';
import undoable, { distinctState } from 'redux-undo';
import { includeAction, excludeAction } from 'redux-undo';

const initialState = { 
    sketchLines: [],
    groupLines: [],
    stickyLines: []
  };

  const rootReducer = (state = initialState, action) => {
    // console.log(action.type)
    switch (action.type) {
      
      case 'ADD_SKETCH_LINE':
        // console.log(state.sketchLines)
        return { 
          ...state, 
          sketchLines: [ ...state.sketchLines, action.data] 
        };
        case 'CREATE_STICKY_LINES':
            return { 
              ...state, 
              stickyLines: [ ...state.stickyLines, action.data] 
            };
      case 'CREATE_GROUP_LINES':
        return { 
          ...state, 
          groupLines: [ ...state.groupLines, action.data] 
        };
      case 'ADD_LINES_CLASS':
        var idsLine = action.data.idLines;
       
        idsLine.forEach((id)=>{
          var index = state.sketchLines.indexOf(state.sketchLines.find(x => x.id == id))
          if (index > -1){
            // console.log(state.sketchLines[index]['data']['class'])
            state = update(state, { 
              sketchLines: {
                [index] : {
                  data: {
                    class: {$push: action.data.class},
                  }
                }
              }
            })
          }
        })
        return state;


        case 'ADD_LINES_TO_STICKY':
          var idLine = action.data.id;
          console.log(action.data.idLines)
          // 'data': {'linesAttached': this.objectIn}, 
          // idsLine.forEach((id)=>{
            var index = state.stickyLines.indexOf(state.stickyLines.find(x => x.id == idLine))
            if (index > -1){
              // console.log(state.sketchLines[index]['data']['class'])
              state = update(state, { 
                stickyLines: {
                  [index] : {
                    data: {
                      linesAttached: {$push: action.data.idLines},
                    }
                  }
                }
              })
            }
          
          return state;

        
        // console.log(action.data)

      case 'REMOVE_SKETCH_LINES':
          var idsToDelete = action.data;
          idsToDelete.forEach((idToDelete)=>{
            var index = state.sketchLines.indexOf(state.sketchLines.find(x => x.id == idToDelete))
            if (index > -1){
              state = update(state, { 
                sketchLines: {$splice: [[index, 1]]}
              })
            }
          })
          return state;

        
        
      default:
        return state;
    }
  }
    

  export default combineReducers({
    rootReducer : undoable(rootReducer)
  })

  