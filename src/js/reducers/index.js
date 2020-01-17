import {guid} from './../components/Helper';
import update from 'immutability-helper';
import { combineReducers } from 'redux';
import undoable, { distinctState } from 'redux-undo';
import { includeAction, excludeAction } from 'redux-undo';

import alphabetPerso0 from './../usecases/alphabet0.json';
import alphabetPerso1 from './../usecases/alphabet1.json';
import strokes from './../usecases/strokes.json';
// import galleryItems from './../usecases/galleryItems.json';
// import sticky from './../usecases/sticky2.json';
import group from './../usecases/groupLines.json';
import tables from './../usecases/tables.json';
import tags from './../usecases/tags.json';
import sticky from './../usecases/newSticky.json';
import voice from './../usecases/voiceQuery.json';


function importAll(r) { return r.keys().map(r); }
const images = importAll(require.context('./../usecases/demo', false, /\.(json)$/));
var galleryData = [];
images.forEach((d)=> {galleryData = galleryData.concat(d) })
// console.log(galleryData)


const initialState = { 
    'sketchLines': [],
    'groupLines': [],
    'stickyLines': [],
    "menuItems": [],
    "lettres": [],
    "textes":[],
    'galleryItems': [],
    'UIid': 0,
    'tags':[],
    'tagsGroup':[],
    'tables': [],
    'grid': false,
    'voiceQueries': [],
    'tagsInterface': [],
    'colorPalette':  {'lines':[]},
    'imagesCanvas': []
    ,
  };

    // console.log(alphabetPerso)




var alphabet = 'abcdefghijklmnopqrstuvwxyz 1234567890?.!-:)(;'.split('');
var lettres = [];

alphabet.forEach((d)=>{
  lettres.push({'id':d, 'lines':[]})
})

// initialState.lettres = lettres; 
initialState.galleryItems = galleryData;
initialState.tags = tags
// initialState.tables = tables
initialState.lettres = alphabetPerso0;
voice
initialState.voiceQueries = voice
initialState.stickyLines = sticky;
initialState.textes = [{"id":"b123453", 'content': 'hello world', 'position': [500,700]}]

