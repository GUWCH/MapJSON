import { observable, action, makeObservable } from 'mobx';

export interface IPageState{
  grade: string;
  setGrade(grade: string): void;
  nodeAlias: string;
  setNodeAlias(nodeAlias: string): void;
  nodeType: string;
  setNodeType(nodeType: string): void;
  siteType: string;
  setSiteType(siteType: string): void;
  deviceType: string | number;
  setDeviceType(deviceType: string | number): void;
  getDeviceName(): string;
  deviceTypes: {name: string; bay_value: string | number}[];
  /** key: deviceType */
  deviceIconMap: Record<string, {key?: string, color?: string} | undefined>
  setDeviceIconMap: (m: Record<string, {key?: string, color?: string} | undefined>) => void
  setDeviceTypes(deviceTypes: {name: string; bay_value: string | number}[]): void;
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
  @observable grade = '';
  @action setGrade = (grade) => {
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
    this.siteType = String(siteType) || '';
  }

  // memo使用
  @observable deviceType = '';
  @action setDeviceType = (deviceType) => {
    this.deviceType = deviceType || '';
  }
  
  @observable deviceTypes: {name: string; bay_value: string | number}[] = [];
  @action setDeviceTypes = (deviceTypes: {name: string; bay_value: string | number}[]) => {
    this.deviceTypes = deviceTypes;
  }

  @observable deviceIconMap: Record<string, {iconKey?: string, color?: string} | undefined> = {}
  @action setDeviceIconMap = (m: typeof this.deviceIconMap) => {
    this.deviceIconMap = m
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