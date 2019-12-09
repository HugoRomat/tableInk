import { createStore } from 'redux'
import reducer from './../reducers/index'

import { applyMiddleware } from 'redux'
// import WebSocket from 'websocket'
// // var WebSocketServer = require('websocket').server;
// console.log(WebSocket)
// var ws = new WebSocket('ws://10.159.2.39:8080');

// var state = JSON.parse(localStorage.getItem('pageData'));
// console.log('=====================================', store);
// store.getState().canvasDrawing.rootReducer.present = state;
var websocket = false;

if (websocket){
    var ws = new WebSocket('ws://10.159.2.39:8080');

    var previousAction = null;
    var isReceivedAction = false;
    
    console.log(ws)
    ws.onopen = function () {
        console.log('websocket is connected ...')
    }
    
    ws.onmessage = function (ev) {
        
    
        var action = JSON.parse(ev.data);

        if (action.type == 'workspace') console.log(action);

        if (action.type == 'setId') store.dispatch({'type': 'SET_UI_ID', 'data': action.data})
        if (action.type == 'GETworkspace') {
            var actualState = store.getState().rootReducer.present;
            // actualState.lettres = [];
            // actualState.lettres = [];
            var data = {'type': 'SETWorkspace', 'data': actualState}
            ws.send(JSON.stringify(data));
            // console.log(actualState)
            // store.dispatch({'type': 'SET_UI_ID', 'data': action.data})
        }
        if (action.type == 'INSTANTIATEworkspace') {
            store.dispatch({'type': 'SET_WORKSPACE', 'data': action.data})
        }
        else {
            isReceivedAction = true;
            store.dispatch(action)
        }
        
    }
}


const logger = store => next => action => {

    if (isReceivedAction == false && websocket) ws.send(JSON.stringify(action));
    else isReceivedAction = false;

    // console.log('HELLO', action)
    let result = next(action)
    return result
}

const crashReporter = store => next => action => {
try {
    return next(action)
} catch (err) {
    console.error('Caught an exception!', err)
    Raven.captureException(err, {
        extra: {
            action,
            state: store.getState()
        }
    })
    throw err
    }
}



const store = createStore(reducer,  applyMiddleware(logger, crashReporter));


// store.dispatch({'type': 'SET_UI_ID', 'data': 1})


export default store;