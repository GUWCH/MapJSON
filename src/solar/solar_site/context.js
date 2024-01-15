import { createContext } from 'react';
import { DATE_TYPE } from '../CONSTANT';
import { DateUtil } from '@/common/utils';

export const Actions = {
    INITIAL: 'INITIAL',
    SET_STATE: 'SET_STATE'
};

export const InitialState = {
    theme: {
        blackTranparent2: 'rgba(0, 0, 0, .2)',
        blackTranparent4: 'rgba(0, 0, 0, .4)',
        blackTranparent6: 'rgba(0, 0, 0, .6)',
        whiteTranparent6: 'rgba(255, 255, 255, .6)'
    },
    mounted: true,
    nodeAlias: '',
    nodeInfo: {},

    // node is token
    nodeToken: false,

    /**
     * single point real time data
     * @type {Object}
     * @property {String} 1:table:alias:field
     */
     pointRealData: {},

    /**
     * single point data
     * @type {Object}
     * @property {String} 1:table:alias:field
     */
    pointHisData: {},

    dateType: DATE_TYPE.DAY,

    // used by antd datepicker
    dateTime: DateUtil.getStdNowTime().split(' ')[0],

    // used by curve api
    dateRange: [DateUtil.getStdNowTime(true), DateUtil.getStdFromUTCTime(DateUtil.getUTCTime(DateUtil.getStdNowTime(true)) + 24 * 3600 * 1000)]
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
		default:
			throw new Error("Unexpected action");
    }
    
    if(process.env.NODE_ENV === 'development'){
        console.log('%cModule next state', 'color:#f00', nextState);
    }

    return nextState;
};

export const GlobalContext = createContext(InitialState);