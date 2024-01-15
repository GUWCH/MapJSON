import { createContext } from 'react';
import { TGlobalState } from '../../types';

export enum Actions {
    INITIAL = 'INITIAL',
    SET_STATE = 'SET_STATE',
    RESET = 'RESET'
};

export const initialState: TGlobalState = {
    listType: '',
    quotaData: {},
    functionData: {},
    otherData: {},
    quotaOptions: {},
    filterGroups: []
};

export const GlobalReducer: React.Reducer<TGlobalState, { type?: Actions } & Partial<TGlobalState>> = (
    state = initialState, action
) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('%cModule prev state', 'color:#f00', state);
        console.log('%cModule action', 'color:#0f0', action);
    }

    const { type = Actions.SET_STATE, ...restPayload } = action;
    let nextState: TGlobalState;
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

    if (process.env.NODE_ENV === 'development') {
        console.log('%cModule next state', 'color:#f00', nextState);
    }

    return nextState;
};

type TGlobalContextValue = {
    state: TGlobalState
    dispatch: React.Dispatch<React.ReducerAction<typeof GlobalReducer>>
}
export const GlobalContext = createContext<TGlobalContextValue>({
    state: initialState,
    dispatch: () => console.log('dispatch not initialized')
});