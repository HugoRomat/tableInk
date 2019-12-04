import {guid} from './../components/Helper';
import update from 'immutability-helper';
import { combineReducers } from 'redux';
import undoable, { distinctState } from 'redux-undo';
import { includeAction, excludeAction } from 'redux-undo';

import alphabetPerso from './../usecases/alphabet.json';
import strokes from './../usecases/strokes.json';
import galleryItems from './../usecases/galleryItems.json';
import sticky from './../usecases/sticky.json';

const initialState = { 
    'sketchLines': [],
    'groupLines': [],
    'stickyLines': [],
    "menuItems": [],
    "lettres": [],
    "textes":[],
    'galleryItems': []
  };

    // console.log(alphabetPerso)




var alphabet = 'abcdefghijklmnopqrstuvwxyz '.split('');
var lettres = [];

alphabet.forEach((d)=>{
  lettres.push({'id':d, 'lines':[]})
})

initialState.lettres = lettres; 
initialState.galleryItems = galleryItems;





initialState.lettres = alphabetPerso;

// initialState.groupLines =
initialState.stickyLines = sticky;
initialState.textes = [{"id":"b123453", 'content': 'hello world', 'position': [500,700]}]

initialState.sketchLines = strokes

  const rootReducer = (state = initialState, action) => {
    // console.log(action.type)
    // console.log(JSON.stringify(state.groupLines));
    switch (action.type) {
      
      //Add line to placeholder
      case 'ADD_LINE_TO_STICKY_GROUP':
        var id = action.data.idGuide;
        var where = action.data.where;
        var data = action.data.data;
        var index = state.stickyLines.indexOf(state.stickyLines.find(x => x.id == id))
        if (index > -1){

          var indexLine = state.stickyLines[index]['placeHolder'].indexOf(state.stickyLines[index]['placeHolder'].find(x => x.id == where))
          if (indexLine > -1){

          // console.log(index, indexLine)
            state = update(state, { 
              stickyLines: {
                [index] : {
                  placeHolder: {
                    [indexLine]: { 
                      lines: {$push: data}
                    }
                  }
                  
                }
              }
            })
          }
        }
        
        return state;

      case 'ADD_TEXT':
        // console.log('GO', action.data)
          return { 
            ...state, 
            textes: [ ...state.textes, action.data] 
          };

        case 'ADD_LINES_LETTER':
          var idLetter = action.data.id;
          var line = action.data.line;
          var index = state.lettres.indexOf(state.lettres.find(x => x.id == idLetter));
          // console.log(index)
          if (index > -1){
            state = update(state, { 
              lettres: {
                [index] : {
                  lines: {$push: [{'id': action.data.idLine, 'points': line}]}
                }
              }
            })
          }
          console.log(state.lettres)
        return state;

      case 'ADD_SKETCH_LINE':
        return { 
          ...state, 
          sketchLines: [ ...state.sketchLines, action.data] 
        };

      case 'CHANGE_MODEL_GROUP_LINES':
        var idsGroup = action.data.idGroups;
        idsGroup.forEach((id)=>{
          var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == id));
          // console.log(state.groupLines[index])
          if (index > -1){
            state = update(state, { 
              groupLines: {
                [index] : {
                  model: {$set: action.data.model},
                }
              }
            })
          }
        })
        return state;

        

      case 'MOVE_SKETCH_LINES':
        // console.log('HEYYYY')
        action.data.forEach((element)=>{
          var id = element.id;
          var position = element.position;
          var index = state.sketchLines.indexOf(state.sketchLines.find(x => x.id == id))
          // console.log(state.sketchLines[index])
            if (index > -1){
              state = update(state, { 
                sketchLines: {
                  [index] : {
                    position: {$set: position},
                  }
                }
              })
            }
          })
          return state;
        
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
      
      
        case 'SHOULD_OPEN_MENU':
        if (action.data.shouldOpen == true){
          return { 
            ...state, 
            menuItems: [ ...state.menuItems, action.data] 
          };
        }
        else if (action.data.shouldOpen == false){
          var index = state.menuItems.indexOf(state.menuItems.find(x => x.id == action.data.id))
          if (index > -1){
            state = update(state, { 
              menuItems: {$splice: [[index, 1]]}
            })
          }
          return state;
        }
         
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
          var id = action.data.id;
          console.log(action.data)
          // 'data': {'linesAttached': this.objectIn}, 
          // idsLine.forEach((id)=>{
            var index = state.stickyLines.indexOf(state.stickyLines.find(x => x.id == id))
            // console.log(index)
            if (index > -1){
              console.log(action.data, state.stickyLines[index])
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
      case 'ADD_GUIDE_TO_STICKY':
          state = update(state, { 
            stickyLines: {$push: [action.data]},
          })
        return state;


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

  