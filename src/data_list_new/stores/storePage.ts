import { observable, action, computed, makeObservable } from 'mobx';
import { GRADE } from '../constants';

export interface IPageState{
  grade: string;
  setGrade(grade: string): void;
  nodeAlias: string;
  setNodeAlias(nodeAlias: string): void;
  nodeType: string;
  setNodeType(nodeType: string): void;
  siteType: string;
  setSiteType(siteType: string): void;
  deviceType: string;
  setDeviceType(deviceType: string): void;
  getDeviceName(): string;
  deviceTypes: Array<any>;
  setDeviceTypes(deviceTypes: Array<any>): void;
  isLoading: boolean;
  setLoading(isLoading: boolean): void;
  data: Array<any>;
};

class PageState implements IPageState{
  rootStore: any;
  constructor(rootStore) {
    this.rootStore  = rootStore;
    makeObservable(this);
  }

  // 场站或设备
  grade = '';
  setGrade = (grade) => {
    this.grade = grade || '';
  }

  nodeAlias = '';
  setNodeAlias = (nodeAlias) => {
    this.nodeAlias = nodeAlias || '';
  }

  // 节点类型
  // memo使用
  @observable nodeType = '';
  @action setNodeType = (nodeType) => {
    this.nodeType = nodeType || '';
  }

  // 场站类型
  // memo使用
  @observable siteType = '';
  @action setSiteType = (siteType) => {
    this.siteType = siteType || '';
  }

  // memo使用
  @observable deviceType = '';
  @action setDeviceType = (deviceType) => {
    this.deviceType = deviceType || '';
  }
    /**
   * @typedef DT
   * @property {String} name
   * @property {String|Number} bay_value
   */
  /**
   * @type {DT[]}
   */
  @observable deviceTypes = [];
  @action setDeviceTypes = (deviceTypes) => {
    this.deviceTypes = deviceTypes;
  }

  getDeviceName = () => {
    if(!this.deviceType)return '';
    const device = this.deviceTypes.find(ele => ele.bay_value === this.deviceType);
    return device ? device.name : '';
  }

  @observable isLoading = false;
  @action setLoading = (isLoading) => {
    this.isLoading = isLoading;
  }

  @observable data = [];
}

export default PageState;