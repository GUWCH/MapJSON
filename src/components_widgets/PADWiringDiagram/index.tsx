import { TimerInterval } from "@/common/const-scada"
import { getAssetAlias } from "@/common/utils";
import { PointEvt, combineToFullAlias, aliasToDynDataKey } from "@/common/util-scada";
import { padGraph } from "DrawLib/groups"
import { GRAPH_TYPE, isThreeWinding, PadGraphOptions, PadGraphState } from "DrawLib/groups/padGraph"
import { CommonOptions, EleRect, GroupElement, Point } from "DrawLib/model"
import { mapIDynToControlState, mapIDynToSwitchState, point } from "DrawLib/utils"
import Konva from "konva"
import _ from "lodash"
import React, { useEffect, useState, useMemo } from "react"
import { useRecursiveTimeoutEffect } from "ReactHooks"
import { KonvaWrap } from '@/components'
import PageCard, { PageCardConfig } from '../../components_utils/Card'
import { YX } from "../common/constants/points"
import dao from "./dao"
import styles from './index.mscss'
import { SWITCH_STATE } from "DrawLib/constant"

export { default as DiagramForm } from './form'
export { WiringDiagram }

// 组件注册时默认选项, 表单配置组件里会返回, 一般是常量值, 一般空对象。
export interface IDiagramOptions {

};

export const DiagramDefaultOptions: IDiagramOptions = {

};

export type PADPointAliasMapCfg = {
    isEMS?: boolean
    padPointMap?: PADPointAliasMap
}
export const getPADDefaultAliasMap = (isEMS: boolean): Required<PADPointAliasMap> => ({
    HIGH_REMOTE: isEMS ? YX.BreakerClass_EMS : YX.BreakerClass, // 高压侧开关远方就地	
    HIGH_DISCONNECTOR: isEMS ? YX.IsolationSwitchClose_EMS : YX.IsolationSwitchClose, // 高压侧隔离开关合位	
    HIGH_BREAKER: isEMS ? YX.LoadSwitchClose_EMS : YX.LoadSwitchClose, // 高压侧断路器开关合位	
    HIGH_EARTH: isEMS ? YX.EarthSwitchClose_EMS : YX.EarthSwitchClose, // 高压侧接地开关合位	
    RMU_LOAD1: isEMS ? YX.RMUIsolationSwitchClose1_EMS : YX.RMUIsolationSwitchClose1, // 环网开关1合位	
    RMU_EARTH1: isEMS ? YX.RMUEarthSwitchClose1_EMS : YX.RMUEarthSwitchClose1, // 环网接地开关1合位	
    RMU_LOAD2: isEMS ? YX.RMUIsolationSwitchClose2_EMS : YX.RMUIsolationSwitchClose2, // 环网开关2合位	
    RMU_EARTH2: isEMS ? YX.RMUEarthSwitchClose2_EMS : YX.RMUEarthSwitchClose2, // 环网接地开关2合位	
    LOW_REMOTE1: isEMS ? YX.Breaker1Class_EMS : YX.Breaker1Class, // 1#低压侧断路器远方就地	
    LOW_REMOTE2: isEMS ? YX.Breaker2Class_EMS : YX.Breaker2Class, // 2#低压侧断路器远方就地	
    LOW_BREAKER1: isEMS ? YX.SingleBreaker01_EMS : YX.SingleBreaker01, // 1#低压断路器合
    LOW_BREAKER2: isEMS ? YX.SingleBreaker02_EMS : YX.SingleBreaker02, // 2#低压断路器合
})
export type PADPointAliasMap = Partial<{
    HIGH_REMOTE: string
    HIGH_DISCONNECTOR: string
    HIGH_BREAKER: string
    HIGH_EARTH: string
    RMU_LOAD1: string
    RMU_EARTH1: string
    RMU_LOAD2: string
    RMU_EARTH2: string
    LOW_REMOTE1: string
    LOW_REMOTE2: string
    LOW_BREAKER1: string
    LOW_BREAKER2: string
}>
export type PADPointValueMap = { [key: string]: IDyn | undefined } // key: dynKey动态字key

