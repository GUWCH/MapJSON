import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { EmptyList, LegalData, _dao } from '@/common/dao';
import { NumberUtil } from '@/common/utils';
import scadaUtil, { TimerInterval, CommonTimerInterval } from '@/common/const-scada';
import { msgTag } from '@/common/lang';
import { ALARM_MAX, ALARM_LEVEL_STR } from '../../../CONSTANT';
import { DetailTemplate, DetailNav } from '../../components/Detail';
import EnvLoading from '@/components/EnvLoading';
import {
    TRANSFORMER_HIA, TRANSFORMER_HIB, TRANSFORMER_HIC, TRANSFORMER_HUA, TRANSFORMER_HUB, TRANSFORMER_HUC,
    TRANSFORMER_HP, TRANSFORMER_LIA1, TRANSFORMER_LIB1, TRANSFORMER_LIC1, TRANSFORMER_LUA1, TRANSFORMER_LUB1,
    TRANSFORMER_LUC1, TRANSFORMER_LP1, TRANSFORMER_LIA2, TRANSFORMER_LIB2, TRANSFORMER_LIC2, TRANSFORMER_LUA2,
    TRANSFORMER_LUB2, TRANSFORMER_LUC2, TRANSFORMER_LP2, TRANSFORMER_HQ, TRANSFORMER_HCOS, TRANSFORMER_LQ1,
    TRANSFORMER_LCOS1, TRANSFORMER_LQ2, TRANSFORMER_LCOS2, TRANSFORMER_HSWITCH, TRANSFORMER_HFAULT, TRANSFORMER_HOILTEMP,
    TRANSFORMER_LOIL, TRANSFORMER_POIL, TRANSFORMER_LGAS, TRANSFORMER_HGAS, TRANSFORMER_SMOGALARM, TRANSFORMER_SGZ,
    TRANSFORMER_HDOOR, TRANSFORMER_LDOOR, TRANSFORMER_BREAKER1, TRANSFORMER_BREAKER2, TRANSFORMER_STATE
} from '../constant';
import LightWord from '../components/LightWord';
import AllData from '../components/AllData';

import './index.scss';
import Diagram from './gragh/WiringDiagram';

const msg = msgTag("solartransformer");
const solarTransformerPrefix = "env-solar-transformer";

