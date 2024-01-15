/**
 * 部分前端逻辑需要和测点名强耦合，此类测点在此处定义，全量测点使用接口获取
 * @see /scadaweb/get_device_point
 */

export enum YX { // 遥信
    // 箱变
    BreakerClass = 'BXTF.BreakerClass', // 高压侧开关远方就地	
    IsolationSwitchClose = 'BXTF.IsolationSwitchClose', // 高压侧隔离开关合位	
    LoadSwitchClose = 'BXTF.LoadSwitchClose', // 高压侧断路器开关合位	
    EarthSwitchClose = 'BXTF.EarthSwitchClose', // 高压侧接地开关合位	
    RMUIsolationSwitchClose1 = 'BXTF.RMUIsolationSwitchClose1', // 环网开关1合位	
    RMUEarthSwitchClose1 = 'BXTF.RMUEarthSwitchClose1', // 环网接地开关1合位	
    RMUIsolationSwitchClose2 = 'BXTF.RMUIsolationSwitchClose2', // 环网开关2合位	
    RMUEarthSwitchClose2 = 'BXTF.RMUEarthSwitchClose2', // 环网接地开关2合位	
    Breaker1Class = 'BXTF.Breaker1Class', // 1#低压侧断路器远方就地	
    Breaker2Class = 'BXTF.Breaker2Class', // 2#低压侧断路器远方就地	
    SingleBreaker01 = 'BXTF.SingleBreaker01', // 1#低压断路器合
    SingleBreaker02 = 'BXTF.SingleBreaker02', // 2#低压断路器合

    // 储能箱变
    BreakerClass_EMS = 'TMM.HVSwt1Mode', // 高压侧开关远方就地
    IsolationSwitchClose_EMS = 'TMM.HVIst1OnPos', // 高压侧隔离开关合位	
    LoadSwitchClose_EMS = 'TMM.HVSwt1OnPos', // 高压侧断路器开关合位	
    EarthSwitchClose_EMS = 'TMM.HVIstGnd1On', // 高压侧接地开关合位	
    RMUIsolationSwitchClose1_EMS = 'TMM.HVLoadSwitch1On', // 环网开关1合位	
    RMUEarthSwitchClose1_EMS = 'TMM.HVLoadSwitch1GndOn', // 环网接地开关1合位	
    RMUIsolationSwitchClose2_EMS = 'TMM.HVLoadSwitch2On', // 环网开关2合位	
    RMUEarthSwitchClose2_EMS = 'TMM.HVLoadSwitch2GndOn', // 环网接地开关2合位	
    Breaker1Class_EMS = 'TMM.LVSwt1Mode', // 1#低压侧断路器远方就地	
    Breaker2Class_EMS = 'TMM.LVSwt2Mode', // 2#低压侧断路器远方就地	
    SingleBreaker01_EMS = 'TMM.LVSwt1OnPos', // 1#低压断路器合
    SingleBreaker02_EMS = 'TMM.LVSwt2OnPos', // 2#低压断路器合
    
    // pcs接线图
    ACBreaker = 'PCS.ACBState',         // 交流侧开关状态
    DCMainBreaker1 = 'DCMainBreaker1',  // 直流总断路器状态（B1、B2等动态判断）
    Fuse1State = 'Fuse1State',          // 熔断器1状态（B1、B2等动态判断）
    Fuse2State = 'Fuse2State',          // 熔断器2状态（B1、B2等动态判断）
    PCSHealthStatus = 'PCS.HealthMode', // 变流器健康状态
    BatteryHealthStatus = 'BB.HealthMode', //电池组健康状态
    RankHealthStatus = 'RB.HealthMode', // 电池簇健康状态

    // 场站拓扑 todo
    RUN_STATE = 'MOCK_RUN_STATE',
    SubSysStatus = 'MOCK_SubSysStatus',
}

export enum YC { // 遥测 
    RankSoC = 'RB.SoC' // 电池簇值
}

export const getPointsAlias = (assetAlias, point, includeNo = false) => {

    if(!assetAlias || !point) return '';

    const {table_no = '', alias = '', field_no = ''} = point;

    if(table_no + alias + field_no === '') { return ''};

    const assetAliasLen = assetAlias.split('.').length;
    const aliasLen = alias.split('.').length;

    let fullAlias = assetAlias + '.' + alias;

    if(assetAliasLen + aliasLen > 5){
        fullAlias = fullAlias.split('.').splice(5 - assetAliasLen - aliasLen, 5 - assetAliasLen).join('.');
    }

    return includeNo ? `1:${table_no}:${fullAlias}:${field_no}` : fullAlias;
}