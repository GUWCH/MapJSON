import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { notify } from 'Notify';
import EchartsWrap from 'EchartsWrap';
import { EmptyList, LegalData, _dao } from '@/common/dao';
import { DateUtil } from '@/common/utils';
import scadaUtil, { 
    TimerInterval, 
    CommonTimerInterval, 
    CommonHisTimerInterval 
} from '../../../../common/const-scada';
import { msgTag } from '@/common/lang';
import EnvLoading from 'EnvLoading';
import { 
    ALARM_MAX,
    ALARM_LEVEL_STR,
    COMMON_DECIMAL, 
    HistoryCurveReq 
} from '../../../CONSTANT';
import { DetailTemplate, DetailNav } from '../../components/Detail';
import CurrentComponent, { UNUSED_NO } from '../components/StringCurrent';
import DeviationDialog, { getDisperseAttrs } from '../components/DeviationDialog';
import LightWord from '../components/LightWord';
import { getEchartsOption } from '../echartsUtil';
import { DCCBX_DISPERSE, DCCBX_STATE, DCCBX_TEMP, DCCBX_VOL } from '../constant';
import { NumberFactor } from '@/common/util-scada';

import '@/common/css/app.scss';
import './index.scss';

const msg = msgTag("solardevice");
const solarCBXPrefix = "env-solar-cbx";

