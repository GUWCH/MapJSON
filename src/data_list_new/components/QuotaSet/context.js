import { createContext } from 'react';

export const Actions = {
    INITIAL: 'INITIAL',
    SET_STATE: 'SET_STATE',
    RESET: 'RESET'
};

export const InitialState = {
    listType: '',
    quotaData: {},
    functionData: {},
    quotaOptions: {}
};

export const GlobalReducer = (state = InitialState, action) => {
    if(process.env.NODE_ENV === 'development'){
        console.log('%cModule prev state', 'color:#f00', state);
	    console.log('%cModule action', 'color:#0f0', action);
    }	

    const { type=Actions.SET_STATE, ...restPayload } = action;
    let nextState;
	switch (type) {
        case Actions.SET_STATE: {
            nextState = {
                ...state,
                ...restPayload
            };
            break;
        }
        case Actions.INITIAL: {
            nextState = {
                ...state,
                ...restPayload
            };
            break;
        }

        case Actions.RESET: {
            nextState = {
                ...state,
                ...restPayload
            };
            break;
        }
		default:
			throw new Error("Unexpected action");
    }
    
    if(process.env.NODE_ENV === 'development'){
        console.log('%cModule next state', 'color:#f00', nextState);
    }

    return nextState;
};

export const GlobalContext = createContext(InitialState);