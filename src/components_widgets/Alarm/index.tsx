import React, { useEffect, useState } from "react";
import { observer, Observer } from "mobx-react";
import PageCard, { PageCardConfig } from '../../components_utils/Card'
import { getAssetAlias } from '@/common/utils'
import { AlarmType, AlarmLevel, MAX_RECORDS, HISTORY_SC, PAGE_SIZE, isZh, TYPE_LIST } from './constant'
import Content from "./Content"
import Tabs, { TabPane } from "Tabs";
import styles from './style.mscss'
import WidgetContext from "../common/context";
import { _dao } from "@/common/dao";
import {useMemoryStateCallback} from '@/common/util-memory';
import { Button } from "antd";
import { redirectTo } from "@/common/util-scada";

export { default as AlarmForm } from './form';


// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface IAlarmDefaultOptions {

};

export const AlarmDefaultOptions: IAlarmDefaultOptions = {

};

export const defaultAlarmTabs: AlarmTab[] = [
    { id: 'Major', name: '首发状态字', name_en: 'Major Status Code', show: true, type: TYPE_LIST.ALARM },
    { id: 'Active', name: '活动状态字', name_en: 'Active Status Code', show: false, type: TYPE_LIST.ACTIVE_SC },
    { id: 'Health', name: '亚健康状态字', name_en: 'Health Status Code', show: false, type: TYPE_LIST.SUBHEALTH_SC },
]

export type AlarmTab = {
    id: string;
    name: string;
    name_en: string;
    show: boolean;
    type: TYPE_LIST
}
export interface IAlarmDefaultCfg extends PageCardConfig {
    customAssetAlias?: string;       // 资产别名
    alarmTypes: Array<AlarmType>;   // 告警类型
    alarmLevels: Array<AlarmLevel>;  // 告警等级
    maxRecords: number;              // 告警显示最大消息数
    historySc: number;               // 历史SC告警
    pageSize: number;                // 分页器每页条数
    tabs?: AlarmTab[]
    hideBarOnOne?: boolean,
    userSaveCfg?: any,
    onSave?: (cfg:any) => void;
};

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const AlarmDefaultCfg: IAlarmDefaultCfg = {
    title: '',
    customAssetAlias: '',
    alarmTypes: [],
    alarmLevels: [],
    maxRecords: MAX_RECORDS,
    historySc: HISTORY_SC,
    pageSize: PAGE_SIZE,
    tabs: defaultAlarmTabs,
    userSaveCfg: undefined,
    onSave: undefined
};

const AlarmTabs: React.FC<Omit<IAlarmDefaultCfg, 'tabs'> & {
    alias: string, id?: string, isDemo?: boolean, tabs?: AlarmTab[]
}> = (props) => {
    const { alias, alarmTypes, alarmLevels, maxRecords, historySc, pageSize, tabs, hideBarOnOne, userSaveCfg, onSave } = props
    const [currentId, setCurrent] = useState<string | undefined>(tabs?.[0]?.id)

    useEffect(() => {
        setCurrent(tabs?.[0]?.id)
    }, [tabs])

    if(!tabs){
        return <Content
        type={TYPE_LIST.ALARM}
        devAlias={alias}
        options={{
            alarmTypes: alarmTypes,
            alarmLevels: alarmLevels,
            maxRecords: maxRecords,
            historySc: historySc,
            pageSize: pageSize,
            userSaveCfg: userSaveCfg,
            onSave: onSave
        }}
    />
    }

    const currentTab = tabs?.find(t => t.id === currentId)
    return <div className={styles['tab-container']}>
        {!(tabs.length === 1 && hideBarOnOne) && <Tabs 
            activeKey={currentId} 
            onTabClick={(key) => setCurrent(key)} 
        >
            {tabs.map((t, i) => <TabPane key={t.id} tab={isZh ? t.name : t.name_en} />)}
        </Tabs>}
        <div className={styles['tab-content']}>
            {currentTab && <Content
                type={currentTab.type}
                devAlias={alias}
                options={{
                    alarmTypes: alarmTypes,
                    alarmLevels: alarmLevels,
                    maxRecords: maxRecords,
                    historySc: historySc,
                    pageSize: pageSize,
                    userSaveCfg: userSaveCfg,
                    allowRedirect: true,
                    onSave: onSave
                }}
            />}
        </div>
    </div>
}

const Alarm: WidgetElement<IAlarmDefaultCfg> = React.memo(observer((widgetProps) => {
    const { pageId, id, assetAlias, configure, isDemo, nodeAlias } = widgetProps;
    const { customAssetAlias, alarmTypes, alarmLevels, maxRecords, historySc, pageSize, tabs } = configure;

    // 亚健康状态字权限
    const [hasHealthPerm, setHealthPerm] = useState(false)
    // 告警选项保存
    const [cacheCfg, setCacheCfg] = useMemoryStateCallback<{[key: string]: any}>({}, pageId, id);
    useEffect(() => {
        if (!isDemo) {
            _dao.getPriv(nodeAlias)
                .then((rs) => {
                    if (rs && rs.data && rs.data[0] && String(rs.data[0].Access_Super) === '1') {
                        setHealthPerm(true)
                    } else {
                        setHealthPerm(false)
                    }
                })
        } else {
            setHealthPerm(true)
        }

    }, [isDemo, nodeAlias])

    // 优先级customAssetAlias>assetAlias， 两个都没有，就提前截断不渲染
    const alias = getAssetAlias(assetAlias, customAssetAlias);
    if (!isDemo && !alias) {
        console.error('empty asset alias');
        return <div></div>
    }

    const alertTabs = tabs?.filter(t => t.show && (t.type !== TYPE_LIST.SUBHEALTH_SC || hasHealthPerm))

    const handleSave = (typeKey: string, cfg: any) => {
        console.log('typeKey',typeKey)
        setCacheCfg(Object.assign({}, cacheCfg, {[typeKey]: cfg}))
        // setCacheCfg({});   // 恢复初始状态
    }

    return <PageCard {...configure}>
        <WidgetContext.Provider value={{ isDemo: !!isDemo, componentId: id ?? '' }}>
                <AlarmTabs {...configure} tabs={alertTabs} alias={alias} userSaveCfg={cacheCfg[TYPE_LIST.ALARM]} 
                    onSave = {(cfg) => {handleSave(TYPE_LIST.ALARM, cfg)}} 
                />
        </WidgetContext.Provider>
    </PageCard>
}))

export { Alarm }