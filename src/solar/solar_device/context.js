import { createContext } from 'react';
import { BStools } from '../../common/utils';
import Tab from './components/tab';

const flag = BStools.getQueryString('flag');
const device = BStools.getQueryString('device');

export const Actions = {
    INITIAL: 'INITIAL',
    SET_STATE: 'SET_STATE',
    SET_DETAIL: 'SET_DETAIL',
    SET_FLAG_CACHE: 'SET_FLAG_CACHE',
    RESTORE: 'RESTORE',
    LOADING: 'LOADING',
    UNLOADING: 'UNLOADING'
};

export const FlagCache = {
    flag: '',
    sortColumn: '',
    sortDir: '',
    page: 0,
    pageSize: 50,
    columnResize: {},
    searchText: '',

    /**
     * @typedef STATUS
     * @property {String} name
     * @property {String|Number} value
     * @property {String} color
     * @property {Boolean} valid
     */

    /**
     * @type {STATUS[]}
     */
    statusList: [],
    iconSize: 1,
    iconRowNum: 1,
    iconMarginRight: 0,
    iconShortRowNum: 1,
    iconShortMarginRight: 0,

    /**
     * 置顶别名
     * @type {String[]}
     */
    topData: [],
    /**
     * topData存储数据库里数据ID
     */
    topDbId: undefined
};

export const InitialState = {
    isLoading: false,
    isMain: !(flag && device),
    mainFlag: flag || '',
    mainFlagName: '',
    mainTypes: [],

    /**
     * @type {Tab[]}
     */
    tabs: [],

    flagCache: {

    },

    detailAlias: device || '',
    detailName: '',

    /**
     * @typedef Detail
     * @property {string} name
     * @property {string} alias
     */

    /**
     * @type {Detail[]}
     */
    detailSiblings: [],

    theme: {
        blackTranparent2: 'rgba(0, 0, 0, .2)',
        blackTranparent4: 'rgba(0, 0, 0, .4)',
        blackTranparent6: 'rgba(0, 0, 0, .6)',
        whiteTranparent6: 'rgba(255, 255, 255, .6)',
        whiteTranparent2: 'rgba(255, 255, 255, .2)'
    },
    isDevelopment: process.env.NODE_ENV === 'development'
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
        case Actions.RESTORE: {
            nextState = {
                ...state,
                ...{
                    isMain: true,
                    detailAlias: '',
                    detailName: ''
                }
            };
            break;
        }
        case Actions.INITIAL: {
            let { tabs=state.tabs, flag=state.mainFlag, flagCache=state.flagCache, ...rest } = restPayload;
            let matchTab = tabs.filter(tab => tab.getFlag() === flag)[0];
            let temp = {};
            tabs.forEach(t => {
                temp[t.getFlag()] = Object.assign({}, FlagCache, flagCache[t.getFlag()] || {});
            });

            nextState = {
                ...state,
                ...{
                    tabs: tabs, 
                    mainFlag: flag,
                    mainFlagName: matchTab.getName(),
                    mainTypes: matchTab.getType(),
                    flagCache: temp
                },
                ...rest
            };
            break;
        }
        case Actions.SET_DETAIL: {
            nextState = {
                ...state,
                ...{
                    isMain: false
                },
                ...restPayload
            };
            break;
        }
        case Actions.SET_FLAG_CACHE: {
            let { flagCache } = state;
            let { cache={}, ...rest } = restPayload;
            let { flag } = cache;

            nextState = {
                ...state,
                ...{
                    flagCache: Object.assign(
                        {}, 
                        flagCache, 
                        {[flag]: Object.assign({}, flagCache[flag], cache)}
                    )
                },
                ...rest
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