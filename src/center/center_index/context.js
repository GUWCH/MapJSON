import { createContext } from 'react';
import { POINT_TABLE } from '../../common/constants';
import ScadaCfg from '../../common/const-scada';

let currentNodeAlias = ScadaCfg.getCurNodeAlias() || '';
let currentName = '';

if (process.env.NODE_ENV === 'development') {
    currentNodeAlias = 'USCADA.Farm.SolarStatistics';
    currentName = 'Test';
}

// 光伏统计点别名可能与节点别名不一致, 需要使用光伏特定别名
let fixStatAlias = `${currentNodeAlias.split('.')[0]}.${POINT_TABLE.SOLAR_STAT}`;

export const Actions = {
    SET_STATE: 'SET_STATE',
    LOADING: 'LOADING',
    UNLOADING: 'UNLOADING'
};

export const InitialState = {
    mapMounted: false,
    collapse: false,
    rootAlias: currentNodeAlias,
    currentAlias: fixStatAlias,
    updateAlias: fixStatAlias,
    updateName: currentName,
    solarFacs: [],
    dynData: {},
    powerData: [],
    prodData: [],
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