import { 
    observable, 
    action, 
    computed, 
    makeObservable, 
    reaction, 
    runInAction, 
    autorun
} from 'mobx';
import { _dao } from '@/common/dao';
import scadaCfg from '../../common/const-scada';

export interface IAssetState{
    currentApp?: string;
    // 如果是设备则为设备资产, 否则一般与currentNodeAlias相同
    currentWidgetAssetAlias?: string;
    currentNodeAlias?: string;
    currentPageId?: string;
    currentPageSign?: string;

    // 当前模板资产别名和标识
    //pageSign?: string;
    //pageTplId?: string;
    //nodeAlias?: string;
    setPageSign: (pageSign: string) => void;
    setPageTplId: (pageTplId: string) => void;

    // 当前有设备, 优先使用设备别名和其模板标识
    //deviceSign?: string;
    //deviceTplId?: string;
    //deviceAlias?: string;
    //deviceType?: string; // 设备返回列表需要定位到哪种设备
    setDeviceSign: (deviceSign: string) => void;
    setDeviceAlias: (deviceAlias: string) => void;
    setDeviceTplId: (deviceTplId: string) => void;
};

class AssetState implements IAssetState{
    constructor() {
        makeObservable(this);
    }

    @observable private pageSign = '';
    @observable private pageTplId = '';
    @observable private nodeAlias = (scadaCfg.getCurNodeAlias() as string);
    @observable private deviceSign = '';
    @observable private deviceAlias = '';
    @observable private deviceTplId = '';

    @action
    setPageSign(pageSign){
        this.pageSign = pageSign;
    }

    @action
    setPageTplId(pageTplId){
        this.pageTplId = pageTplId;
    }

    @action
    setDeviceSign(deviceSign){
        this.deviceSign = deviceSign;
    }

    @action
    setDeviceTplId(deviceTplId){
        this.deviceTplId = deviceTplId;
    }

    @action
    setDeviceAlias(deviceAlias){
        this.deviceAlias = deviceAlias;
    }

    @computed
    get currentPageId(){
        return this.deviceTplId || this.pageTplId;
    }

    @computed
    get currentWidgetAssetAlias(){
        return this.deviceAlias || this.nodeAlias;
    }

    @computed
    get currentPageSign(){
        return this.pageSign;
    }

    @computed
    get currentNodeAlias(){
        return this.nodeAlias;
    }
}

export default new AssetState();

