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

export default Store;