import React, {useEffect, useState} from "react";
import {Input} from "antd";
import EchartsWrap from 'EchartsWrap';
import {LegalData, _dao} from '@/common/dao';
import {NumberFactor, autoComma} from "@/common/util-scada";
import {getTheme} from '@/common/theme';
import {StyledModal} from "Modal";
import { notify } from 'Notify';
import {msg, SLOT, DEFAULT_DISPERSE} from './constant';

import styles from './style.mscss';

export interface CurrentPoint {
    field_no: string;
    point_alias: string;
    point_name: string;
    point_unit: string;
    table_no: string;
    time_zone_info: string;
    value_type: string;
}

export interface DeviationThresoldValueMap{
    updateAttrs: {
        field_name: string, 
        field_no: string, 
        table_no: string, 
        field_val: string
    },
    valueField: string,
    value: string, 
    valid: boolean
}

export interface DispreseProps {
    title: string;
    threshold: number | undefined;
    chartData: Array<{}>;
    deviationAlias: string;
    refEc:any;
    widthScale:number | undefined;
    heightScale: number | undefined;
    deviationThresoldValueMap: DeviationThresoldValueMap,
    isMultiType: boolean;
    setStatus: boolean;
    closeSet: Function;
    isDemo: boolean | undefined;
    afterUpdate: (isOk: boolean) => void;
}

const theme = getTheme('tplChartTheme');

const DISPERSE = "Disperse";
const findSuffix = (alias) => {
    const matchs = alias.match(/\d+$/);
    if (matchs?.length > 0) {
        return matchs[0];
    }
    return alias;
};

export const getEchartsOption = (data, ec) => {
    let { data: chartData, disperseLimitValue, disperseName='离散率'} = data;
    const isNum = disperseLimitValue !== '' && disperseLimitValue !== null && !isNaN(disperseLimitValue);
    let allData = [];
    (chartData || []).forEach(ele => {
        const data = ele.Points || [];
        allData = allData.concat(data.map(d => d.y !== '' ? Number(d.y) : null));
    });
    let max = null;
    if(isNum){
        if(allData.length > 0){
            max = Math.max.apply(null, allData.concat([disperseLimitValue]));
        }else{
            max = Number(disperseLimitValue);
        }
    }

    return {
        title: {
            show: false,
        },
        tooltip: {
            className: styles.charttooltip,
            trigger: 'axis',
            backgroundColor: theme.tooltipBg,
            borderWidth: 0,
            textStyle: {
                color: theme.chartLegendColor,
                fontSize: 14
            },
            appendToBody: true,
            formatter: (params, ticket, callback) => {
                if(Array.isArray(params) && params.length > 0){
                    let time = params[0].axisValueLabel;
                    time = time.split(' ')[1].split(':').slice(0, 2).join(':');
                    const hight = 25 * ((params.length + 1) / 2);
                    const seriesTip = params.map((serie, index) => {
                        const {marker, seriesName, data: {unit}, value=[]} = serie;
                        const val = autoComma(value[1] === '' || value[1] === null || value[1] === undefined ? SLOT : value[1]);
                        const isStyleStr = index < params.length / 2 ? "margin-right:20px;" : "";
                        return `<div style="${isStyleStr}">${marker} 
                        <span style="margin-right:5px;">${seriesName}:</span> <span style="color:${theme.white};">${val} ${unit}<span></div>`
                    }).join('');
                    return `<div>${time}</div><div style="height:${hight}px" class=${styles.tooltipItems}>${seriesTip}<div>`;
                }
                return '';
            }
        },
        legend: {
            bottom: 8,
            icon: 'circle',
            itemWidth: 8,
            itemHeight: 8,
            type: 'scroll',
            pageIconColor: theme.pageIconColor,
            pageIconInactiveColor: theme.pageIconInactiveColor,
            pageTextStyle: {
                color: theme.pageTextColor
            },
            textStyle: {
                color: theme.white
            }
        },
        grid: {
            left: 30,
            top: 30,
            right: 40,
            bottom: 40,
            containLabel: true
        },
        xAxis: {
            type: 'time',
            boundaryGap: false,
            axisLabel: {
                formatter: '{HH}:{mm}'
            }
        },
        yAxis: [{
            type: 'value',
            name: '%',
            splitLine: {
                lineStyle: {
                    color: theme.chartYaxisSplitColor
                }
            },
            max: max
        }, {
            type: 'value',
            name: 'A',
            splitLine: {
                show: false
            }
        }],

        // eslint-disable-next-line complexity
        series: chartData.map(o => {
            const { key, Points=[] } = o;
            const pointAlias = key.split(":")[2];
            const isDisperse = pointAlias.endsWith(DISPERSE);
            const xy = Points.map(i => ({
                value: [i.x, i.y !== '' ? Number(i.y) : null],
                unit: isDisperse ? '%' : 'A'
            }));

            let data = {
                name: isDisperse ? disperseName : findSuffix(pointAlias).padStart(2, '0'),                               
                type: 'line',
                symbol: 'none',
                data: xy,
                yAxisIndex: isDisperse ? 0 : 1
            };
            if (isDisperse && isNum) {
                data.markLine = {
                    lineStyle: {
                        color: theme.red
                    },
                    precision: 100,
                    data: [{
                        yAxis: Number(disperseLimitValue)
                    }],
                    label: {
                        formatter: '{c}%'
                    }
                };
            }
            return data;
        })
    };
};

