import { message } from "antd"
import { notify } from "Notify"
import React, { useEffect, useRef, useState } from "react"
import dao, { DEVICE_TYPE } from "./dao"
import {
    BreakerProps, CanvasPointEvent, DeviceGraphType1, DeviceGraphType10,
    DeviceGraphType11,
    DeviceGraphType12,
    DeviceGraphType13,
    DeviceGraphType14, DeviceGraphType2,
    DeviceGraphType3,
    DeviceGraphType4,
    DeviceGraphType5,
    DeviceGraphType6,
    DeviceGraphType7,
    DeviceGraphType8,
    DeviceGraphType9, GRAPH_TYPE
} from './Graph'
import styles from './index.mscss'
import { CONTROL_STATE } from "./Shapes"
import { mapToControlState, mapToSwitchState } from "./utils"
import { PointEvt } from "@/common/util-scada";
import { msgTag } from '@/common/lang';
const msg = msgTag("solartransformer");

const POINTS = {
    PAD: {
        HIGH_REMOTE: 'BXTF.BreakerClass', // 高压侧开关远方就地	
        HIGH_DISCONNECTOR: 'BXTF.IsolationSwitchClose', // 高压侧隔离开关合位	
        HIGH_BREAKER: 'BXTF.LoadSwitchClose', // 高压侧断路器开关合位	
        HIGH_EARTH: 'BXTF.EarthSwitchClose', // 高压侧接地开关合位	
        RMU_LOAD1: 'BXTF.RMUIsolationSwitchClose1', // 环网开关1合位	
        RMU_EARTH1: 'BXTF.RMUEarthSwitchClose1', // 环网接地开关1合位	
        RMU_LOAD2: 'BXTF.RMUIsolationSwitchClose2', // 环网开关2合位	
        RMU_EARTH2: 'BXTF.RMUEarthSwitchClose2', // 环网接地开关2合位	
        LOW_REMOTE1: 'BXTF.Breaker1Class', // 1#低压侧断路器远方就地	
        LOW_REMOTE2: 'BXTF.Breaker2Class', // 2#低压侧断路器远方就地	
        LOW_BREAKER1: 'BXTF.SingleBreaker01', // 1#低压断路器合
        LOW_BREAKER2: 'BXTF.SingleBreaker02', // 2#低压断路器合
    }
}

const { PAD } = POINTS
type PADDynData = Partial<{ [Property in keyof typeof PAD]: number }>


export type PADDiagramCfg = {
    isDemo?: boolean;
    alias: string; // 设备别名
    refreshInternal?: number
}