export type PADDiagramCfg = {
    isDemo?: boolean;
    alias: string; // 设备别名
    pointAliasMap: PADPointAliasMap
    refreshInterval?: number;
}

type PadInfo = {
    type: GRAPH_TYPE,
    points: { [key: string]: { key: string, decimal: 0, id: string } } // key: 测点五段式别名 | dynDataKey 多存了一份冗余数据减少遍历
}

type RMUState = {
    loadSwitch?: {
        key: string
        state: SWITCH_STATE
    }
    earth?: {
        key: string
        state: SWITCH_STATE
    }
}

type PadStateProducer = () => PadGraphState | undefined
type PadGraphEleProducer = (start: Point, size: EleRect, options?: CommonOptions & PadGraphOptions) => GroupElement | undefined

const toDynKey = (alias: string, key?: string) => aliasToDynDataKey(key ? combineToFullAlias(alias, key) : alias, 'YX')

export const usePADDiagram = (alias: string, isDemo: boolean, padPointAliasMap: PADPointAliasMap) => {
    const aliasArr = useMemo(() => [alias], [alias])
    const { infoMap, data, getStateProducer, getElementProducer, handleRename } = usePADDiagrams(aliasArr, isDemo, padPointAliasMap)
    return {
        info: infoMap[alias],
        data,
        stateProducer: getStateProducer(alias),
        elementProducer: getElementProducer(alias),
        handleRename
    }
}

