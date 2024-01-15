import { createContext } from 'react';
import { VALUES } from '../../common/constants';

export const Actions = {
    SET_STATE: 'SET_STATE',
    LOADING: 'LOADING',
    UNLOADING: 'UNLOADING'
};

export const InitialState = {
    tab: 0,
    data: [],
    topMemoId: undefined,
    topData: [],
    statusList: [],
    status: VALUES.NEGATIVE_ONE,
    search: '',
    gridCache: {
        sortColumn: '',
        sortDir: '',
        page: 0,
        pageSize: 50
    },
    tokenData: [],
    historyData: {},
    loading: false
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
        case Actions.LOADING: {
            nextState = {
                ...state,
                ...{
                    isLoading: true
                }
            };
            break;
        }
        case Actions.UNLOADING: {
            nextState = {
                ...state,
                ...{
                    isLoading: false
                }
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