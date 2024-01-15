import React, { useEffect, useMemo, useState } from 'react'
import { useDeepCompareEffect } from 'react-use';
import { observer } from 'mobx-react'
import msg from '@/common/lang'
import { Icon2, IconType } from 'Icon';
import PageCard, { PageCardConfig } from '../../components_utils/Card'
import Tabs, { TabPane } from 'Tabs'
import { getAssetAlias } from '@/common/utils'
import { default as useTplStore } from '../common/components/PointTplConfiguration/dataStore'
import WidgetContext from '../common/context'
import { getBaseInfoI18nMap } from '../common/i18n'
import Form, { FullForm } from './Form'
import PointConfigurator from "../common/components/PointTplConfiguration";
import { Point, TPointTypes } from '../common/components/PointTplConfiguration/models'
import styles from './BaseInfo.module.scss'

const isZh = msg.isZh

export const CONSTRAIN = {
    TITLE_HEIGHT: 48, // 卡片标题高
    MIN_COL_WIDTH: 200,
    MAX_COL_WIDTH: 400,
    ROW_HEIGHT: 46,
    OTHER_HEIGHT: 87 + 46, // tab页头/分页器
}

export enum IBaseInfoStyle {
    ICON = 'icon'
}

/**
 * cfg 直接定义本组件接受属性，在面板组件里完成option到cfg的转化
 */
export type IBaseInfoFormCfg = {
    customAssetAlias?: string
    pointCandidates: Point[];
    showFull?: boolean;
    trimNamePrefix?: boolean

    /**下面参数内部调用使用,未在配置里体现 */
    candidatesFromWebLevel?: number[] // 实时获取的测点级别 1: 一级模型  2: 二级模型 default: [2]
    styleMode?: IBaseInfoStyle;
    /**默认模板名称 */
    defaultTemplateName?: string;
    /**默认模板里显示模型个数 */
    defaultShowNum?: number;
    /**默认模板里显示指标  */
    defaultPoints?: string[];
    publicTypes?: TPointTypes;
} & PageCardConfig

export const BaseInfoDefaultCfg: IBaseInfoFormCfg = {
    pointCandidates: [],
    showFull: true
};

/**
 * option 影响右侧面板组件接受属性, 暂时没看出来有什么用
 */
export type IBaseInfoOptions = IBaseInfoFormCfg