export const usePADDiagrams = (
    alias: string[], isDemo: boolean, padPointAliasMap: PADPointAliasMap, currentAlias?: string[]
): {
    infoMap: { [key: string]: PadInfo }
    data: PADPointValueMap
    getStateProducer: (alias: string) => PadStateProducer
    getElementProducer: (alias: string) => PadGraphEleProducer
    handleRename: (key: string, v: string) => void
} => {
    const aliasArr: string[] = useMemo(() => {
        const arr = Array.isArray(alias) ? alias : [alias]
        return arr
    }, [alias])

    const pointAliasMap = useMemo(() => Object.assign({}, getPADDefaultAliasMap(false), padPointAliasMap), [padPointAliasMap])
    const [infoMap, setInfoMap] = useState<{ [key: string]: PadInfo }>({})
    const [data, setData] = useState<PADPointValueMap>({})

    useRecursiveTimeoutEffect(() => [
        async () => {
            if (!isDemo && Object.entries(infoMap).length > 0) {
                const allPoints = Object.entries(pointAliasMap).map(([k, p]) => p)
                const reqData = Object.entries(infoMap).reduce((p, [alias, info]) => {
                    const points: PadInfo['points'] = info.points
                    const pointEntries = Object.entries(points)
                    if (pointEntries.length > 0 && (!currentAlias || currentAlias.includes(alias))) {
                        const newParams = pointEntries
                            .filter(([k, dynParam]) => allPoints.includes(k))
                            .map(([k, dynParam]) => dynParam)
                        return p.concat(newParams)
                    }
                    return p
                }, [] as IDynData[])

                return dao.getDynData(reqData).then(dynData => {
                    const padDynData = dynData.reduce((p, c) => {
                        return {
                            ...p,
                            [c.key]: c,
                        }
                    }, {} as PADPointValueMap)
                    return padDynData
                })
            } else {
                return {}
            }
        },
        (res: PADPointValueMap) => {
            setData(data => {
                if (!_.isEqual(res, data)) {
                    return Object.assign({}, data, res)
                }
                return data
            })

        }
    ], TimerInterval as number, [infoMap, isDemo, currentAlias, pointAliasMap])

    useEffect(() => {
        if (isDemo) {
            console.log('pad demo')
            setInfoMap(aliasArr.reduce((p, c) => ({ ...p, [c]: { type: GRAPH_TYPE.TYPE1, points: {} } }), {}))
            return
        }

        if (aliasArr.length === 0) {
            return
        }

        // 避免单次请求过多数据
        const maxReqArrLength = 30
        const subTypeReqArr: string[][] = []
        const checkReqArr: string[][] = []
        for (let i = 0; i < aliasArr.length; i += maxReqArrLength) {
            const arr = aliasArr.slice(i, i + maxReqArrLength)
            subTypeReqArr.push(arr)

            const checkArr: string[] = []
            arr.forEach(alias => {
                if (alias) {
                    const ps = Object.entries(pointAliasMap).map(v => combineToFullAlias(alias, v[1]))
                    checkArr.push(...ps)
                }
            })
            checkReqArr.push(checkArr)
        }

        const subTypePromise = Promise.all(subTypeReqArr.map(reqArr => dao.getBayTypeSubs(reqArr)))
            .then(resArr => resArr.reduce((p, c) => ({ ...p, ...c }), {}))
        const checkPromise = Promise.all(checkReqArr.map(reqArr => dao.checkDevicePoint(reqArr)))
            .then(resArr => resArr.reduce((p, c) => {

                // debug 测试所有点存在情况, 这样可以显示出环网结构
                //Object.keys(c).forEach(k=>c[k]=true);

                return { ...p, ...c }
            }, {}))

        Promise.all([subTypePromise, checkPromise])
            .then(([typeMap, checkResMap]) => {
                const newMap = aliasArr.reduce((p, alias) => {
                    const type = typeMap[alias]
                    if (type === undefined) {
                        console.error('getBayTypeSub failed', alias);
                        return {}
                    }

                    const points: PadInfo['points'] = {}
                    Object.entries(pointAliasMap).forEach(([pKey, pAlias]) => {
                        const fullAlias = combineToFullAlias(alias, pAlias)

                        if (checkResMap[fullAlias]) {
                            const key = aliasToDynDataKey(fullAlias, 'YX')
                            const point = {
                                id: pKey,
                                key: key,
                                decimal: 0 as 0,
                            }
                            points[pAlias] = point
                            points[key] = point
                        }
                    })

                    return {
                        ...p,
                        [alias]: {
                            type: type,
                            points: points
                        }
                    }
                }, {} as typeof infoMap)

                setInfoMap(newMap)
            })
    }, [isDemo, aliasArr])


    const getStateProducer = (alias: string): PadStateProducer => () => {
        const info = infoMap[alias]

        if (!info) {
            return
        }

        const { type } = info

        const getBreakerState = (breakerPName: string, controlPName: string) => {
            const breakerDynKey = toDynKey(alias, breakerPName)
            const bState = info.points[breakerDynKey] ? {
                switchState: {
                    key: breakerDynKey,
                    state: mapIDynToSwitchState(data?.[breakerDynKey])
                }
            } : undefined

            const controlDynKey = toDynKey(alias, controlPName)
            const cState = info.points[controlDynKey] ? {
                controlState: {
                    key: controlDynKey,
                    state: mapIDynToControlState(data?.[controlDynKey])
                }
            } : undefined

            if (!bState) {
                return undefined
            } else {
                return Object.assign({
                    // name: ''
                }, bState, cState)
            }
        }

        const getRMUState = (loadSwitchPName: string, earthPName: string): RMUState | undefined => {
            const loadSwitchDynKey = toDynKey(alias, loadSwitchPName)
            const earthDynKey = toDynKey(alias, earthPName)
            if (!info.points[loadSwitchDynKey] && !info.points[earthDynKey]) {
                return
            }

            return {
                loadSwitch: info.points[loadSwitchDynKey] ? {
                    key: loadSwitchDynKey,
                    state: mapIDynToSwitchState(data?.[loadSwitchDynKey])
                } : undefined,
                earth: info.points[earthDynKey] ? {
                    key: earthDynKey,
                    state: mapIDynToSwitchState(data?.[earthDynKey])
                } : undefined,
            }
        }

        const rmu1 = getRMUState(pointAliasMap.RMU_LOAD1, pointAliasMap.RMU_EARTH1)
        const rmu2 = getRMUState(pointAliasMap.RMU_LOAD2, pointAliasMap.RMU_EARTH2)
        const rmuArr: PadGraphState['values']['rmu'] = (rmu1 || rmu2) ? [] : undefined
        rmu1 && rmuArr?.push(rmu1)
        rmu2 && rmuArr?.push(rmu2)

        const finalState = {
            type,
            values: {
                breakerUpon: getBreakerState(pointAliasMap.HIGH_BREAKER, pointAliasMap.HIGH_REMOTE),
                breakerBelow: isThreeWinding(type) ? [
                    getBreakerState(pointAliasMap.LOW_BREAKER1, pointAliasMap.LOW_REMOTE1),
                    getBreakerState(pointAliasMap.LOW_BREAKER2, pointAliasMap.LOW_REMOTE2),
                ] : getBreakerState(pointAliasMap.LOW_BREAKER1, pointAliasMap.LOW_REMOTE1),
                disconnState: info.points[pointAliasMap.HIGH_DISCONNECTOR] ? {
                    key: toDynKey(alias, pointAliasMap.HIGH_DISCONNECTOR),
                    // name?: string
                    state: mapIDynToSwitchState(data?.[toDynKey(alias, pointAliasMap.HIGH_DISCONNECTOR)])
                } : undefined,
                earthConnState: info.points[pointAliasMap.HIGH_EARTH] ? {
                    key: toDynKey(alias, pointAliasMap.HIGH_EARTH),
                    // name?: string
                    state: mapIDynToSwitchState(data?.[toDynKey(alias, pointAliasMap.HIGH_EARTH)])
                } : undefined,
                rmu: rmuArr
            }
        }
        return finalState
    }

    const getEleProducer = (alias: string): PadGraphEleProducer =>
        (start: Point, size: EleRect, options?: CommonOptions & PadGraphOptions) => {
            const state = getStateProducer(alias)()
            if (state) {
                return padGraph({
                    start: [start],
                    rect: size,
                    state: state,
                    options: options || {}
                })
            }
        }

    const handleRename = (key: string, value: string) => {
        console.log(key, value);
    }

    return {
        infoMap,
        data,
        getStateProducer,
        getElementProducer: getEleProducer,
        handleRename
    }
}