function buildDynData(alias, type) {
    if (type === "yc") {
        return [
            [
                {
                    key: `1:62:${alias}.${TRANSFORMER_HIA}:9`,
                    alias: `${alias}.${TRANSFORMER_HIA}`,
                    title: msg('hia'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_HIB}:9`,
                    alias: `${alias}.${TRANSFORMER_HIB}`,
                    title: msg('hib'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_HIC}:9`,
                    alias: `${alias}.${TRANSFORMER_HIC}`,
                    title: msg('hic'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.BXTF.Freq:9`,
                    alias: `${alias}.BXTF.Freq`,
                    title: msg('Freq'),
                    unit: 'Hz'
                },
                {
                    key: `1:62:${alias}.BXTF.Temp:9`,
                    alias: `${alias}.BXTF.Temp`,
                    title: msg('Temp'),
                    unit: '℃'
                }, {
                    key: `1:62:${alias}.BXTF.WindingTemp:9`,
                    alias: `${alias}.BXTF.WindingTemp`,
                    title: msg('WindingTemp'),
                    unit: '℃'
                },
                {
                    key: `1:62:${alias}.BXTF.Oil:9`,
                    alias: `${alias}.BXTF.Oil`,
                    title: msg('Oil'),
                    unit: ''
                }
            ],
            [
                {
                    key: `1:62:${alias}.${TRANSFORMER_LIA1}:9`,
                    alias: `${alias}.${TRANSFORMER_LIA1}`,
                    title: msg('lia1'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LIB1}:9`,
                    alias: `${alias}.${TRANSFORMER_LIB1}`,
                    title: msg('lib1'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LIC1}:9`,
                    alias: `${alias}.${TRANSFORMER_LIC1}`,
                    title: msg('lic1'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LUA1}:9`,
                    alias: `${alias}.${TRANSFORMER_LUA1}`,
                    title: msg('lua1'),
                    unit: 'V'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LUB1}:9`,
                    alias: `${alias}.${TRANSFORMER_LUB1}`,
                    title: msg('lub1'),
                    unit: 'V'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LUC1}:9`,
                    alias: `${alias}.${TRANSFORMER_LUC1}`,
                    title: msg('luc1'),
                    unit: 'V'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LP1}:9`,
                    alias: `${alias}.${TRANSFORMER_LP1}`,
                    title: msg('lp1'),
                    unit: 'kW'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LQ1}:9`,
                    alias: `${alias}.${TRANSFORMER_LQ1}`,
                    title: msg('lq1'),
                    unit: 'kVar'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LCOS1}:9`,
                    alias: `${alias}.${TRANSFORMER_LCOS1}`,
                    title: msg('lcos1'),
                    unit: ''
                },
            ],
            [
                {
                    key: `1:62:${alias}.${TRANSFORMER_LIA2}:9`,
                    alias: `${alias}.${TRANSFORMER_LIA2}`,
                    title: msg('lia2'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LIB2}:9`,
                    alias: `${alias}.${TRANSFORMER_LIB2}`,
                    title: msg('lib2'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LIC2}:9`,
                    alias: `${alias}.${TRANSFORMER_LIC2}`,
                    title: msg('lic2'),
                    unit: 'A'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LUA2}:9`,
                    alias: `${alias}.${TRANSFORMER_LUA2}`,
                    title: msg('lua2'),
                    unit: 'V'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LUB2}:9`,
                    alias: `${alias}.${TRANSFORMER_LUB2}`,
                    title: msg('lub2'),
                    unit: 'V'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LUC2}:9`,
                    alias: `${alias}.${TRANSFORMER_LUC2}`,
                    title: msg('luc2'),
                    unit: 'V'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LP2}:9`,
                    alias: `${alias}.${TRANSFORMER_LP2}`,
                    title: msg('lp2'),
                    unit: 'kW'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LQ2}:9`,
                    alias: `${alias}.${TRANSFORMER_LQ2}`,
                    title: msg('lq2'),
                    unit: 'kVar'
                },
                {
                    key: `1:62:${alias}.${TRANSFORMER_LCOS2}:9`,
                    alias: `${alias}.${TRANSFORMER_LCOS2}`,
                    title: msg('lcos2'),
                    unit: ''
                },
            ],
        ];
    }
    if (type === "yx") {
        return [
            {
                key: `1:61:${alias}.${TRANSFORMER_HFAULT}:9`,
                alias: `${alias}.${TRANSFORMER_HFAULT}`,
                title: msg('hfault')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_HOILTEMP}:9`,
                alias: `${alias}.${TRANSFORMER_HOILTEMP}`,
                title: msg('oilhtemp')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_LOIL}:9`,
                alias: `${alias}.${TRANSFORMER_LOIL}`,
                title: msg('oill')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_POIL}:9`,
                alias: `${alias}.${TRANSFORMER_POIL}`,
                title: msg('oilp')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_HGAS}:9`,
                alias: `${alias}.${TRANSFORMER_HGAS}`,
                title: msg('hgas')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_LGAS}:9`,
                alias: `${alias}.${TRANSFORMER_LGAS}`,
                title: msg('lgas')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_SMOGALARM}:9`,
                alias: `${alias}.${TRANSFORMER_SMOGALARM}`,
                title: msg('smogalarm')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_SGZ}:9`,
                alias: `${alias}.${TRANSFORMER_SGZ}`,
                title: msg('sgz')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_HDOOR}:9`,
                alias: `${alias}.${TRANSFORMER_HDOOR}`,
                title: msg('hdoor')
            }, {
                key: `1:61:${alias}.${TRANSFORMER_LDOOR}:9`,
                alias: `${alias}.${TRANSFORMER_LDOOR}`,
                title: msg('ldoor')
            },
        ];
    }
    if (type === "switch") {
        return [{
            key: `1:61:${alias}.${TRANSFORMER_HSWITCH}:9`,
            alias: `${alias}.${TRANSFORMER_HSWITCH}`,
            title: msg('hswitch'),
        }, {
            key: `1:61:${alias}.${TRANSFORMER_BREAKER1}:9`,
            alias: `${alias}.${TRANSFORMER_BREAKER1}`,
            title: msg('breaker1'),
        }, {
            key: `1:61:${alias}.${TRANSFORMER_BREAKER2}:9`,
            alias: `${alias}.${TRANSFORMER_BREAKER2}`,
            title: msg('breaker2'),
        }]
    }
    return [];
}

const switchColorMap = {
    0: "health", // 打开状态代表能靠近,绿色表示
    1: "fault", // 闭合状态代表不能靠近,红色表示
}

