/* eslint-disable */
import React, { useContext, useReducer, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Actions, GlobalContext, GlobalReducer, InitialState } from './context';
import Sites from './Sites';

function App(){
    const [state, dispatch] = useReducer(GlobalReducer, InitialState);

    return(
        <GlobalContext.Provider value={{ state, dispatch }}>
            <Sites />
        </GlobalContext.Provider>
    );
}

if(process.env.NODE_ENV === 'development'){
    ReactDOM.render(<App />, document.getElementById('center'));
}else{
    ReactDOM.render(<App />, document.getElementById('container'));
}

export default App;

/* eslint-enable */