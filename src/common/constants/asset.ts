export const DOMAIN = {
    WIND: 'wind',
    SOLAR: 'solar',
    HYDRO: 'hydro'
};

export enum DOMAIN_ENUM {
    WIND, SOLAR, STORAGE
}

export enum MODEL_ID {
    WTG = 'uscada_wind_turbine' //风机
}

export enum DOMAIN_ID {
    WIND = '101'
}

// 场站信息表里场站类型值
export const SITE_TYPE = {
    WIND: '3',
    SOLAR: '5',
    STORAGE: '6',
    SUBSTATION: '0',
    HYDRO: '2'
};

// 标志牌定义
export const TOKEN = {
    MAINTENANCE: 769,
    MAINTENANCE_CANCEL: 784
};

export const TREE_NODE_TYPE = {
    STORAGE_SUB_SYSTEM: 22,
    STORAGE_BATTERY_CLUSTER: 25
};