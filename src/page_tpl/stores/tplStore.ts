import { observable, action, computed, makeObservable, runInAction } from 'mobx';
import { notify } from 'Notify';
import { localText } from '@/common/util-scada';
import { TEMPLATE_MODAL } from '@/common/constants';
import { _pageDao, daoIsOk } from '@/common/dao';

export interface IPage {
    id?: string;
    sign?: string;
    tag?: string;
    name?: string;
    image?: string;
    category_id?: string;
    category_name?: string;
    type?: number;
    editable?: boolean;
    product_owned?: boolean;
};

export interface IPageTpl {
    id?: string;
    name?: string;
    pages?: IPage[];
}

export interface ICategory {
    id: string;
    name: string;
}

export interface IModal {
    type?: TEMPLATE_MODAL,
    record?: any
}

export interface ITplState {
    isLoading: boolean;
    setLoading: (isLoading: boolean) => void;
    pageTpls: IPageTpl[];
    getPageTpls: () => Promise<any>;
    modalState: IModal;
    setModalState: (modalState: IModal) => void;
    searchText: string;
    setSearchText: (searchText: string) => void;
    categories: ICategory[];
    getCategories: () => void;
    allPages: IPage[];
    filterTpls: IPageTpl[];
    expandsTplIds: string[];
    setExpandsTplIds: (tplIds) => void;
    checkedPageIds: string[];
    checkCategory: (categoryId: string, checked: boolean) => void;
    checkPage: (pageId: string, checked: boolean) => void;
};

class TplState implements ITplState {
    constructor() {
        makeObservable(this);
    }

    @observable isLoading = false;
    @observable pageTpls: IPageTpl[] = [];
    @observable modalState = {};
    @observable searchText = '';
    @observable categories = [];
    @observable expandsTplIds = [];
    @observable checkedPageIds: string[] = [];

    @action
    setLoading(isLoading: boolean){
        this.isLoading = isLoading;
    }

    @action
    setSearchText(searchText){
        this.searchText = searchText;
    }

    @action
    async getPageTpls(): Promise<any> {
        const res = await _pageDao.getPageTplList();
        if (daoIsOk(res)) {
            runInAction(() => {
                this.pageTpls = res.data;
            });
        } else {
            if(res && String(res.code) === '30000'){
                notify(localText('TPL.MSG_UNLOGIN'));
            }
            runInAction(() => {
                this.pageTpls = [];
            });
        }
    }

    @action
    setModalState(modalState: IModal){
        this.modalState = modalState;
    }

    @action
    async getCategories(){
        const res = await _pageDao.getPageCategoryList();
        if (daoIsOk(res)) {
            runInAction(() => {
                this.categories = res.data;
            });
        } else {
            runInAction(() => {
                this.categories = [];
            });
        }
    }

    @computed
    get filterTpls(){
        if(!this.searchText) return this.pageTpls;
        let tpls: IPageTpl[] = [];
        this.pageTpls.map((pageTpl: IPageTpl) => {
            const copyTpl = JSON.parse(JSON.stringify(pageTpl));
            const include = copyTpl.name.indexOf(this.searchText) > -1 
                || copyTpl.pages.find(page => page.name.indexOf(this.searchText) > -1);
            if(include){
                copyTpl.pages = copyTpl.pages.filter(page => page.name.indexOf(this.searchText) > -1);
                tpls.push(copyTpl);
            }
        });
        return tpls;
    }

    @computed
    get allPages(){
        let pages: IPage[] = [];
        this.pageTpls.map((pageTpl: IPageTpl) => pages = pages.concat(pageTpl.pages || []));
        return pages;
    }

    @action
    setExpandsTplIds(tplIds=[]){
        this.expandsTplIds = tplIds;
    }

    @action
    checkCategory(categoryId, checked){
        const pages = this.pageTpls.find(f => f.id === categoryId)?.pages || [];
        const pagesIds = pages.map(p => p.id);
        const filterPageIds = this.checkedPageIds.filter(id => !pagesIds.includes(id));
        if(checked){
            this.checkedPageIds = filterPageIds.concat(pagesIds);
        }else{
            this.checkedPageIds = filterPageIds;
        }
    }

    @action
    checkPage(pageId: string, checked){
        const filterPageIds = this.checkedPageIds.filter(id => id !== pageId);
        if(checked){
            this.checkedPageIds = filterPageIds.concat([pageId]);
        }else{
            this.checkedPageIds = filterPageIds;
        }
    }
    
}

export default new TplState();