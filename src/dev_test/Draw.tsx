import WidgetContext from '@/components_widgets/common/context';
import padGraph, { GRAPH_TYPE } from 'DrawLib/groups/padGraph';
import { Input, InputNumber, Select } from 'antd';
import Konva from "konva";
import React, { useCallback, useState } from "react";
import { CONTROL_STATE, HEALTH_STATE, SWITCH_STATE } from "../components/DrawLib/constant";
import { calcCusEventProps, fireCustomEvent, point } from "../components/DrawLib/utils";
import styles from './Draw.module.scss';
import KonvaWrap from 'KonvaWrap';
import { windingTransformer } from 'DrawLib/shapes';

export default () => {
    const [ch, setH] = useState(90)
    const [cw, setW] = useState(80)
    const [sState1, setSState1] = useState<SWITCH_STATE>(SWITCH_STATE.CONNECTED)
    const [sState2, setSState2] = useState<SWITCH_STATE>(SWITCH_STATE.CONNECTED)
    const [cState, setCState] = useState<CONTROL_STATE>(CONTROL_STATE.LOCAL)
    const [hState, setHState] = useState<HEALTH_STATE>(HEALTH_STATE.HEALTHY)
    const [text, setText] = useState<string>('text')

    const stateMap = {
        s1Key: sState1,
        s2Key: sState2,
        s1Key_label: text + 's1',
        s2Key_label: text + 's2',
        cKey: cState,
        cKey_label: text + 'c',
        domName: {
            title: '测试',
            data: [
                {
                    dynKey: 'dynKey',
                    valueColor: 'red',
                    value: '123456789012.123445',
                    unit: 'kw',
                    nameCn: '测点中文名:',
                    nameEn: 'english name',
                    tableNo: 62,
                    fieldNo: 9
                },
            ]
        }
    }
    const draw = useCallback((s: Konva.Stage, acOpt, opt) => {
        const { domEleRegister } = opt
        const l = new Konva.Layer()
        s.add(l)

        const rect_normal = {
            width: 130, height: 272
        }
        const rect_rmu = {
            width: 250, height: 272
        }

        l.add(padGraph({
            start: [point(50, 20)],
            state: {
                type: GRAPH_TYPE.TYPE1,
                values: {
                    breakerUpon: {
                        switchState: {
                            key: 'highSwitch',
                            state: SWITCH_STATE.MISSING
                        }
                    },
                    breakerBelow: {
                        switchState: {
                            key: 'lowSwitch1',
                            state: SWITCH_STATE.MISSING
                        }
                    },
                }
            },
            options: {
                transformOpt: {
                    highType: 'triangle',
                    lowType: 'triangle'
                }
            },
            rect: rect_normal
        }).ele)

        l.add(padGraph({
            start: [point(150, 20)],
            state: {
                type: GRAPH_TYPE.TYPE2,
                values: {
                    breakerUpon: {
                        switchState: {
                            key: 'highSwitch',
                            state: SWITCH_STATE.MISSING
                        }
                    },
                    earthConnState: {
                        key: 'earthConn',
                        state: SWITCH_STATE.MISSING
                    },
                    disconnState: {
                        key: 'disconn',
                        state: SWITCH_STATE.MISSING
                    },
                    breakerBelow: [
                        {
                            switchState: {
                                key: 'lowSwitch1',
                                state: SWITCH_STATE.MISSING
                            }
                        },
                        {
                            switchState: {
                                key: 'lowSwitch2',
                                state: SWITCH_STATE.MISSING
                            }
                        }
                    ]
                }
            },
            options: {
                transformOpt: {
                    highType: 'triangle',
                    lowType: 'triangle'
                }
            },
            rect: rect_normal
        }).ele)

        l.add(padGraph({
            start: [point(100, 320)],
            state: {
                type: GRAPH_TYPE.TYPE3,
                values: {
                    breakerUpon: {
                        switchState: {
                            key: 'highSwitch',
                            state: SWITCH_STATE.MISSING
                        }
                    },
                    breakerBelow: {
                        switchState: {
                            key: 'lowSwitch1',
                            state: SWITCH_STATE.MISSING
                        }
                    },
                    rmu: [
                        {
                            loadSwitch: {
                                key: 'loadSwitch1',
                                state: SWITCH_STATE.MISSING
                            },
                            earth: {
                                key: 'earth1',
                                state: SWITCH_STATE.MISSING
                            }
                        },
                        {
                            loadSwitch: {
                                key: 'loadSwitch2',
                                state: SWITCH_STATE.MISSING
                            },
                            earth: {
                                key: 'earth2',
                                state: SWITCH_STATE.MISSING
                            }
                        },
                    ]
                }
            },
            options: {},
            rect: rect_rmu
        }).ele)

        l.add(padGraph({
            start: [point(350, 320)],
            state: {
                type: GRAPH_TYPE.TYPE4,
                values: {
                    breakerUpon: {
                        switchState: {
                            key: 'highSwitch',
                            state: SWITCH_STATE.MISSING
                        }
                    },
                    breakerBelow: [
                        {
                            switchState: {
                                key: 'lowSwitch1',
                                state: SWITCH_STATE.MISSING
                            }
                        },
                        {
                            switchState: {
                                key: 'lowSwitch2',
                                state: SWITCH_STATE.MISSING
                            }
                        }
                    ],
                    rmu: [
                        {
                            loadSwitch: {
                                key: 'loadSwitch1',
                                state: SWITCH_STATE.MISSING
                            },
                            earth: {
                                key: 'earth1',
                                state: SWITCH_STATE.MISSING
                            }
                        },
                        {
                            loadSwitch: {
                                key: 'loadSwitch2',
                                state: SWITCH_STATE.MISSING
                            },
                            earth: {
                                key: 'earth2',
                                state: SWITCH_STATE.MISSING
                            }
                        },
                    ]
                }
            },
            options: {},
            rect: rect_rmu
        }).ele)

        l.add(padGraph({
            start: [point(350, 20)],
            state: {
                type: GRAPH_TYPE.TYPE5,
                values: {
                    breakerUpon: {
                        switchState: {
                            key: 'highSwitch',
                            state: SWITCH_STATE.MISSING
                        }
                    },
                    breakerBelow: [
                        {
                            switchState: {
                                key: 'lowSwitch1',
                                state: SWITCH_STATE.MISSING
                            }
                        },
                        {
                            switchState: {
                                key: 'lowSwitch2',
                                state: SWITCH_STATE.MISSING
                            }
                        }
                    ]
                }
            },
            options: {},
            rect: rect_normal
        }).ele)

    }, [])

    return <WidgetContext.Provider value={{ widgetName: 'test', isDemo: false, componentId: '1' }}>
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.wrapper} style={{ width: cw + '%', height: ch + '%', padding: '2em' }}>
                    <KonvaWrap width={500} height={700} draw={draw} stateMap={stateMap} />
                </div>
            </div>
        </div>
    </WidgetContext.Provider>
}

export const TooltipDemo = () => {
    return <div className={styles.wrapper} style={{ width: '100%', height: '100%', padding: '2em' }}>
        <KonvaWrap width={100} height={100} draw={(stage, actualOpt, opt) => {
            const l = new Konva.Layer()
            const r = new Konva.Rect({
                x: 0,
                y: 0,
                width: 50,
                height: 50,
                fill: 'blue'
            })
            r.on('mouseover', (e) => {
                const cusEvtProps = calcCusEventProps(e, 'eleKey')
                cusEvtProps && fireCustomEvent('showCustomNode', {
                    ...cusEvtProps,
                    data: {
                        text: 'test'
                    }
                })
            })
            r.on('mouseleave', (e) => {
                // fireCustomEvent('hideCustomNode', )
                const cusEvtProps = calcCusEventProps(e, 'eleKey')
                cusEvtProps && fireCustomEvent('hideCustomNode', {
                    ...cusEvtProps,
                    data: {
                        text: 'leave'
                    }
                })
            })
            l.add(r)
            stage.add(l)
        }} cusTooltipNodeProvider={(evt) => {
            return <div style={{ background: 'red', width: '200px', height: '200px' }}>
                test
            </div>
        }} />
    </div>
}