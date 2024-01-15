import React, { useState, useEffect } from "react";
import { observer } from 'mobx-react'
import Intl, { msgTag } from '@/common/lang';
import { POINT_TABLE } from '@/common/constants';
import Tabs, { TabPane } from 'Tabs'
import TabLightPlate from "./TabLightPlate";
import { default as useTplStore } from '../common/components/PointTplConfiguration/dataStore'
import PointConfigurator from "../common/components/PointTplConfiguration";
import { getAssetAlias } from '@/common/utils'
import PageCard, { PageCardConfig } from '../../components_utils/Card'
import WidgetContext from '../common/context'
import { Point } from '../common/components/PointTplConfiguration/models'
import styles from './style.mscss'

const msg = msgTag('pagetpl');
const isZh = Intl.isZh

export { default as YXLightPlateForm } from './form'

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface IYXLightPlateDefaultOptions {

};

export const YXLightPlateDefaultOptions: IYXLightPlateDefaultOptions = {

};

export type IYXLightPlateCfg = {
    customAssetAlias?: string;
    pointCandidates: Point[];
    domainId: string;
    modelId: string;
} & PageCardConfig;

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const YXLightPlateDefaultCfg: IYXLightPlateCfg = {
    title: '',
    customAssetAlias: '',
    pointCandidates: [],
    domainId: '',
    modelId: ''
};

export type YXLightPlateFormProps = {
    deviceAlias: string,
    pointCandidates: Point[],
    domainId: string,
    modelId: string,
    isDemo?: boolean
}

const YXLightPlateForm = observer((props: YXLightPlateFormProps) => {
    const { deviceAlias, pointCandidates, domainId, modelId, isDemo } = props

    let firstDeviceAlias = '';
    if (typeof deviceAlias === 'string') {
        firstDeviceAlias = deviceAlias;
    }

    const [showConfig, setShowConfig] = useState(false);
    const dataStore = useTplStore()
    const { tplList, currentTplId, fetchTpls, fetchPoints } = dataStore

    useEffect(() => {
        if (!firstDeviceAlias || !domainId || !modelId) return;

        fetchTpls()
        fetchPoints(firstDeviceAlias, { modelLevels: [2] })
    }, [firstDeviceAlias, domainId, modelId])

    const toolBar = <button
        className={styles.btn}
        onClick={e => setShowConfig(true)}
    >{msg('YX_LIGHT_PLATE.pointsSetting')}</button>

    if (!isDemo && !deviceAlias) {
        console.error('empty asset alias');
        return <div></div>
    }

    return <div className={styles.container}>
        <Tabs
            toolBar={toolBar}
            activeKey={currentTplId}
            onTabClick={(key) => {
                dataStore.setCurrentTplId(key);
            }}
        >
            {
                tplList.map(v =>
                    <TabPane key={v.id} tab={isZh ? v.name : v.name_en}>
                    </TabPane>)
            }
        </Tabs>
        <div className={styles.data}>
            <TabLightPlate
                alias={deviceAlias}
                pointsWithConf={tplList.find(t => t.id === currentTplId)?.points ?? []}
            />
        </div>
        {
            showConfig && <PointConfigurator
                pointTypes={[POINT_TABLE.YX]}
                currentTplId={currentTplId}
                dataStore={dataStore}
                visible={showConfig}
                candidates={pointCandidates}
                configurable={{
                    showTitle: true,
                    showValueMap: true
                }}
                onClose={() => setShowConfig(false)}
            />
        }
    </div>
})


const YXLightPlate: WidgetElement<IYXLightPlateCfg> = observer((props) => {
    const { id, assetAlias, configure, isDemo, pageId } = props;
    const { customAssetAlias, pointCandidates, domainId, modelId } = configure

    const deviceAlias = getAssetAlias(assetAlias, customAssetAlias)

    return (
        <WidgetContext.Provider value={{
            componentId: id!,
            isDemo: !!isDemo,
            widgetName: 'YXLightPlate',
            pageId
        }}>
            <PageCard {...configure}>
                <YXLightPlateForm
                    isDemo={isDemo}
                    deviceAlias={deviceAlias}
                    pointCandidates={pointCandidates}
                    domainId={domainId}
                    modelId={modelId}
                />
            </PageCard>
        </WidgetContext.Provider>
    )
})

export { YXLightPlate }