initialState.sketchLines = strokes

  const rootReducer = (state = initialState, action) => {
    // console.log(action.type)
    // console.log(JSON.stringify(state.voiceQueries));
    switch (action.type) {
      
      case 'SET_GRID':
        state.grid = action.data.data;
        return state;

      case 'ADD_TAG_CANVAS':return {  ...state, tagsInterface: [ ...state.tagsInterface, action.data] };
        
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


        case 'ADD_TAG_SNAPPED':
          var receiver = action.data.idReceiver;
          var sender = action.data.idSender;
          var index = state.tags.indexOf(state.tags.find(x => x.id == sender));
          var indexReceiver = state.tags.indexOf(state.tags.find(x => x.id == receiver));
          var data = JSON.parse(JSON.stringify(state['tags'][index]))
          // console.log(state['tags'][index], state['tags'][indexReceiver])
          if (indexReceiver > -1){
            state = update(state, { 
              tags: {
                [indexReceiver] : {
                  tagSnapped: {$push: [data]}
                }
              }
            })
          }
          
        return state;


        case 'REMOVE_TAG':
          var index = state.tags.indexOf(state.tags.find(x => x.id == action.data))
          if (index > -1){
            // console.log(JSON.parse(JSON.stringify(state.tags)))
            state = update(state, { 
              tags: {$splice: [[index, 1]]}
            })
          }
          // console.log(JSON.parse(JSON.stringify(state.tags)))
          return state;
        
        case 'ADD_LINE_TO_STICKY_TAG':
            var id = action.data.idTag;
            var where = action.data.where;
            var data = action.data.data;
            var index = state.tags.indexOf(state.tags.find(x => x.id == id))
            if (index > -1){
    
              var indexLine = state.tags[index]['placeHolder'].indexOf(state.tags[index]['placeHolder'].find(x => x.id == where))
              if (indexLine > -1){
                state = update(state, { 
                  tags: {
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
    
      case 'ADD_TAG': return {  ...state, tags: [ ...state.tags, action.data] };
      case 'ADD_VOICE_QUERIES': return {  ...state, voiceQueries: [ ...state.voiceQueries, action.data] };
    
      case 'CREATE_TABLES':
        return {  ...state, tables: [ ...state.tables, action.data] };

      case 'ADD_TO_TABLE':
          var index = state.tables.indexOf(state.tables.find(x => x.id == action.data.idTable));
          if (index > -1){
            var indexParent = state.tables[index]['data'].indexOf(state.tables[index]['data'].find(x => x.id == action.data.idParent))
            if (indexParent > -1){
              state = update(state, { 
                tables: {
                  [index] : {
                    data: {
                      [indexParent]: { 
                        children: {$push: [action.data.data]}
                      }
                    }
                    
                  }
                }
              })
              state = update(state, { 
                tables: {
                  [index] : {
                    data: {$push: [{'id':action.data.data.id, 'children':[]}]}
                  }
                }
              })
            }
          }
          return state;
          // console.log(index, indexParent)

        
      case 'SET_WORKSPACE':
          console.log('GO', action)

          state.sketchLines = action.data.sketchLines
          state.groupLines = action.data.groupLines
          state.stickyLines = action.data.stickyLines
          state.menuItems = action.data.menuItems
          state.textes = action.data.textes
          state.galleryItems = action.data.galleryItems

          return state;


      case 'SET_UI_ID':
        // state.UIid = action.data;

        // console.log(action.data, state.lettres)

        // if (action.data == 0) state.lettres = alphabetPerso0;
        // else if (action.data == 1) state.lettres = alphabetPerso1;
        return state;


      case 'ADD_TEXT':
        // console.log('GO', action.data)
          return { 
            ...state, 
            textes: [ ...state.textes, action.data] 
          };

      case 'ADD_TAG_TO_GROUP':
          return { 
            ...state, 
            tagsGroup: [ ...state.tagsGroup, action.data] 
          };


          case 'ADD_LINE_EXISTING_GROUP':
            var idGroup = action.data.idGroup;
            var idLine = action.data.idLine;
            // var idLine = action.data.idLine;
            var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == idGroup))
            if (index > -1){
                state = update(state, { 
                  groupLines: {
                    [index] : {
                      lines: {
                        [action.data.iteration]: {$push: idLine}
                      }
                   }
                  }
                })
            }
            
            return state;



      case 'ADD_LINE_TO_GROUP':
          var id = action.data.idGroup;
          var data = action.data.idLine;
          var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == id))
          if (index > -1){
              state = update(state, { 
                groupLines: {
                  [index] : {
                    lines: {$push: data}
                 }
                }
              })
          }
          
          return state;
          
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
          // console.log(state.lettres)
        return state;

      case 'ADD_SKETCH_LINE':
        // console.log(action.data.data.sizeStroke)
        if (action.data.data.sizeStroke > 10){
          return { 
            ...state, 
            sketchLines: [ action.data, ...state.sketchLines] 
          };
        } else {
          return { 
            ...state, 
            sketchLines: [ ...state.sketchLines, action.data] 
          };
        }
      
        
      case 'ADD_IMAGE': 
      // console.log(action.data)
        state = update(state, { imagesCanvas:{$push: [action.data]}})
        return state;

      case 'ADD_PALETTE_LINE':  
        // return { ...state, colorPalette[lines]: [ action.data, ...state.sketchLines] };
         state = update(state, { colorPalette: {lines :  {$push: [action.data]}}})
         return state;

        
      case 'CHANGE_MODEL_GROUP_LINES':
        var idsGroup = action.data.idGroups;
        // console.log(action.data.model)
        idsGroup.forEach((id)=>{
          var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == id));
          // console.log(index)
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
              // console.log(position)
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

      case 'UPDATE_GROUP_POSITION':
        
          var id = action.data.id;
          var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == id))
          // console.log(state.sketchLines[index])
          if (index > -1){
            // console.log('GOOO')
            state = update(state, { 
              groupLines: {
                [index] : {
                  position: {$set: action.data.position},
                }
              }
            })
          }
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
          // console.log(action.data)
          // 'data': {'linesAttached': this.objectIn}, 
          // idsLine.forEach((id)=>{
            var index = state.stickyLines.indexOf(state.stickyLines.find(x => x.id == id))
            // console.log(index)
            if (index > -1){
              // console.log(action.data, state.stickyLines[index])
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




        case 'ADD_TAG_GUIDE':
            var id = action.data.idGuide;
            var index = state.stickyLines.indexOf(state.stickyLines.find(x => x.id == id))
            console.log(index)
            if (index > -1){
              
              state = update(state, { 
                stickyLines: {
                  [index] : {
                    tag: {$set: action.data.tag},
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
        // console.log(state.sketchLines)
          var idsToDelete = action.data;
          idsToDelete.forEach((idToDelete)=>{
            var index = state.sketchLines.indexOf(state.sketchLines.find(x => x.id == idToDelete))
            if (index > -1){
              state = update(state, { 
                sketchLines: {$splice: [[index, 1]]}
              })
            }
          })
          // console.log(state.sketchLines)
          return state;

        
        
      default:
        return state;
    }
  }
    

  export default combineReducers({
    rootReducer : undoable(rootReducer)
  })

  