import { TimerInterval } from '@/common/const-scada';
import { PointEvt, combineToFullAlias, aliasToDynDataKey } from '@/common/util-scada';
import { NumberUtil, getAssetAlias } from "@/common/utils";
import { HEALTH_STATE, SWITCH_STATE } from "DrawLib/constant";
import { pcsGraph, PCSGraphState, PCS_GRAPH_TYPE } from 'DrawLib/groups';
import { CommonOptions, EleRect, Point } from 'DrawLib/model';
import Konva from 'konva';
import { observer } from 'mobx-react';
import React, { useMemo, useState } from 'react';
import { useRecursiveTimeoutEffect } from 'ReactHooks';
import { KonvaWrap } from '@/components';
import PageCard, { PageCardConfig } from '../../components_utils/Card'
import { YX } from "../common/constants/points";
import dao from './dao';
import styles from './index.mscss';
import { pcs } from "DrawLib/shapes";


export { default as PCSWiringDiagramForm } from './form';
export { PCSWiringDiagram };

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface IPCSWiringDiagramDefaultOptions {

};

export const PCSWiringDiagramDefaultOptions: IPCSWiringDiagramDefaultOptions = {

};

interface IPCSWiringDiagramCfg extends PageCardConfig {
    customAssetAlias?: string
    pcsPointAliasMap?: PCSPointAliasMap
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const PCSWiringDiagramDefaultCfg: IPCSWiringDiagramCfg = {
    customAssetAlias: ''
};

export type WiringDiagramContentProps = {
    alias: string
    isDemo: boolean
    batteryAlias?: string
    pcsPointAliasMap?: PCSPointAliasMap
}

export type PCSPointAliasMap = Partial<{
    ACBreaker: string
    DCMainBreaker1: string
    Fuse1State: string
    Fuse2State: string
    BatteryHealthStatus: string
    PCSHealthStatus: string
}>
export const pcsDefaultAliasMap: Required<PCSPointAliasMap> = {
    ACBreaker: YX.ACBreaker,
    DCMainBreaker1: YX.DCMainBreaker1,
    Fuse1State: YX.Fuse1State,
    Fuse2State: YX.Fuse2State,
    BatteryHealthStatus: YX.BatteryHealthStatus,
    PCSHealthStatus: YX.PCSHealthStatus
}

export const PCS_DIAGRAM_TYPE = {
    ...PCS_GRAPH_TYPE,
    TYPE3: 2
}

const valueToState = <T extends keyof PCSGraphState>(name: T, key: string, v?: number): PCSGraphState[T] => {
    let state: any
    switch (name) {
        case 'acBreakerState':
        case 'leftFuse':
        case 'rightFuse': {
            if (v === 0) {
                state = SWITCH_STATE.SEPARATED
            } else if (v === 1) {
                state = SWITCH_STATE.CONNECTED
            } else {

                state = SWITCH_STATE.MISSING
            }
            break
        }
        case 'dcCoupledSwitchState': {
            if (v === 0) {
                state = SWITCH_STATE.CONNECTED
            } else if (v === 1) {
                state = SWITCH_STATE.SEPARATED
            } else {
                state = SWITCH_STATE.MISSING
            }
        }
        default: {
            // case 'pcsStatus':
            // case 'batteryStatus'
            if (v === undefined) {
                state = HEALTH_STATE.MISSING
            } else {
                state = v
            }
        }
    }
    return {
        key,
        state
    } as PCSGraphState[typeof name]
}

export const usePcsGraphElement = (pcsAliasArr: string[], isDemo: boolean,
    options: {
        isDynPCS?: boolean // pcs 是否需要根据动态字变色
        batteryAliasMap?: { [key: string]: string } // {pcsAlias: batteryAlias}
        pcsPointAliasMap?: PCSPointAliasMap
    } = {}) => {
    const aliasMap = Object.assign({}, pcsDefaultAliasMap, options.pcsPointAliasMap || {})
    const batteryAliasMap = options.batteryAliasMap
    const isDynPCS = options.isDynPCS
    const [dataMap, setData] = useState<{ [key: string]: number }>({}) // pointKey: value
    const [typeMap, setType] = useState<{ [key: string]: number }>({}) // alias: type

    const getFullAliasAndKey = (alias: string): { [Property in keyof typeof pcsDefaultAliasMap]: { fullAlias: string, key: string } } | null => {
        const splitList = alias.split('.')
        if (splitList.length >= 3) {
            const value = splitList[splitList.length - 1].slice(3) // 如取PCS01中的01
            if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
                const dev = `${splitList[0]}.${splitList[1]}.CESS`
                const ACBreaker = combineToFullAlias(alias, aliasMap.ACBreaker)
                const DCMainBreaker1 = `${dev}.B${parseFloat(value)}.${aliasMap.DCMainBreaker1}`
                const Fuse1State = `${dev}.B${parseFloat(value)}.${aliasMap.Fuse1State}`
                const Fuse2State = `${dev}.B${parseFloat(value)}.${aliasMap.Fuse2State}`

                const PCSHealthStatus = isDynPCS ? combineToFullAlias(alias, aliasMap.PCSHealthStatus) : ''
                const BatteryHealthStatus = batteryAliasMap?.[alias] ? combineToFullAlias(batteryAliasMap[alias], aliasMap.BatteryHealthStatus) : ''
                return {
                    ACBreaker: {
                        fullAlias: ACBreaker,
                        key: aliasToDynDataKey(ACBreaker, 'YX')
                    },
                    DCMainBreaker1: {
                        fullAlias: DCMainBreaker1,
                        key: aliasToDynDataKey(DCMainBreaker1, 'YX')
                    },
                    Fuse1State: {
                        fullAlias: Fuse1State,
                        key: aliasToDynDataKey(Fuse1State, 'YX')
                    },
                    Fuse2State: {
                        fullAlias: Fuse2State,
                        key: aliasToDynDataKey(Fuse2State, 'YX')
                    },
                    PCSHealthStatus: {
                        fullAlias: PCSHealthStatus,
                        key: PCSHealthStatus ? aliasToDynDataKey(PCSHealthStatus, 'YX') : ''
                    },
                    BatteryHealthStatus: {
                        fullAlias: BatteryHealthStatus,
                        key: BatteryHealthStatus ? aliasToDynDataKey(BatteryHealthStatus, 'YX') : ''
                    }
                }
            } else {
                console.error(`invalid ${splitList[0]}!`);
            }
        } else {
            console.error(`invalid pcsAlias ${alias}!`);
        }
        return null
    }

