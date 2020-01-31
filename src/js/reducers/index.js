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
import strokesPalette from './../usecases/paletteLine.json';
// import tagsInterface from './../usecases/tagsInterface.json';

function importAll(r) { return r.keys().map(r); }
const images = importAll(require.context('./../usecases/demo', false, /\.(json)$/));
var galleryData = [];
images.forEach((d)=> {galleryData = galleryData.concat(d) })

const initialState = { 
    'sketchLines': [],
    'groupLines': [],
    'stickyLines': [],
    "menuItems": [],
    "lettres": [],
    "textes":[],
    'galleryItems': {
      'isOpen': false,
      'data': []

    },
    'UIid': 0,
    'tags':[],
    'tagsGroup':[],
    // 'tagsInterface': [], 
    'colorPalette':  {'lines':[]},
    'imagesCanvas': []
    ,
  };

    // console.log(galleryData)




var alphabet = 'abcdefghijklmnopqrstuvwxyz 1234567890?.!-:)(;'.split('');
var lettres = [];

alphabet.forEach((d)=>{
  lettres.push({'id':d, 'lines':[]})
})

// initialState.lettres = lettres; 
initialState.galleryItems.data = galleryData;
// initialState.tags = tags;
// initialState.tagsInterface = tagsInterface;

// initialState.groupLines = group
initialState.lettres = alphabetPerso0;

// initialState.voiceQueries = voice;
initialState.stickyLines = sticky;
// initialState.textes = [{"id":"b123453", 'content': 'hello world', 'position': [500,700]}]

initialState.sketchLines = strokes;
initialState.colorPalette.lines = strokesPalette;