export default function Transformer({ current }) {

    const [dynDataValueMap, setDynDataValueMap] = useState({});     
    const [alarmRecords, setAlarmRecords] = useState([]);
    const [loadingTop, setLoadingTop] = useState(false);
    const [loadingBottom, setLoadingBottom] = useState(false);

    const aiDataArray = useRef([]);
    const diDataArray = useRef([]);
    const switchDataArray = useRef([]);
    const lastAlarmId = useRef(0);
    const lastAlarmNo = useRef(0);
    const timer = useRef(null);
    const timerAlarm = useRef(null);

    useEffect(() => {

        aiDataArray.current = [];
        diDataArray.current = [];
        switchDataArray.current = [];
        lastAlarmId.current = 0;
        lastAlarmNo.current = 0;
        timer.current = null;
        timerAlarm.current = null;

        setDynDataValueMap({});
        setAlarmRecords([]);

        if (current?.alias !== undefined) {
            clearTimeout(timer.current);
            clearTimeout(timerAlarm.current);

            init(current.alias, () => {
                fetchDynData(current.alias, true);
                fetchAlarm(current.alias, true);
            });
        }

        return () => {
            clearTimeout(timer.current);
            clearTimeout(timerAlarm.current);
        };
    }, [current.alias]);

    const init = (alias, cb) => {
        // 构建开关测点组
        const orignalSwitchData = buildDynData(alias, "switch");
        // 构建遥测测点组
        aiDataArray.current = buildDynData(alias, "yc");
        // 构建遥信测点组
        const orginalDIData = buildDynData(alias, "yx");
        // 首先求取设备测点

        _dao.getAssetPoint({
            bay_alias: alias,
            device_type: 'pad',
            point_type: -1,
            meter_reading_type: -1
        })
        .then(res => {
            if (!EmptyList(res)) {
                const data = res.data || [];
                const device = data[0]?.device?.[0];
                const points = device?.point;
                switchDataArray.current = orignalSwitchData.filter(o => points?.some(x => x.alias === o.alias));                
                diDataArray.current = orginalDIData.filter(o => points?.some(x => x.alias === o.alias));
                
                return [switchDataArray.current, aiDataArray.current, diDataArray.current];
            }
            return [[], [], []];
        })
        .finally(() => {
            typeof cb === 'function' && cb();
        });
    };

    // 求取设备动态字
    function fetchDynData(alias, loading) {
        // 然后获取测点动态字
        //const data = switchDataArray.current.concat(diDataArray.current)
        const data = switchDataArray.current.concat([])
        // 添加箱变状态遥信点
        .concat([{
            key: `1:61:${alias}.${TRANSFORMER_STATE}:9`,
            alias: `${alias}.${TRANSFORMER_STATE}`,
            decimal: 0
        }])
        .map(o => ({ id: "", key: o.key, decimal: 0 }));
        //.concat(_.flatten(aiDataArray.current).map(o => ({ id: "", key: o.key, decimal: 2 })));

        if(data.length === 0){
            return null;
        }

        const fetchData = async (loading) => {
            if(loading){
                setLoadingTop(true);
            }

            const res = await _dao.getDynData(data);

            if (LegalData(res)) {
                const valueMap = {};
                const data = res.data || [];
                data.forEach(o => {
                    const alias = o.key.split(":")[2];
                    const tabNo = Number(o.key.split(":")[1]);
                    if (alias) {
                        valueMap[alias] = {
                            key: o.key,
                            value: tabNo === 61 
                                ? Number(NumberUtil.removeCommas(o.raw_value)) 
                                : Number(NumberUtil.removeCommas(o.display_value)),
                            text: o.display_value,
                            status: o.status_value,
                            color: tabNo === 61 && o.color
                        }
                    }
                });
                setDynDataValueMap(valueMap);
            }

            if(loading){
                setLoadingTop(false);
            }

            clearTimeout(timer.current);
            timer.current = setTimeout(fetchData, TimerInterval);
        };

        clearTimeout(timer.current);
        fetchData(loading);
    }

    // 求取告警
    function fetchAlarm(alias, loading) {

        const fetchData = async (loading) => {
            if(loading){
                setLoadingBottom(true);
            }

            const req = {
                start_id: lastAlarmId.current,
                start_no: lastAlarmNo.current,
                seq_type: (!lastAlarmId.current && !lastAlarmNo.current) ? 1 : 0,
                max_cnt: ALARM_MAX,
                level_list: ALARM_LEVEL_STR,
                node_name_list: alias,
                app_list: ''
            };
            let res = await _dao.getAlarm(req);

            if (!EmptyList(res)) {
                lastAlarmId.current = res.last_time_id;
                lastAlarmNo.current = res.last_no;

                setAlarmRecords(rs => scadaUtil.handleAlarm(rs, res.data || [], ALARM_MAX));
            }

            if(loading){
                setLoadingBottom(false);
            }

            clearTimeout(timerAlarm.current);
            timerAlarm.current = setTimeout(fetchData, CommonTimerInterval);
        }

        clearTimeout(timerAlarm.current);
        fetchData(loading);
    }

    const renderHeader = () => {
        const statusAlias = `${current?.alias}.${TRANSFORMER_STATE}`;
        const statusText = dynDataValueMap[statusAlias]?.text;
        const statusColor = dynDataValueMap[statusAlias]?.color || '#fff';
        
        return <DetailNav 
            detailAlias={current.alias}
            detailName={current.name}
            statusDesc={statusText}
            statusColor={statusColor}
        />;
    }

    const arrayPoint = [];
    if(Array.isArray(aiDataArray.current)){
        const convert = (item) => {
            const keys = item.key.split(':');
            return {
                name: item.title,
                alias: item.alias,
                unit: item.unit || '',
                tableNo: keys[1],
                fieldNo: keys[3],
                decimal: 2
            }
        }
        const P1 = aiDataArray.current[0] || [];
        const P2 = aiDataArray.current[1] || [];
        const P3 = aiDataArray.current[2] || [];
        P2.map((p, ind) => {
            arrayPoint.push(convert(p));
            // 必须按原需求对齐
            // null 组件会做处理
            if(P3[ind]){
                arrayPoint.push(convert(P3[ind]));
            }else{
                arrayPoint.push(null);
            }
            if(P1[ind]){
                arrayPoint.push(convert(P1[ind]));
            }else{
                arrayPoint.push(null);
            }
        });
    }
    
    return (
        <DetailTemplate header={renderHeader()}>
            <div className={solarTransformerPrefix}>
                <div className={`${solarTransformerPrefix}-center`}>
                    <div className={`${solarTransformerPrefix}-center-left`}>
                        <Diagram  alias={current.alias} refreshInterval={TimerInterval}/>
                    </div>
                    <div className={`${solarTransformerPrefix}-center-right`}>
                        <div className={`${solarTransformerPrefix}-center-right-header`}>
                            <div className={`${solarTransformerPrefix}-center-right-header-yc`}>
                                <div className={`${solarTransformerPrefix}-center-right-header-yc-text`}>
                                    {msg('ai_data')}
                                </div>
                                <div className={`${solarTransformerPrefix}-center-right-header-yc-space`}></div>
                            </div>                        <div className={`${solarTransformerPrefix}-center-right-header-yx`}>
                                <div className={`${solarTransformerPrefix}-center-right-header-yx-text`}>
                                    {msg('di_signal')}
                                </div>
                                <div className={`${solarTransformerPrefix}-center-right-header-yx-space`}></div>
                            </div>
                        </div>
                        <div className={`${solarTransformerPrefix}-center-right-content`}>
                            <div className={`${solarTransformerPrefix}-center-right-content-yc`}>
                                <AllData 
                                    assetAlias={current.alias} 
                                    filterAssetName={current.name}
                                    title={''}
                                    oldPoints={arrayPoint}
                                    timeout={TimerInterval}
                                />
                            </div>
                            <div className={`${solarTransformerPrefix}-center-right-content-yx`}>
                                <LightWord 
                                    assetAlias={current.alias}
                                    title={''}
                                    filterAssetName={current.name}
                                    timeout={TimerInterval}
                                />
                            </div>
                        </div>
                    </div>
                    <EnvLoading isLoading={loadingTop}></EnvLoading>
                </div>
                <div className={`${solarTransformerPrefix}-footer`}>
                    <header className={`${solarTransformerPrefix}-footer-header`}>
                        {msg('device_alarm')}
                    </header>
                    <section className={`${solarTransformerPrefix}-footer-content`}>
                        {
                            alarmRecords.map((alarm, index) => {
                                return <div key={alarm.id + '.' + alarm.no}
                                    className={`${solarTransformerPrefix}-footer-content-alarm`}>
                                    <span className={`${solarTransformerPrefix}-footer-content-alarm-time`}>
                                        {alarm.time}
                                    </span>
                                    <div className={`${solarTransformerPrefix}-footer-content-alarm-icon`}>
                                        <span className={`${solarTransformerPrefix}-footer-content-alarm-icon-circle`}></span>
                                        {
                                            index < alarmRecords.length - 1 ? <span className={`${solarTransformerPrefix}-footer-content-alarm-icon-line`}></span> : null
                                        }
                                    </div>
                                    <span style={{
                                        color: alarm.level_color
                                    }} className={`${solarTransformerPrefix}-footer-content-alarm-level`}>
                                        {alarm.level_name}
                                    </span>
                                    <span className={`${solarTransformerPrefix}-footer-content-alarm-conent`}>{alarm.content}</span>
                                </div>
                            })
                        }
                    </section>
                    <EnvLoading isLoading={loadingBottom}></EnvLoading>
                </div>
            </div>
        </DetailTemplate>
    )
}

Transformer.propTypes = {
    current: PropTypes.shape({
        name: PropTypes.string,
        alias: PropTypes.string
    }).isRequired
}
