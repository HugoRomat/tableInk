import {guid} from './../components/Helper';
import update from 'immutability-helper';
import { combineReducers } from 'redux';
import undoable, { distinctState } from 'redux-undo';
import { includeAction, excludeAction } from 'redux-undo';

// const initialState = { 
//     sketchLines: [],
//     groupLines: [],
//     stickyLines: []
//   };


  const initialState = {
    "sketchLines":[{"points":[[560,272],[556.5,273.5],[553.5,276],[550.5,280],[546.5,285.5],[543.5,293],[541.5,301],[540,309],[540,317],[541.5,324],[544,331],[548,336.5],[553,341.5],[559,344.5],[566,346],[573,345.5],[580,342],[586,337.5],[591.5,332],[596,326],[599,319.5],[600.5,313.5],[601,308.5],[600.5,304],[598.5,301],[595.5,298.5],[591.5,296.5],[587,294.5],[581.5,293],[576.5,291],[571,289],[565.5,287.5],[561,286],[557.5,285.5],[554.5,286.5],[552.5,290.5]],"data":{"class":["item-b63b972fc25d021aea607f8de99051f12"]},"id":"bb82f26615bcd7c3e47e597d89e2fce2c","position":[0,0]},{"points":[[523,412],[522,417.5],[522.5,423],[524.5,428.5],[528,433.5],[531.5,437.5],[536.5,441],[542.5,442.5],[548.5,443],[555,441.5],[561,439],[566.5,435],[571.5,430],[575.5,423],[578,416],[579.5,408.5],[580,400.5],[579,392.5],[577,385.5],[573.5,379.5],[569,374.5],[564,370.5],[558.5,368],[552,367.5],[546,368.5],[540,371],[534.5,375],[529.5,380.5],[526,387],[524,394.5],[523,402],[524,410.5],[526,419.5]],"data":{"class":["item-b63b972fc25d021aea607f8de99051f12"]},"id":"b795f6ee47df6aac4e2dc510006b2c2ce","position":[0,0]},{"points":[[535,492.5],[532,495],[529,499.5],[526.5,504],[524.5,509.5],[523.5,515],[524,520.5],[525.5,525.5],[528,529.5],[531.5,533.5],[536.5,535.5],[542.5,537],[549,536.5],[556,535],[562.5,531.5],[569,526.5],[574,521.5],[578,515],[581,508.5],[582.5,502],[583,496.5],[581.5,491.5],[579.5,487.5],[575.5,484],[571,481.5],[566,480],[560.5,479.5],[555,480],[549,482],[543.5,484.5],[539.5,488],[535.5,492.5],[532.5,497.5]],"data":{"class":["item-b63b972fc25d021aea607f8de99051f12"]},"id":"b55509dd13ce7f75a21d00a50a2b697ba","position":[0,0]}],
    "groupLines":[],
    "stickyLines":[{"points":[[602,201.5],[599,207.5],[595,216.5],[589.5,227],[584.5,238],[579.5,250],[574.5,263.5],[569.5,278],[565,293],[560,309],[556,325],[553,341],[549.5,357.5],[546.5,374],[543.5,390.5],[540.5,408],[538,426.5],[536.5,445.5],[535,466.5],[534.5,488.5],[534.5,510],[535.5,531.5],[536.5,551.5],[538.5,568.5],[541,583.5],[543.5,596.5],[545.5,606.5],[548,614.5],[550.5,620.5],[551.5,625],[552,628.5],[552,630.5],[551.5,633]],"data":{"linesAttached":["bb82f26615bcd7c3e47e597d89e2fce2c","b795f6ee47df6aac4e2dc510006b2c2ce","b55509dd13ce7f75a21d00a50a2b697ba"]},"id":"b63b972fc25d021aea607f8de99051f12","position":[0,0]}],
    "menuItems": []
  }

  const rootReducer = (state = initialState, action) => {
    // console.log(action.type)
    // console.log(JSON.stringify(state))
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

  