// console.log(initialState)

  const rootReducer = (state = initialState, action) => {
    // console.log(action.type)
    

    // var placeHolder = JSON.parse(JSON.stringify(state.groupLines)).forEach((d, i)=> { 
    //   d.id = guid();
    //   d.model.id = guid();
    //   d.model.child = null;
    //   d.model.placeHolder.forEach((f)=>{f.lines.forEach((l)=> l.id = guid()) })
    //   console.log('=========================', i); 
    //   console.log(JSON.stringify(d.model)) 
    // })
    // console.log(JSON.stringify(state.tags));
    // console.log(JSON.stringify(state.groupLines));
    // console.log(JSON.stringify(state.sketchLines));
    switch (action.type) {
      
      case 'SET_GRID':
        state.grid = action.data.data;
        return state;

        case 'CLOSE_GALLERY':
          // console.log(action.data.isOpen)
          state = update(state, {  
            galleryItems: {
              isOpen : {$set: action.data.isOpen}
            }
          })
          return state;

      case 'ADD_TAG_CANVAS':return {  ...state, tagsInterface: [ ...state.tagsInterface, action.data] };
        
      //Add line to placeholder
      case 'ADD_LINE_TO_STICKY_GROUP':
        var id = action.data.idGroup;
        var where = action.data.where;
        var data = action.data.data;
        var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == id))
        if (index > -1){

          var indexLine = state.groupLines[index]['model']['placeHolder'].indexOf( state.groupLines[index]['model']['placeHolder'].find(x => x.id == where))
          if (indexLine > -1){

          
            state = update(state, { 
              groupLines: {
                [index] : {
                  model: {
                    placeHolder : {
                      [indexLine]: {
                          lines: {$push: data}
                        }
                    }
                  }
                }
              }
            })
            // console.log(state.groupLines[index]['model']['placeHolder'][indexLine])
          }
        }
        return state;


        case 'UPDATE_MODEL':
        var id = action.data.idGroup;
        
        var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == id))
        // console.log(index)
        if (index > -1){
          // console.log( action.data.model, index)
            state = update(state, { 
              groupLines: {
                [index] : {
                  model:  {$set: action.data.model}
                }
              }
            })
         
        }
        return state;

        case 'UPDATE_TAG_POSITION':
          var idTag = action.data.idTag;
          var position = action.data.position;
          var index = state.tags.indexOf(state.tags.find(x => x.id == idTag));
          
          if (index > -1){
            state = update(state, { 
              tags: {
                [index] : {
                  position:  {$set: position}
                }
              }
            })
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


        case 'UPDATE_WIDTH_HEIGHT_TAG':

          var id = action.data.idTag;
          var index = state.tags.indexOf(state.tags.find(x => x.id == id));
          if (index > -1){
            // console.log(state.tags[index])
            state = update(state, { 
              tags: {
                [index] : {
                  width:  {$set: action.data.width},
                  height:  {$set: action.data.height}
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
        

        case 'REMOVE_TAG_LINE':
          var idTag = action.data.idTag;
          var idLine = action.data.idLine
          var index = state.tags.indexOf(state.tags.find(x => x.id == idTag))
          if (index > -1){
    
              var indexLine = state.tags[index]['placeHolder'][0]['lines'].indexOf(state.tags[index]['placeHolder'][0]['lines'].find(x => x.id == idLine))
              console.log(indexLine)
              if (indexLine > -1){
                state = update(state, { 
                  tags: {
                    [index] : {
                      placeHolder: {
                        [0]: { 
                          lines: {$splice: [[indexLine, 1]]}
                        }
                      }
                      
                    }
                  }
                })
              }
            }


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
      
      case 'UPDATE_PLACEHOLDER':
        var id = action.data.id;
        var data = action.data.placeholder;
        var index = state.stickyLines.indexOf(state.stickyLines.find(x => x.id == id))
        if (index > -1){
          state = update(state, { 
            stickyLines: {
              [index] : {
                placeHolder: {$set: data}
              }
            }
          })
        }
        
        return state;

        case 'UPDATE_PLACEHOLDER_GROUP':
          var idGroup = action.data.idGroup;
          var data = action.data.model;
          var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == idGroup))

          // console.log( state.groupLines[index], data)
          if (index > -1){
            state = update(state, { 
              groupLines: {
                [index] : {
                  model: {$set: data}
                }
              }
            })
          }
          
          return state;
              



      case 'UPDATE_PLACEHOLDER':
        var id = action.data.id;
        var data = action.data.placeholder;
        var index = state.stickyLines.indexOf(state.stickyLines.find(x => x.id == id))
        if (index > -1){
          state = update(state, { 
            stickyLines: {
              [index] : {
                placeHolder: {$set: data}
              }
            }
          })
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


  case 'SWIPE_GROUP':
    var idGroup = action.data.id;
    var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == idGroup))
    // console.log(index)
    if (index > -1){
        state = update(state, { 
          groupLines: {
            [index] : {
              swipe: {$set: action.data.swipe}
            }
          }
        })
    }
    
    return state;


    case 'TAP_GROUP':
      var idGroup = action.data.id;
      var index = state.groupLines.indexOf(state.groupLines.find(x => x.id == idGroup))
      // console.log(index)
      if (index > -1){
          state = update(state, { 
            groupLines: {
              [index] : {
                tap: {$set: action.data.tap}
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
        // if (action.data.data.sizeStroke > 10){
        //   return { 
        //     ...state, 
        //     sketchLines: [ action.data, ...state.sketchLines] 
        //   };
        // } else {
          return { 
            ...state, 
            sketchLines: [ ...state.sketchLines, action.data] 
          };
        // }
      
        
      case 'ADD_IMAGE': 
      // console.log(action.data)
        state = update(state, { imagesCanvas:{$push: [action.data]}})
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
        // console.log('HEYYYY', action.data)
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


          case 'CHANGE_STROKE_PROPERTIES':

              var id = action.data.id;
              var index = state.sketchLines.indexOf(state.sketchLines.find(x => x.id == id))
              // console.log(state.sketchLines, id, index)
                if (index > -1){
                  // console.log(position)
                  state = update(state, { 
                    sketchLines: {
                      [index] : {$set: action.data.data},
                      
                    }
                  })
                }
              
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

          case 'ADD_PALETTE_LINE':  
          // return { ...state, colorPalette[lines]: [ action.data, ...state.sketchLines] };
           state = update(state, { colorPalette: {lines :  {$push: [action.data]}}})
           return state;

          case 'REMOVE_PALETTE_LINE':
              var idToDelete = action.data;
              // console.log(state.colorPalette)
              var index = state.colorPalette.lines.indexOf(state.colorPalette.lines.find(x => x.id == idToDelete))
              if (index > -1) state = update(state, { colorPalette: { lines: {$splice: [[index, 1]]}} })

              return state;
          
        
      default:
        return state;
    }
  }
    

  export default combineReducers({
    rootReducer : undoable(rootReducer)
  })

  