export default function DCCBX({ current }) {
    const [alarmRecords, setAlarmRecords] = useState([]);
    const [dynValueMap, setDynValueMap] = useState({});
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState({
        leftTop: false,
        leftBottom: false,
        right: false
    });
    const [showDialog, setShowDialog] = useState(false);
    const [deviationThresoldValueMap, setDeviationThresoldValueMap] = useState({});

    const lastAlarmId = useRef(0);
    const lastAlarmNo = useRef(0);
    const currentPoints = useRef(undefined);
    const invalidCurrentPoints = useRef([]);
    const disperseEnable = useRef(false);
    const realTimer = useRef(null);
    const hisTimer = useRef(null);
    const alarmTimer = useRef(null);

    useEffect(() => {
        if (current.alias){
            lastAlarmId.current = 0;
            lastAlarmNo.current = 0;
            currentPoints.current = undefined;
            disperseEnable.current = false;
            invalidCurrentPoints.current = [];

            setAlarmRecords([]);
            setChartData([]);
            setDynValueMap({});
            setDeviationThresoldValueMap({});

            setLoading(Object.assign({}, loading, {
                leftTop: true,
                leftBottom: true,
                right: true
            }));

            reqAlarm();

            getDeviationThresold(current.alias);
            Promise.all([
                fetchDevicePoint(current.alias)
            ])
            .catch(error => console.log(error))
            .finally(() => {
                reqAll();
            });
        }

        return () => {
            clearTimeout(realTimer.current);
            clearTimeout(hisTimer.current);
            clearTimeout(alarmTimer.current);
        };
    }, [current.alias]);

    const reqAll = useCallback(() => {
        reqRealTimeData(() => {
            setLoading(loading => Object.assign({}, loading, {
                leftTop: false
            }));

            reqHisData(() => {
                setLoading(loading => Object.assign({}, loading, {
                    leftBottom: false
                }));
            });
        }); 
    }, [current.alias]);

    // 实时数据定时器请求
    const reqRealTimeData = useCallback((cb) => {
        if(!current.alias){
            typeof cb === 'function' && cb();
            return;
        }

        const req = (cb) => {
            fetchNormalDynData(current.alias, currentPoints.current)
            .catch(error => console.log(error))
            .finally(() => {
                typeof cb === 'function' && cb();

                clearTimeout(realTimer.current);
                realTimer.current = setTimeout(() => {
                    req();
                }, TimerInterval);
            });
        };

        clearTimeout(realTimer.current);
        req(cb);
    }, [current.alias]);

    const reqAlarm = useCallback(() => {
        if(!current.alias){
            return;
        }

        const req = () => {
            fetchAlarm(current.alias)
            .catch(error => console.log(error))
            .finally(() => {
                setLoading(loading => Object.assign({}, loading, {
                    right: false
                }));

                clearTimeout(alarmTimer.current);
                alarmTimer.current = setTimeout(() => {
                    req();
                }, CommonTimerInterval);
            });
        };

        clearTimeout(alarmTimer.current);
        req();
    }, [current.alias]);

    // 历史数据定时器请求
    const reqHisData = useCallback((cb) => {
        if (!current.alias || 
            !Array.isArray(currentPoints.current) || 
            currentPoints.current.length === 0
        ) {
            typeof cb === 'function' && cb();
            return;
        }

        const req = (cb) => {
            const disperseKey = `1:62:${current.alias}.${DCCBX_DISPERSE}:9`;
            fetchCurrentTrend([{
                id: '',
                decimal: 2,
                key: disperseKey
            }].concat(currentPoints.current.filter(point => { // 排除掉未接支路
                return invalidCurrentPoints.current.indexOf(point.key) === -1;
            })), disperseKey)
            .catch(error => console.log(error))
            .finally(() => {
                typeof cb === 'function' && cb();

                clearTimeout(hisTimer.current);
                hisTimer.current = setTimeout(() => {
                    req();
                }, CommonHisTimerInterval);
            });
        };

        clearTimeout(hisTimer.current);
        req(cb);
    }, [current.alias]);

    const getDeviationThresold = async (alias) => {
        setDeviationThresoldValueMap(await getDisperseAttrs(`${alias}.${DCCBX_DISPERSE}`) || {});
    }

    const fetchNormalDynData = (alias, supplementPoints) => {
        const data = [{
            id: '',
            decimal: 0,
            key: `1:61:${alias}.${DCCBX_STATE}:9`
        }, {
            id: '',
            decimal: 2,
            key: `1:62:${alias}.${DCCBX_DISPERSE}:9`
        }, {
            id: '',
            decimal: 2,
            key: `1:62:${alias}.${DCCBX_TEMP}:9`
        }, {
            id: '',
            decimal: 2,
            key: `1:62:${alias}.${DCCBX_VOL}:9`
        }];
        return fetchDynData(data.concat(Array.isArray(supplementPoints) ? supplementPoints : []));
    }

    const fetchDevicePoint = (alias) => {
        return _dao.getBranchCurrentPoints(alias)
            .then(points => {
                if (points?.length > 0) {
                    currentPoints.current = points.map(o => ({
                        id: "", 
                        decimal: COMMON_DECIMAL, 
                        key: `1:${o.table_no}:${o.point_alias}:${o.field_no}` 
                    }));
                }
                return points;
            })
    }

    const fetchDynData = (data) => {
        return _dao.getDynData(data)
            .then(res => {
                const valueMap = {};
                if (LegalData(res)) {
                    const data = res.data || [];
                    data.forEach(o => {
                        const alias = o.key.split(":")[2];
                        if (alias) {
                            valueMap[alias] = o;
                        }
                    });
                    invalidCurrentPoints.current = (currentPoints.current || []).filter(p => {
                        const {status_value} = valueMap[p.key.split(":")[2]];
                        return String(status_value) === String(UNUSED_NO);
                    }).map(p => p.key);
                    setDynValueMap(valueMap);                    
                }
                return valueMap;
            });
    }

    const fetchAlarm = (alias) => {
        return _dao.getAlarm({
            start_id: lastAlarmId.current,
            start_no: lastAlarmNo.current,
            seq_type: (!lastAlarmId.current && !lastAlarmNo.current) ? 1 : 0,
            max_cnt: ALARM_MAX,
            level_list: ALARM_LEVEL_STR,
            node_name_list: alias,
            app_list: ''
        }).then(records => {
            if (!EmptyList(records)) {
                lastAlarmId.current = records.last_time_id;
                lastAlarmNo.current = records.last_no;

                setAlarmRecords(rs => scadaUtil.handleAlarm(rs, records.data || [], ALARM_MAX));
            }
        })
    }

    const fetchCurrentTrend = (data, disperseKey) => {
        const startTime = DateUtil.getStdNowTime(true);
        const endTime = DateUtil.getStdNowTime(false);
        return _dao.getCurve(Object.assign({}, HistoryCurveReq, {
            start_time: startTime,
            end_time: endTime,
            interval_type: 0,
            sample_cycle: 300,
            curve: data.map(o=>({...o,sub_type:"4097"}))
        }))
        .then(res => {
            if (!EmptyList(res)) {
                setChartData(res.data.map(d => {
                    let { key } = d;
                    if(key === disperseKey){
                        d.Points = d.Points.map(ele => {
                            ele.y = NumberFactor(ele.y, 100);
                            return ele;
                        });
                        return d;
                    }
                    return d;
                }));
            }
        })
    }

    const renderHeader = () => {
        const statusAlias = `${current?.alias}.${DCCBX_STATE}`;
        const statusColor = dynValueMap[statusAlias]?.color || '#fff';
        const disperseAlias = `${current?.alias}.${DCCBX_DISPERSE}`;
        const tempAlias = `${current?.alias}.${DCCBX_TEMP}`;
        const volAlias = `${current?.alias}.${DCCBX_VOL}`;
        return <header className={`${solarCBXPrefix}-header`}>
            <DetailNav 
                detailAlias={current.alias}
                detailName={current.name}
                statusDesc={dynValueMap[statusAlias]?.display_value || "-"}
                statusColor={statusColor}
            />
            <div>
                <span className={`${solarCBXPrefix}-header-target`}>{msg('DCCBX.deviation')}:</span>
                <span className={`${solarCBXPrefix}-header-value`}>{NumberFactor(dynValueMap[disperseAlias]?.display_value || "-", 100)}%</span>
                <span className={`${solarCBXPrefix}-header-target`}>{msg('DCCBX.temp')}:</span>
                <span className={`${solarCBXPrefix}-header-value`}>{dynValueMap[tempAlias]?.display_value || "-"}℃</span>
                <span className={`${solarCBXPrefix}-header-target`}>{msg('DCCBX.vol')}:</span>
                <span>{dynValueMap[volAlias]?.display_value || "-"}V</span>
            </div>
        </header>;
    }

    const renderCurrent = () => {
        return <div className={`${solarCBXPrefix}-left-current`}>
            <CurrentComponent
                title={msg('DCCBX.current')}
                data={(currentPoints.current || []).map(point => {
                    return dynValueMap[point.key.split(':')[2]] || {};
                })}
                beforeChange={() => {
                    setLoading(loading => Object.assign({}, loading, {
                        leftTop: true
                    }));
                }}
                afterChange={() => {
                    reqAll();
                    setLoading(loading => Object.assign({}, loading, {
                        leftTop: false
                    }));
                }}
            ></CurrentComponent>
            <EnvLoading isLoading={loading.leftTop}></EnvLoading>
        </div>
    }

    const renderChart = () => {
        return <div className={`${solarCBXPrefix}-left-chart`}>
            <div className={`${solarCBXPrefix}-left-chart-header`}>
                {msg('DCCBX.deviation_current_chart')}
                <div onClick={e => {
                    if(!deviationThresoldValueMap.valid){
                        notify(msg('DCCBX.denied'));
                        return;
                    }

                    setShowDialog(true);
                }}
                    className={`${solarCBXPrefix}-left-chart-header-button`}>
                    {msg('DCCBX.setting')}
                </div>
            </div>
            <div className={`${solarCBXPrefix}-left-chart-content`}>
                <EchartsWrap 
                    data={{
                        data: Object.assign([], chartData),
                        disperseLimitValue: NumberFactor(deviationThresoldValueMap.value, 100),
                        disperseName: msg('disperse')
                    }}
                    getOption={(data, ec) => {
                        return getEchartsOption(data, ec);
                    }}
                    isNotMergeOpt={true}
                />
            </div>
            <EnvLoading isLoading={loading.leftBottom}></EnvLoading>
        </div>
    }

    const renderAlarm = () => {
        return <React.Fragment>
            <div className={`${solarCBXPrefix}-right-alarm-header`}>{msg('DCCBX.alarm')}</div>
            <div className={`${solarCBXPrefix}-right-alarm-content`}>
                {
                    alarmRecords.map(alarm => {
                        return <div 
                            key={alarm.id + '.' + alarm.no} 
                            style={{color: alarm.level_color}}
                        >
                            <div>
                                <div style={{
                                    backgroundColor: alarm.level_color
                                }}></div>
                                <div>{alarm.content}</div>
                            </div>
                            <div>{ alarm.time }</div>
                        </div>
                    })
                }
            </div>
            <EnvLoading isLoading={loading.right}></EnvLoading>
        </React.Fragment>
    }

    const renderDeviation = () => {
        return useMemo(() => {
            return <DeviationDialog
                show={showDialog}
                alias={`${current.alias}.${DCCBX_DISPERSE}`}
                attrs={deviationThresoldValueMap}
                disperseLimitValue={deviationThresoldValueMap.value}
                beforeUpdate={() => {
                    setShowDialog(false);
                    setLoading(loading => Object.assign({}, loading, {
                        leftBottom: true
                    }));
                }}
                afterUpdate={(success, value) => {
                    if(success){
                        setDeviationThresoldValueMap(Object.assign({}, deviationThresoldValueMap, {
                            value: value
                        }));
                    }
                    setLoading(loading => Object.assign({}, loading, {
                        leftBottom: false
                    }));
                }}
                onCancel={() => {setShowDialog(false);}}
            ></DeviationDialog>
        }, [current.alias, deviationThresoldValueMap.value, showDialog])
    };

    return (
        <DetailTemplate header={renderHeader()}>
            <div className={`${solarCBXPrefix}`}>
                <div className={`${solarCBXPrefix}-left`}>
                    {renderCurrent()}
                    {renderChart()}
                </div>
                <div className={`${solarCBXPrefix}-right`}>
                    <div className={`${solarCBXPrefix}-right-gz`}>
                        <LightWord 
                            assetAlias={current.alias} 
                            title={msg('di_info')}
                            filterAssetName={current.name}
                            timeout={TimerInterval}
                        />
                    </div>
                    <div className={`${solarCBXPrefix}-right-alarm`}>{renderAlarm()}</div>
                </div>
            </div>
            {renderDeviation()}
        </DetailTemplate>
    )
}

DCCBX.propTypes = {
    current: PropTypes.shape({
        alias: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    }).isRequired
};
