declare module '*.css';
declare module '*.scss';
declare module '*.mscss';
declare module '*.less';
declare module '*.png';
declare module '*.json';
declare module '*.html';
declare interface Window {
    ___debug___: boolean;
    g_field_parm?: string
    g_app_node_map?: Record<string, string[] | undefined>
    g_num_add_comma: object;
    g_web_cfg: {
        globalHeartBeat?: boolean
        useNewTrendAnalysis?: boolean
    }
    EnvUtils: {
        getLocal: (arg: any) => any
    };
    resize_menu: () => void;
    SysExport: any
    WS: {
        sign: Function;
        token: Function;
        getGetSignStr: Function;
        resource: Function
    };
    SysUtil?: {
        hasApp: () => boolean
        hasAppPrefix: (text: string) => boolean
        replaceAppPrefix: (text: string) => string
    }
    luckysheet: any
}
declare const commonSwitchPage: unknown;
declare const SYS_BASE: {
    set: (a, b) => void;
    maxScreenTrigger: (a: boolean) => void;
};
declare const WS: {
    resource: (a, b) => void;
}