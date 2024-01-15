import { observable, action, computed, makeObservable } from 'mobx';

export interface IState{
  cfg: {[key: string]: any}
};

class State implements IState{
  constructor() {
    makeObservable(this);
  }

  isDev = process.env.NODE_ENV === 'development';

  @observable isLoading = false;
  @action setLoading(isLoading){
    this.isLoading = isLoading;
  }

  @observable cfg = {};
  @action setCfg(cfg){
    this.cfg = cfg;
  }
}

export default new State();