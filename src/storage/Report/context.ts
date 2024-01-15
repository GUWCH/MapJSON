import * as React from 'react';

export const initialState = {
    isLoading: false
};

type TActions = 'loading' | 'unLoading';

export const reducer = (prevState: typeof initialState, action: {type: TActions}) => {
    let newState = { ...prevState }
    switch (action.type) {
        case 'loading':
            newState.isLoading = true;
            return newState;
        case "unLoading":
            newState.isLoading = false;
            return newState;
        default: 
            return newState;
    }
}

export const GlobalContext = React.createContext<{
    state: typeof initialState;
    dispatch: React.Dispatch<{type: TActions}>
}>({state: initialState, dispatch: () => null});