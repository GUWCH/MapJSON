import * as React from 'react';
import { observer } from 'mobx-react';
import ResizeObserver from 'rc-resize-observer';
import EchartsWrap from 'EchartsWrap';
import {Tooltip} from 'antd';
import { FontIcon, IconType } from 'Icon';
import CommonDynData from '@/components/DynData';
import { isDevelopment, getPointKey } from '@/common/constants';
import { SetToken } from '@/components_utils/Token';
import { getTheme } from '@/common/theme';
import { 
    MODE,  
    isZh, 
    keyStringMap, 
    CHART_TYPE_MAP,
    DEFAULT_COLOR,
    CARD_ATTR
} from '../../constants';
import {ValListStyleShow} from '../StyleShow';
import {gradient, PointEvt} from '@/common/util-scada';
import { IDataState} from '../../stores/storeData';
import {IPageState} from '../../stores/storePage';
import styles from './style.mscss';

const theme = getTheme();

interface ICardProps{
    width: number;
    height: number;
    quotaTextWidth?: number;
    dataState: IDataState;
    pageState: IPageState;
    data: Array<any>;
};

@observer
class Card extends React.PureComponent<ICardProps> {
    ec: React.RefObject<any>;

    defaultNameKey = 'WTG.Name';
    defaultAliasKey = 'WTG.Alias';

    constructor(props){
        super(props);

        this.ec = React.createRef();
    }