export const PADDiagram: React.FC<PADDiagramCfg> = ({ alias, isDemo = false, pointAliasMap }) => {
    const { elementProducer } = usePADDiagram(alias, isDemo, pointAliasMap)

    const draw = (s: Konva.Stage) => {
        const pad = elementProducer(point(0, 1), { width: 260, height: 266 }, {
            endWithArrow: true,
            onClick: (key, e) => {
                PointEvt.popMenu(key, e.evt)
            },
            startType: 'origin'
        })
        if (pad) {
            const l = new Konva.Layer()
            l.add(pad.ele)
            s.add(l)
        }
    }

    return <div className={styles.container} >
        <KonvaWrap draw={draw} />
    </div>
}

export type IDiagramCfg = {
    customAssetAlias?: string
} & PADPointAliasMapCfg & PageCardConfig

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const DiagramDefaultCfg: IDiagramCfg = {
    title: '',
    customAssetAlias: '',
    isEMS: false,
}

const WiringDiagram: WidgetElement<IDiagramCfg> = (props) => {
    const { configure, isDemo } = props;

    const alias = isDemo ? 'demo' : getAssetAlias(props.assetAlias, configure?.customAssetAlias)
    if (!alias) {
        console.error('empty asset alias');
        return <div></div>
    }

    return <PageCard {...configure}>
        <PADDiagram isDemo={!!isDemo} alias={alias} refreshInterval={TimerInterval as number} pointAliasMap={configure.padPointMap || getPADDefaultAliasMap(false)} />
    </PageCard>
}

export default WiringDiagram