    useRecursiveTimeoutEffect(() => [
        async () => {
            if (isDemo || pcsAliasArr.length === 0) {
                return {
                    tMap: pcsAliasArr.reduce((p, alias) => ({
                        ...p,
                        [alias]: PCS_GRAPH_TYPE.TYPE1
                    }), {}),
                    dynData: {}
                }
            } else {
                // 拼接完整测点别名
                const pointAliasMap: { [key: string]: PCSPointAliasMap } = {}
                const allPointKeys: string[] = []
                pcsAliasArr.forEach(pcsAlias => {
                    const aliasAndKey = getFullAliasAndKey(pcsAlias)
                    if (aliasAndKey) {
                        allPointKeys.push(
                            aliasAndKey.ACBreaker.key,
                            aliasAndKey.DCMainBreaker1.key,
                            aliasAndKey.Fuse1State.key,
                            aliasAndKey.Fuse2State.key
                        )
                        aliasAndKey.PCSHealthStatus.key && allPointKeys.push(aliasAndKey.PCSHealthStatus.key)
                        aliasAndKey.BatteryHealthStatus.key && allPointKeys.push(aliasAndKey.BatteryHealthStatus.key)
                        pointAliasMap[pcsAlias] = {
                            ACBreaker: aliasAndKey.ACBreaker.fullAlias,
                            DCMainBreaker1: aliasAndKey.DCMainBreaker1.fullAlias,
                            Fuse1State: aliasAndKey.Fuse1State.fullAlias,
                            Fuse2State: aliasAndKey.Fuse2State.fullAlias,
                            PCSHealthStatus: aliasAndKey.PCSHealthStatus.fullAlias || undefined,
                            BatteryHealthStatus: aliasAndKey.BatteryHealthStatus.fullAlias || undefined
                        }
                    }
                })

                // 获取子类型
                return Promise.all([
                    dao.getBayTypeSub(pcsAliasArr),
                    dao.getDynData(allPointKeys.map(p => ({
                        key: p,
                        decimal: 0,
                    })))
                ]).then(res => {
                    return {
                        tMap: res[0],
                        dynData: res[1].reduce((p, c) => {
                            let newEntry: { [key: string]: number } = {}
                            if (c.status_value === 0) {
                                if (NumberUtil.isValidNumber(c.raw_value)) {
                                    newEntry[c.key] = parseInt(c.raw_value)
                                }
                                if (NumberUtil.isValidNumber(c.display_value)) {
                                    newEntry[c.key] = parseInt(c.display_value)
                                }
                            }
                            return Object.assign({}, p, newEntry)
                        }, {} as { [key: string]: number })
                    }
                }).catch(e => {
                    console.error(e);
                    return {
                        tMap: {},
                        dynData: {}
                    }
                })
            }
        },
        ({ tMap, dynData }: { tMap: { [key: string]: number }, dynData: { [key: string]: number } }) => {
            setData(dynData)
            setType(tMap)
        }
    ], TimerInterval as number, [pcsAliasArr, isDemo])