    getChartOption({points=[], data=[], chartsProps=[]}, ec){
        const options = {
            animation: false,
            textStyle: {
                color: theme.chartTextColor,
                fontWeight: 'normal'
            },
            title: {
                text: '',
                textStyle: {
                    fontSize: 12,
                    //fontWeight: 'normal',
                    color: theme.white
                }
            },
            grid: {
                top: 25,
                bottom: 25,
                left: 2,
                right: 2,
                containLabel: false
            },
            tooltip: {
                trigger: 'axis',
                confine: false,
                appendToBody: true,
                backgroundColor: '#083F4D',
                borderWidth: 0,
                textStyle: {
                    fontSize: 10,
                    color: '#6A8CA3'
                },
                axisPointer: {
                    type: 'none'
                },
                className: `${styles.chartTooltip}`,
                formatter: function (params) {
                    var relVal = params[0].name;
                    for (var i = 0, l = params.length; i < l; i++) {

                        relVal += '<span>' + params[i].marker + '<span>' + params[i].seriesName + ':&nbsp;' 
                        + `</span><span style="color: white; margin-left: auto">`+ params[i].value + ' ' 
                        + (chartsProps[i]?.unit || '')+'</span></span>';
                    }
                    return relVal;
                }
            },
            xAxis: {
                show: false,
                type: 'category',
                data:[]
            },
            yAxis: [],
            series: [],
            legend: {
                icon: 'rect',
                itemHeight: 8,
                itemWidth: 8,
                padding: [0, 0, 5, 0],
                inactiveColor: theme.chartLegendActiveColor,
                y: 'bottom',
                textStyle: {
                    color: theme.chartLegendColor,
                    width: 110/chartsProps.length,
                    ellipsis: '...',
                    overflow: 'truncate',
                    rich: {
                        align: 'center'
                    }
                },
                tooltip: {
                    show: true
                },
                data: []
            }
        };

        const legend = points.map((p, ind) => p.abbr || chartsProps[ind].showName);
        options.legend.data = legend;

        (data || []).forEach((d, ind) => {
            const noData = options.xAxis.data.length === 0;
            const seriesData = d.map(ele => {
                const { x, y } = ele;
                if(ind === 0 || noData){
                    options.xAxis.data.push(x);
                }

                return {
                    value: y !== '' ? Number(y) : ''
                };
            });

            const {type='line', color='rgba(255,255,255,1)', smooth=true, showName} = chartsProps[ind] || {};

            const {colorFrom, colorTo} = gradient(color || DEFAULT_COLOR[ind], 0.25);

            (options.series as any[]).push({
                ...CHART_TYPE_MAP[type],
                name: showName,
                // type: type,
                smooth: smooth,
                showSymbol: false,
                itemStyle: {
                    color: color || DEFAULT_COLOR[ind]
                },
                data: seriesData,
                yAxisIndex: ind,
                ...(type === 'area' ? {areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: colorFrom
                        }, {
                            offset: 1, color: colorTo
                        }],
                    }
                }} : {}),
            });

            options.yAxis.push({
                name: '',
                axisLabel: {
                    show: false
                },
                splitLine: {
                    show: ind === 0,
                    lineStyle: {
                        color: theme.chartYaxisSplitColor
                    }
                }                
            });
        });

        return options;
    }

    renderNameLeft(){
        const { data: deviceData, dataState } = this.props;
        const dynMap = dataState.getDyndata();
        const nameLeft = dataState.getCardNameLeft()[0];

        if(!nameLeft)return null;
        const key = getPointKey(nameLeft, deviceData[this.defaultAliasKey]);
        const {raw_value} = dynMap[key] || {};
        const { tableNo, fieldNo, nameCn, nameEn, unit } = nameLeft;

        const {valueListStyle = []} = nameLeft[keyStringMap.CARD][keyStringMap.TITLE_LEFT];

        let valueObj = valueListStyle.find((ele) => {
            return raw_value && ele.value.toString() === raw_value.toString();
        })
    
        let {icon, color} = valueObj || {};

        let {colorFrom, colorTo} = gradient(color, 0.25);

        const style= color ? {
                background: colorFrom || colorTo ? `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`:'',
            } : {}

        return <CommonDynData 
            showName = {false}
            wrapperCls = {styles.headLeft}
            wrapperStyle = {style}
            valueBackground={dynMap[key]?.fill_color}
            valueColor={dynMap[key]?.line_color}
            point={{
                aliasKey: key,
                tableNo: tableNo,
                fieldNo: fieldNo,
                nameCn: nameCn,
                nameEn: nameEn,
                unit: unit
            }}
            transform={{
                icon: icon
            }}
            value={dynMap[key]}
            placement = {'bottom'}
        />
    }

    renderNameRight(){
        const { data: deviceData, dataState } = this.props;
        const dynMap = dataState.getDyndata();
        const measure = dataState.getCardNameRight()[0];
        if(!measure)return null;

        const {nameCn, nameEn, tableNo, fieldNo, unit} = measure;
        const key = getPointKey(measure, deviceData[this.defaultAliasKey]);

        const measureStyle = (measure[keyStringMap.CARD] || {})[keyStringMap.TITLE_RIGHT];

        return <div className = {styles.headRight}>
            <span>{'('}</span>
            <CommonDynData 
                showName = {false}
                valueBackground={dynMap[key]?.fill_color}
                valueColor={dynMap[key]?.line_color}
                point={{
                    aliasKey: key,
                    tableNo: tableNo,
                    fieldNo: fieldNo,
                    nameCn: nameCn,
                    nameEn: nameEn,
                    unit: unit
                }}
                transform={{
                    convert: measureStyle?.convert,
                }}
                value={dynMap[key]}
                placement = {'bottom'}
            />
            <span>{')'}</span>
        </div>;
    }

    renderMiddleChart(unique){
        const { data: deviceData, dataState } = this.props;
        const charts = dataState.getCardCharts();
        const scaleSize = dataState.getUserIconSize();
        const historyMap = dataState.getHisData();

        const curveData = charts.map(p => {
            return historyMap[getPointKey(p, deviceData[this.defaultAliasKey])] || [];
        });
        // const chartsProps = [
        //     {type: 'bar', color: theme.chartLineColor2},
        //     {type: 'bar', color: theme.chartLineColor}
        // ];

        const chartsProps = charts.map((chart) => {
            const {OVERVIEW, CARD} = keyStringMap;
            let {chartType = 'line', color = theme.chartLineColor, edictNameCn, edictNameEn} = (chart[CARD])[OVERVIEW];
            return {
                showName: isZh ? edictNameCn || chart.nameCn : edictNameEn || chart.nameEn,
                unit: chart.unit,
                type: chartType,
                color: color
            }
        })

        return <ResizeObserver
            onResize={() => {
                this.ec.current && this.ec.current.resize();
            }}
        >
            <div 
                onClick={e => {e.preventDefault();e.stopPropagation();}} 
                className={`${styles.chart} ${unique ? styles.chartfull : ''}`}
            >
                <EchartsWrap 
                    ref={this.ec}
                    data={JSON.parse(JSON.stringify({
                        points: charts,
                        data: curveData,
                        chartsProps
                    }))}
                    getOption={(data, ec) => {
                        return this.getChartOption(data, ec);
                    }}
                    resizeDelay={200}
                    widthScale={scaleSize}
                    heightScale={scaleSize}
                    replaceMerge={['series']}
                />
            </div>
        </ResizeObserver>;
    }

    renderMiddleQuotas(unique, hasIcon){
        const { data: deviceData, dataState, quotaTextWidth } = this.props;
        const quotas = dataState.getCardQuotas();
        const dynMap = dataState.getDyndata();

        const fontWidth = 16;
        const dataNameMaxLen = Math.max.apply(null, quotas.map((point: TPoint, ind) => {
            return (isZh ? point.nameCn : point.nameEn).length;
        }));
        const dataNameWidth = isFinite(dataNameMaxLen) ? dataNameMaxLen * fontWidth : 0;

        return <div className={`${styles.quotas} ${hasIcon ? styles.quotasMiddle : ''} ${unique ? styles.quotasfull : ''}`}>
        {
            quotas.map((point: TPoint, ind) => {
                const { nameCn, nameEn, unit, tableNo, fieldNo } = point;
                const key = getPointKey(point, deviceData[this.defaultAliasKey]);

                /** @see QuotaSet\constant.jsx */
                let {icon, color, edictNameCn, edictNameEn, ycCondition, convert, yxCondition, defaultColor, pattern} = (point[keyStringMap.CARD])[keyStringMap.QUOTA];
                let valueMap = {};
                if(yxCondition){
                    yxCondition.map(c => {
                        const {value, name, name_cn, name_en, icon, color} = c;
                        if(!valueMap[String(value)]){
                            valueMap[String(value)] = {
                                icon: icon,
                                background: color
                            }
                        }
                    })
                }

                return <div key={ind} className={styles.quotaitem}>
                    <CommonDynData 
                        showName = {true}
                        valueBackground={dynMap[key]?.fill_color}
                        valueColor={dynMap[key]?.line_color || color}
                        wrapperStyle = {{width: "100%"}}
                        nameContainerCls = {`${styles.itemname} ${isZh ? '' : styles.normal}`}
                        nameStyle = {Object.assign({}, quotaTextWidth ? {width: quotaTextWidth} : (isZh ? {width: dataNameWidth} : {}), {maxWidth: CARD_ATTR.quotaMaxWidth})}
                        nameCls = {`${styles.itmeNameText}`}
                        valueContainerCls = {styles.itemnumber}
                        valueCls = {`${styles.itmeValueText}`}
                        valueDefaultColor={defaultColor}
                        valuePattern={pattern}
                        point={{
                            aliasKey: key,
                            tableNo: tableNo,
                            fieldNo: fieldNo,
                            nameCn: nameCn,
                            nameEn: nameEn,
                            unit: unit
                        }}
                        transform={{
                            nameCn: edictNameCn,
                            nameEn: edictNameEn,
                            icon: icon,
                            iconLeftValue: true,
                            convert: convert,
                            conditions: ycCondition,
                            valueMap: valueMap
                        }}
                        value={dynMap[key]}
                    />
                </div>
            })
        }
        </div>;
    }

    renderMiddleIcon({unique=false, small=false}: {
        unique?: Boolean|boolean, 
        small?: Boolean|boolean
    }){
        const { data: deviceData, dataState, pageState } = this.props;
        const { deviceType } = pageState;
        const icon = dataState.getCardIcon()[0];

        if(!icon)return null;

        const dynMap = dataState.getDyndata();
        const {display_value, raw_value} = dynMap[getPointKey(icon, deviceData[this.defaultAliasKey])] || {};

        const {associated} = (icon[keyStringMap.CARD] || {})[keyStringMap.OVERVIEW] || {};

        const assocValue = associated ? (dynMap[getPointKey(associated, deviceData[this.defaultAliasKey])] || {}).raw_value : null;

        const uniqueCls = unique ? styles.iconfull : '';
        const smallCls = small ? styles.small : '';

        // TODO 值对应图标和颜色，风机正常发电可单独处理, 把通讯中断判断加上
        const isRotate = String(deviceType) === '3' && String(raw_value) === '5';

        // 显控主机触发报警特殊处理
        const isPicDeviceType = String(deviceType) === '30'
        const isTrigger = String(raw_value) === '1';

        return <div 
            className={`${styles.icon} ${smallCls} ${uniqueCls}`}
        >
            <ValListStyleShow 
                isTrigger = {isTrigger}
                isPicDeviceType = {isPicDeviceType}
                rotateClassName = {isRotate ? styles.rotate : ''}
                pictureClassName = {styles.picture}
                quota = {icon} 
                raw_value = {raw_value}
                part = {keyStringMap.CARD} 
                loction = {keyStringMap.OVERVIEW}
                assocValue = {assocValue}
                needShadow = {!!!small}
            /> 
        </div>;
    }

    renderMiddle(){
        const { data: deviceData, dataState } = this.props;
        const icons = dataState.getCardIcon();
        const charts = dataState.getCardCharts();
        const quotas = dataState.getCardQuotas();

        const noIcons = icons.length === 0;
        const noChart = charts.length === 0;
        const noQuota = quotas.length === 0;

        if(noIcons && noChart && noQuota ) return null;

        return <div className={styles.middle}>
            {!noIcons && noChart && this.renderMiddleIcon({unique: noQuota})}
            {noIcons && !noChart && this.renderMiddleChart(noQuota)}
            {!noQuota && this.renderMiddleQuotas(noIcons && noChart, !noIcons)}
        </div>;
    }

    renderBottom(){
        const { data: deviceData, dataState } = this.props;
        const bottom = dataState.getCardBottom();
        const dynMap = dataState.getDyndata();

        if(!Array.isArray(bottom) || bottom.length === 0)return null;

        return <div className={styles.bottom}>
        {
            bottom.map((point: TPoint, ind) => {
                const key = getPointKey(point, deviceData[this.defaultAliasKey]);
                const data = dynMap[key] || {};


                let {display_value} = data;

                let {icon, color} = (point[keyStringMap.CARD])[keyStringMap.STATISTICS];

                let {colorFrom, colorTo} = gradient(color, 0.25);
                let iconStyle = {};
                /* if(display_value && colorFrom && colorTo){
                    iconStyle = {
                        background: `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`
                    }
                } */
                if(display_value && String(display_value) !== '0' && color){
                    iconStyle = {
                        background: color
                    }
                }

                let showName = isZh ? point.nameCn : point.nameEn;

                return <div key={ind}>
                    <Tooltip placement="top" title={showName}>
                        <div style={iconStyle}
                        >
                            <FontIcon type={IconType[icon]}/>
                        </div>
                    </Tooltip>
                    <CommonDynData
                        valueBackground={dynMap[key]?.fill_color}
                        valueColor={dynMap[key]?.line_color} 
                        point={{
                            aliasKey: key,
                            tableNo: point.tableNo,
                            fieldNo: point.fieldNo,
                            nameCn: point.nameCn,
                            nameEn: point.nameEn,
                            // unit: point.unit,
                            decimal: point.decimal || 0
                        }}
                        value={data}
                        showName={false}
                    />
                </div>;
            })
        }
        </div>;
    }
    
    render(){
        const { width, height, data: deviceData, dataState, pageState } = this.props;
        const isLarge = dataState.getMode() === MODE.LARGE_ICON;

        return (
            <div className={styles.card} style={{
                width,
                height
            }}>
                <div className={styles.head}>
                    {isLarge && this.renderNameLeft()}
                    {!isLarge && this.renderMiddleIcon({small: true})}
                    <div className={styles.headline} onClick={(e) => {
                        if(isDevelopment){
                            SetToken(deviceData[this.defaultAliasKey], undefined);
                        }else{
                            PointEvt.popMenu(`1:430:${deviceData[this.defaultAliasKey]}:1`, e.nativeEvent);
                        }
                        e.stopPropagation();
                        return false;
                    }}>
                        {deviceData[this.defaultNameKey]}
                    </div>
                    {isLarge && this.renderNameRight()}
                </div>
                {isLarge && this.renderMiddle()}
                {isLarge && this.renderBottom()}
            </div>
        );
    }
}

export default Card;