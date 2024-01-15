import React, { createContext, useReducer, useContext } from 'react';
import PageState, { IPageState } from './storePage';
import DataState, { IDataState } from './storeData';

class Store {
    pageState: IPageState;
    dataState: IDataState;
    constructor() {
        this.pageState = new PageState(this);
        this.dataState = new DataState(this);
    }
}

// for class
const StoresContext = createContext(new Store());

// for FC
export const useStores = () => useContext(StoresContext);

export default StoresContext;