    const pcsStateProducer = (alias: string): PCSGraphState | undefined => {
        const aliasAndKey = getFullAliasAndKey(alias)
        if (!aliasAndKey) {
            return
        }
        return {
            acBreakerState: valueToState('acBreakerState', aliasAndKey.ACBreaker.key, dataMap[aliasAndKey.ACBreaker.key]),
            dcCoupledSwitchState: valueToState('dcCoupledSwitchState', aliasAndKey.DCMainBreaker1.key, dataMap[aliasAndKey.DCMainBreaker1.key]),
            leftFuse: valueToState('leftFuse', aliasAndKey.Fuse1State.key, dataMap[aliasAndKey.Fuse1State.key]),
            rightFuse: valueToState('rightFuse', aliasAndKey.Fuse2State.key, dataMap[aliasAndKey.Fuse2State.key]),
            pcsStatus: valueToState('pcsStatus', aliasAndKey.PCSHealthStatus.key, dataMap[aliasAndKey.PCSHealthStatus.key]),
            batteryStatus: valueToState('batteryStatus', aliasAndKey.BatteryHealthStatus.key, dataMap[aliasAndKey.BatteryHealthStatus.key])
        }
    }

    const simplePCSStateProducer = (alias: string): HEALTH_STATE | undefined => {
        const aliasAndKey = getFullAliasAndKey(alias)
        if (!aliasAndKey) {
            return
        }
        if (isDemo) {
            return HEALTH_STATE.MISSING
        }
        return valueToState('pcsStatus', aliasAndKey.PCSHealthStatus.key, dataMap[aliasAndKey.PCSHealthStatus.key])?.state
    }

    const getPCSDiagram = (alias: string, start: Point, rect: EleRect, options?: CommonOptions) => {
        const type = typeMap[alias]
        if (isDemo) {
            return pcsGraph({
                start: [start],
                rect: rect,
                state: {
                    acBreakerState: { state: SWITCH_STATE.MISSING },
                    dcCoupledSwitchState: { state: SWITCH_STATE.MISSING },
                    leftFuse: { state: SWITCH_STATE.MISSING },
                    rightFuse: { state: SWITCH_STATE.MISSING },
                    pcsStatus: { state: HEALTH_STATE.MISSING },
                    batteryStatus: { state: HEALTH_STATE.MISSING }
                },
                options: {
                    withTopBreaker: true,
                    type: type,
                    ...options
                }
            })
        }

        if (type === PCS_DIAGRAM_TYPE.TYPE1 || type === PCS_DIAGRAM_TYPE.TYPE2) {
            const state = pcsStateProducer(alias)
            if (!state) {
                return
            }
            return pcsGraph({
                start: [start],
                rect: rect,
                state: state,
                options: {
                    withTopBreaker: true,
                    type: type as PCS_GRAPH_TYPE,
                    ...options
                }
            })
        } else {
            const state = simplePCSStateProducer(alias)
            if (state === undefined) {
                return
            }
            return pcs({
                start: [start],
                rect: rect,
                state: state,
                options: {
                    ...options
                }
            })
        }
    }

    return {
        pcsStateProducer,
        simplePCSStateProducer,
        getPCSDiagram
    }
}

const WiringDiagramContent = (props: WiringDiagramContentProps) => {
    const { batteryAlias, pcsPointAliasMap } = props
    const pcsAliasArr = useMemo(() => [props.alias], [props.alias])
    const { getPCSDiagram } = usePcsGraphElement(pcsAliasArr, props.isDemo, {
        batteryAliasMap: batteryAlias ? {
            [props.alias]: batteryAlias
        } : undefined, pcsPointAliasMap
    })
    return <div className={styles.container}>
        <KonvaWrap draw={(s: Konva.Stage) => {
            const start = { x: s.width() / 2, y: 0 }
            const layer = new Konva.Layer()
            const pcs = getPCSDiagram(props.alias, start, { width: 260, height: 266 }, {
                eventHandlers: {
                    click: (key, e) => {
                        PointEvt.popMenu(key, e.evt)
                    }
                }
            })
            if (pcs) {
                layer.add(pcs.ele)
            }
            s.add(layer)
        }} />
    </div>
}

const PCSWiringDiagram: WidgetElement<IPCSWiringDiagramCfg> = observer((props) => {
    const { id, assetAlias, configure, isDemo } = props
    const { customAssetAlias, pcsPointAliasMap } = configure

    const alias = getAssetAlias(assetAlias, customAssetAlias)
    if (!isDemo && !alias) {
        console.error('empty asset alias');
        return <div></div>
    }

    return (
        <PageCard {...configure}>
            <WiringDiagramContent
                isDemo={!!isDemo}
                alias={alias}
                pcsPointAliasMap={pcsPointAliasMap}
            />
        </PageCard>
    )
})

export default PCSWiringDiagram

