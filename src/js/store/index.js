import { createStore } from 'redux'
import reducer from './../reducers/index'

import { applyMiddleware } from 'redux'




// var state = JSON.parse(localStorage.getItem('pageData'));
// console.log('=====================================', store);
// store.getState().canvasDrawing.rootReducer.present = state;


const logger = store => next => action => {
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

export default store;