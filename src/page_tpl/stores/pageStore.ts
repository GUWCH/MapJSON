import { observable, action, computed, makeObservable } from 'mobx';
import { THEME_UI } from '@/common/constants';

export interface IPageState{
  theme: THEME_UI;
  setTheme: (theme: THEME_UI) => void;
  isLoading: boolean;
  setLoading(isLoading: boolean): void;
  editable: boolean;
  setEditable(editable: boolean): void;
};

class PageState implements IPageState{
  constructor() {
    makeObservable(this);
  }

  @observable isLoading = false;
  @action setLoading(isLoading){
    this.isLoading = isLoading;
  }

  @observable theme = THEME_UI.DEFAULT;
  @action setTheme(theme){
    this.theme = theme;
  }

  @observable editable = true;
  @action setEditable(editable){
    this.editable = editable;
  }
}

export default new PageState();