export const PADDiagram: React.FC<PADDiagramCfg> = ({ alias, isDemo = false, refreshInternal }) => {
    const [data, setData] = useState<PADDynData>()
    const [type, setType] = useState<GRAPH_TYPE>()
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isDemo) {
            setType(GRAPH_TYPE.TYPE14)
            setData({})
        } else {
            const fetchData = () => {
                dao.getBayTypeSub(alias).then(type => {
                    if (!type) {
                        throw new Error('cannot find type for alias: ' + alias)
                    }
                    setType(parseInt(type))
                })
                dao.getDevicePoint(alias, DEVICE_TYPE.PAD)
                    .then(points => points.map(p => {
                        const entry = Object.entries(POINTS.PAD).find(v => (alias + '.' + v[1]) === p)
                        return entry && {
                            key: `1:61:${p}:9`,
                            decimal: 0,
                            pointName: entry[1]
                        }
                    }).filter(o => o))
                    .then(async reqData => {
                        const dynData = await dao.getDynData(reqData as { key: string, decimal: number }[])
                        const padDynData = dynData.reduce((p, c) => {
                            const pointName = reqData.find(r => r?.key === c.key)?.pointName
                            if (!pointName) {
                                return p
                            }
                            const value = c.status_value !== 0 ? undefined : parseInt(c.raw_value)
                            return {
                                ...p,
                                [pointName]: value
                            }
                        }, {} as PADDynData)
                        setData(padDynData)
                    })
            }

            fetchData()
            if (refreshInternal) {
                const timerId = setInterval(fetchData, refreshInternal)
                return () => {
                    clearInterval(timerId)
                }
            }
        }
    }, [alias])

    const onBreakerClick = (breaker: BreakerProps, evt: CanvasPointEvent) => {
        const { controlState, key } = breaker
        PointEvt.popMenu(`1:61:${alias}.${key}:9`, evt.konvaEvt.evt, [{
            name: msg('yk'),
            click: (_, __) => {
                if (controlState === CONTROL_STATE.REMOTE) {
                    PointEvt.ykyt('PopupMenu 30', `1:61:${alias}.${breaker.key}:9`);
                } else {
                    notify(msg('yk_warn'))
                }
            }
        }])
    }

    const propMap = {
        breakerUpon: {
            key: PAD.HIGH_BREAKER,
            controlState: mapToControlState(data?.[PAD.HIGH_REMOTE]),
            switchState: mapToSwitchState(data?.[PAD.HIGH_BREAKER])
        },
        onBreakerClick: onBreakerClick,
        earthConnState: mapToSwitchState(data?.[PAD.HIGH_EARTH]),
        disconnState: mapToSwitchState(data?.[PAD.HIGH_DISCONNECTOR]),
        breakerBelow: {
            key: PAD.LOW_BREAKER1,
            controlState: mapToControlState(data?.[PAD.LOW_REMOTE1]),
            switchState: mapToSwitchState(data?.[PAD.LOW_BREAKER1])
        },
        breakerBelowDoubleCol: {
            left: {
                key: PAD.LOW_BREAKER1,
                controlState: mapToControlState(data?.[PAD.LOW_REMOTE1]),
                switchState: mapToSwitchState(data?.[PAD.LOW_BREAKER1])
            },
            right: {
                key: PAD.LOW_BREAKER2,
                controlState: mapToControlState(data?.[PAD.LOW_REMOTE2]),
                switchState: mapToSwitchState(data?.[PAD.LOW_BREAKER2])
            }
        },
    }

    const threadCommProps = {
        RMU: {
            middle: {
                earthConnState: mapToSwitchState(data?.[PAD.RMU_EARTH1]),
                loadSwitchState: mapToSwitchState(data?.[PAD.RMU_LOAD1])
            },
            right: {
                earthConnState: mapToSwitchState(data?.[PAD.RMU_EARTH2]),
                loadSwitchState: mapToSwitchState(data?.[PAD.RMU_LOAD2])
            },
            onBreakerClick: propMap.onBreakerClick
        },
        MAIN: {
            breakerUpon: propMap.breakerUpon,
            onBreakerClick: propMap.onBreakerClick
        }
    }

    return <div className={styles.container} ref={containerRef}>
        {type === GRAPH_TYPE.TYPE1 && <DeviceGraphType1
            {...threadCommProps.MAIN}
            breakerBelow={propMap.breakerBelow}
        />}
        {type === GRAPH_TYPE.TYPE2 && <DeviceGraphType2
            {...threadCommProps.MAIN}
            disconnState={propMap.disconnState}
            breakerBelow={propMap.breakerBelow}
        />}
        {type === GRAPH_TYPE.TYPE3 && <DeviceGraphType3
            {...threadCommProps.MAIN}
            earthConnState={propMap.earthConnState}
            disconnState={propMap.disconnState}
            breakerBelow={propMap.breakerBelow}
        />}
        {type === GRAPH_TYPE.TYPE4 && <DeviceGraphType4
            {...threadCommProps.MAIN}
            breakerBelow={propMap.breakerBelowDoubleCol}
        />}
        {type === GRAPH_TYPE.TYPE5 && <DeviceGraphType5
            {...threadCommProps.MAIN}
            disconnState={propMap.disconnState}
            breakerBelow={propMap.breakerBelowDoubleCol}
        />}
        {type === GRAPH_TYPE.TYPE6 && <DeviceGraphType6
            {...threadCommProps.MAIN}
            earthConnState={propMap.earthConnState}
            disconnState={propMap.disconnState}
            breakerBelow={propMap.breakerBelowDoubleCol}
        />}
        {type === GRAPH_TYPE.TYPE7 && <DeviceGraphType7
            {...threadCommProps.RMU}
            left={{
                breakerUpon: propMap.breakerUpon,
                breakerBelow: propMap.breakerBelow
            }}
            onBreakerClick={onBreakerClick}
        />}
        {type === GRAPH_TYPE.TYPE8 && <DeviceGraphType8
            {...threadCommProps.RMU}
            left={{
                earthConnState: propMap.earthConnState,
                breakerUpon: propMap.breakerUpon,
                breakerBelow: propMap.breakerBelow
            }}
            onBreakerClick={onBreakerClick}
        />}
        {type === GRAPH_TYPE.TYPE9 && <DeviceGraphType9
            {...threadCommProps.RMU}
            left={{
                disconnState: propMap.disconnState,
                breakerUpon: propMap.breakerUpon,
                breakerBelow: propMap.breakerBelow
            }}
            onBreakerClick={onBreakerClick}
        />}
        {type === GRAPH_TYPE.TYPE10 && <DeviceGraphType10
            {...threadCommProps.RMU}
            left={{
                disconnState: propMap.disconnState,
                earthConnState: propMap.earthConnState,
                breakerUpon: propMap.breakerUpon,
                breakerBelow: propMap.breakerBelow
            }}
            onBreakerClick={onBreakerClick}
        />}
        {type === GRAPH_TYPE.TYPE11 && <DeviceGraphType11
            {...threadCommProps.RMU}
            left={{
                breakerUpon: propMap.breakerUpon,
                breakerBelow: propMap.breakerBelowDoubleCol
            }}
            onBreakerClick={onBreakerClick}
        />}
        {type === GRAPH_TYPE.TYPE12 && <DeviceGraphType12
            {...threadCommProps.RMU}
            left={{
                earthConnState: propMap.earthConnState,
                breakerUpon: propMap.breakerUpon,
                breakerBelow: propMap.breakerBelowDoubleCol
            }}
            onBreakerClick={onBreakerClick}
        />}
        {type === GRAPH_TYPE.TYPE13 && <DeviceGraphType13
            {...threadCommProps.RMU}
            left={{
                disconnState: propMap.disconnState,
                breakerUpon: propMap.breakerUpon,
                breakerBelow: propMap.breakerBelowDoubleCol
            }}
            onBreakerClick={onBreakerClick}
        />}
        {type === GRAPH_TYPE.TYPE14 && <DeviceGraphType14
            {...threadCommProps.RMU}
            left={{
                disconnState: propMap.disconnState,
                earthConnState: propMap.earthConnState,
                breakerUpon: propMap.breakerUpon,
                breakerBelow: propMap.breakerBelowDoubleCol
            }}
            onBreakerClick={onBreakerClick}
        />}
    </div>
}

export type IDiagramCfg = {
    alias: string;
    refreshInterval: number
}

const Diagram: React.FC<IDiagramCfg> = (props) => {
    const { alias } = props;
    return <PADDiagram isDemo={false} alias={alias} refreshInternal={props.refreshInterval}/>
}
export default Diagram

