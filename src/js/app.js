import React from 'react';
import ReactDOM from 'react-dom';
// import Document from './components/TextSelection/Document'
import Document from './components/Document'
import store from './store';
import { Provider } from 'react-redux';
// import Document from './components/FolderSelection/Document'
//  console.log(store.getState());
ReactDOM.render(
    <Provider store={store} >
        <Document/> 
    </Provider>,
    document.getElementById('root')
);