const Disperse: React.FC<DispreseProps> = (props: DispreseProps) => {

    const {
        title,
        threshold, 
        refEc, 
        deviationAlias, 
        deviationThresoldValueMap,
        isMultiType = false,
        setStatus = false,
        closeSet,
        afterUpdate,
        isDemo,
        ...rest 
    } = props;

    let {chartData} = props;

    //编辑态mock数据
    if(isDemo){
        let temp = [];
        for(let j = 0; j <= 12; j++){
            temp.push({
                x: j*2 < 10 ? `2022-07-27 0${j*2}:00:00` : `2022-07-27 ${j*2}:00:00`,
                y: '0.01'
            })
        }
        chartData = [{
            key: "1:62:SD1.Matrix001.CBX001.INVT001.Disperse:9",
            Points: temp
        }];

        for(let i = 1; i <= 16; i++){
            let temp = [];
            for(let j = 0; j <= 12; j++){
                temp.push({
                    x: j*2 < 10 ? `2022-07-27 0${j*2}:00:00` : `2022-07-27 ${j*2}:00:00`,
                    y: String(Math.ceil(Math.random()*10 *15)/100)
                })
            }

            chartData.push({
                key: `1:62:SD1.Matrix001.CBX001.INVT001.Cur${i}:9`,
                Points: temp
            })
        }
    }
    
    const [isSetting, setIsSetting] = useState(setStatus);
    const [isWarning, setIsWarning] = useState(false);
    const [curDeviationInputVal, setCurDeviationInputVal] = useState(NumberFactor(deviationThresoldValueMap.value, 100, 2));

    useEffect(() => {
        if(setStatus){
            if(deviationThresoldValueMap.valid){
                setIsSetting(true);
            }else{
                notify(msg('CURRENT.noPermission'));
                closeSet();
            }
        }

    }, [setStatus])

    useEffect(() => {
        setCurDeviationInputVal(NumberFactor(deviationThresoldValueMap.value, 100, 2))
    }, [deviationThresoldValueMap])

    const update = async () => {
        const {updateAttrs, valueField} = deviationThresoldValueMap || {};
        
        const res = await _dao.updateDeviationThresold(
            deviationAlias, 
            [Object.assign({}, updateAttrs, {
                [valueField]: String(NumberFactor(curDeviationInputVal, 0.01, 4)) // 接口需要字符串
            })]
        );

        const isOk = LegalData(res);

        if(isOk){
            notify(msg('CURRENT.success'));
        }else{
            notify(msg('CURRENT.failed'));
        }

        typeof afterUpdate === 'function' && afterUpdate(isOk);
    }

    const handleDisperseChange = () => {
        if((!isNaN(curDeviationInputVal)) && Number(curDeviationInputVal) >= 0 && Number(curDeviationInputVal) <= 100){
            update();
            setIsSetting(false);
            closeSet();
        }

        // 暂时不校验范围
        // if((!isNaN(curDeviationInputVal))){
        //     update();
        //     setIsSetting(false);
        //     closeSet();
        // }
    }

    return <div className = {styles.container}>
        {isMultiType ? null : <div className = {styles.head}>
            <span>{title}</span>
            <button className={styles.setButton}
                onClick={() => {
                    if(deviationThresoldValueMap.valid){
                        setIsSetting(true)
                    }else{
                        notify(msg('CURRENT.noPermission'))
                    }   
                }}
            >
                {msg('CURRENT.set')}
            </button>
        </div>}
        <div className = {styles.chart} style = {{height: isMultiType ? '100%' : 'calc(100% - 48px)'}}>
            <EchartsWrap 
                ref = {refEc}
                data={{
                    data: Object.assign([], chartData),
                    disperseLimitValue: NumberFactor(deviationThresoldValueMap.value, 100, 2),
                    disperseName: msg('CURRENT.disperse')
                }}
                getOption={(data, ec) => {
                    return getEchartsOption(data, ec);
                }}
                isNotMergeOpt={true}
                {...rest}
            />
        </div>
        <StyledModal
            visible = {isSetting}
            title = {msg('CURRENT.disperseSet')}
            wrapClassName = {styles.modalContainer}
            destroyOnClose = {true}
            onCancel = {() => {
                setIsSetting(false);
                closeSet();
            }}
            onOk = {handleDisperseChange}
        >
            <div className = {styles.bodyContainer}>
                <div className={styles.modalReset}>
                    <span className={styles.separate}/>
                    <span>{msg('CURRENT.disperseThresold')}&nbsp;</span>
                    <span>{`${deviationThresoldValueMap.value ? NumberFactor(deviationThresoldValueMap.value, 100, 2) : '--'}%`}</span>
                    <button className={styles.setButton}
                        onClick = {() => {setCurDeviationInputVal(Number(DEFAULT_DISPERSE))}}
                    >
                        {msg('CURRENT.reset')}
                    </button>
                </div>
                <div className={styles.modalInput}>
                    <div>
                        <span className={styles.modalRequire}>*</span>
                        <span>{msg('CURRENT.disperse')}</span>
                        <div>
                            <Input
                                style={{width: 336}}
                                placeholder = {msg('CURRENT.placeholder')}
                                suffix = '%'
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if((!isNaN(value)) && Number(value) >= 0 && Number(value) <= 100){
                                        setIsWarning(false);
                                    }else{
                                        setIsWarning(true);
                                    }
                                    setCurDeviationInputVal(value);

                                    // 暂时不校验数值范围
                                    // if(!isNaN(value)){
                                    //     setCurDeviationInputVal(value);
                                    // }
                                }}
                                value={curDeviationInputVal}
                            />
                            {isWarning ? <div className={styles.modalWarning}>{msg('CURRENT.rangeTip')}</div> : null}
                        </div>
                    </div>
                </div>
                <div className={styles.modalTip}>
                    <div>{msg('CURRENT.tip1')}</div>
                    {/* <div>{msg('CURRENT.tip2')}</div> */}
                </div>
            </div>
        </StyledModal>
    </div>
}
export default Disperse;