export const BaseInfoDefaultOptions: IBaseInfoOptions = BaseInfoDefaultCfg
const fullDataTabKey = 'full'
const BaseInfoForm: React.FC<{
    isDemo?: boolean;
    deviceAlias: string | { alias: string; name: string; showName: string }[]
    pointCandidates: Point[]
    styleMode?: IBaseInfoStyle;
    defaultTemplateName?: string;
    defaultShowNum?: number;
    defaultPoints?: string[];
    publicTypes?: TPointTypes
    showFull?: boolean
    candidatesFromWebLevel?: number[]
    trimNamePrefix?: boolean
}> = observer(({
    isDemo,
    deviceAlias,
    pointCandidates,
    styleMode,
    defaultTemplateName,
    defaultShowNum,
    defaultPoints,
    publicTypes,
    showFull,
    candidatesFromWebLevel,
    trimNamePrefix
}) => {

    const i18n = getBaseInfoI18nMap()
    let firstDeviceAlias = '';
    if (typeof deviceAlias === 'string') {
        firstDeviceAlias = deviceAlias;
    } else if (Array.isArray(deviceAlias) && deviceAlias[0]) {
        firstDeviceAlias = deviceAlias[0].alias;
    }
    const [showConfig, setShowConfig] = useState(false)
    const [showFullDataTab, setShowFullDataTab] = useState(false)

    const dataStore = useTplStore({ defaultTplName: defaultTemplateName })
    const { tplList, currentTplId, fetchTpls, fetchPoints } = dataStore

    /**
     * publicTypes一般与showPublic一起使用并且不会改变, 暂不监听
     */
    useDeepCompareEffect(() => {
        if (!firstDeviceAlias) return;

        (async () => {
            await fetchPoints(firstDeviceAlias, {
                publicTypes, modelLevels: candidatesFromWebLevel
            })
            fetchTpls(defaultShowNum, defaultPoints)
        })()
    }, [firstDeviceAlias, defaultShowNum, defaultPoints])

    let toolBar = useMemo(() => {
        switch (styleMode) {
            case IBaseInfoStyle.ICON:
                return <div
                    className={styles.iconBtn}
                    onClick={() => setShowConfig(true)}
                >
                    <Icon2 type={IconType.CONFIG} tip={i18n('pointsSetting')}></Icon2>
                </div>
            default:
                return <button
                    className={styles.btn}
                    onClick={e => setShowConfig(true)}
                >{i18n('pointsSetting')}</button>
        }
    }, [styleMode])

    const pointsWithConf = useMemo(() => {
        return tplList.find(t => t.id === currentTplId)?.points ?? []
    }, [currentTplId, tplList]);

    if (!isDemo && !deviceAlias) {
        console.error('empty asset alias');
        return <div></div>
    }

    return <div className={styles.main}>
        <Tabs
            toolBar={showFullDataTab ? undefined : toolBar}
            activeKey={showFullDataTab ? fullDataTabKey : currentTplId}
            onTabClick={(key) => {
                if (key !== fullDataTabKey) {
                    setShowFullDataTab(false)
                    dataStore.setCurrentTplId(key);
                } else {
                    setShowFullDataTab(true)
                }
            }}
        >
            {
                tplList.map(v =>
                    <TabPane key={v.id} tab={isZh ? v.name : v.name_en}>
                    </TabPane>
                ).concat(showFull ? [<TabPane key={fullDataTabKey} tab={i18n('fullData')} />] : [])
            }
        </Tabs>
        <div className={styles.data}>
            {showFullDataTab ?
                <FullForm alias={deviceAlias} trimNamePrefix={trimNamePrefix} /> :
                <Form
                    alias={deviceAlias}
                    pointsWithConf={pointsWithConf}
                />}
        </div>
        {
            showConfig &&
            <PointConfigurator
                currentTplId={currentTplId}
                dataStore={dataStore}
                visible={showConfig}
                candidates={pointCandidates}
                configurable={{
                    showTitle: true,
                    condition: true,
                    convert: true
                }}
                onClose={() => setShowConfig(false)}
            />
        }
    </div>
})


const BaseInfoWidget: WidgetElement<IBaseInfoFormCfg> = (props) => {
    const { configure, assetAlias, isDemo, pageId } = props
    let alias;
    if (Array.isArray(assetAlias)) {
        alias = assetAlias
    } else {
        alias = getAssetAlias(assetAlias, configure?.customAssetAlias)
    }
    const {
        pointCandidates, showFull, trimNamePrefix,
        defaultTemplateName, defaultShowNum, defaultPoints, publicTypes, styleMode, candidatesFromWebLevel
    } = configure

    return <WidgetContext.Provider
        value={{
            componentId: props.id!,
            isDemo: !!props.isDemo,
            widgetName: 'BaseInfo',
            pageId: pageId
        }}
    >
        <PageCard {...configure} style={{
            height: '100%',
            width: '100%'
        }}>
            <BaseInfoForm
                isDemo={isDemo}
                deviceAlias={alias}
                pointCandidates={pointCandidates}
                defaultTemplateName={defaultTemplateName}
                defaultShowNum={defaultShowNum}
                defaultPoints={defaultPoints}
                publicTypes={publicTypes}
                styleMode={styleMode}
                showFull={showFull}
                candidatesFromWebLevel={candidatesFromWebLevel ?? [2]}
                trimNamePrefix={trimNamePrefix}
            />
        </PageCard>
    </WidgetContext.Provider>
}
/**
 * 基础信息控件
 */
export default BaseInfoWidget;