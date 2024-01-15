import * as React from 'react';
import { computed } from 'mobx'
import { inject, observer } from 'mobx-react';
import EchartsWrap from 'EchartsWrap';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import {Tooltip} from 'antd';
import { FontIcon, IconType } from 'Icon';
import { getPointKey } from '@/common/constants';
import { getTheme } from '@/common/theme';
import { MODE, msg, isZh, CARD_ATTR, keyStringMap, getConditionStyle, GRADE, SLOT, getPointType} from '../../constants';
import DynData from '../DynData';
import {ValListStyleShow} from '../StyleShow';
import {gradient} from '@/common/util-scada';
import { IDataState} from '../../stores/storeData';
import PageState, {IPageState} from '../../stores/storePage';

import styles from './style.mscss';

const theme = getTheme();

interface ICardProps{
    width: number;
    height: number;
    dataState: IDataState;
    pageState: IPageState;
    data: Array<any>;
};

@inject('pageState', 'dataState')
@observer
class Card extends React.PureComponent<ICardProps> {

    defaultNameKey = 'WTG.Name';
    defaultAliasKey = 'WTG.Alias';

    getChartOption({points=[], data=[], chartsProps=[]}, ec){
        const options = {
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
                show: false,
                trigger: 'axis',
                axisPointer: {
                    type: 'none'
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
                    color: theme.chartLegendColor
                },
                data: []
            }
        };

        const legend = points.map(p => p.abbr || isZh ? p.nameCn : p.nameEn);
        options.legend.data = legend;

        (data || []).forEach((d, ind) => {
            const seriesData = d.map(ele => {
                const { x, y } = ele;
                if(ind === 0){
                    options.xAxis.data.push(x);
                }

                return {
                    value: y !== '' ? Number(y) : ''
                };
            });

            const {type='line', color='#fff', smooth=true} = chartsProps[ind] || {};
            options.series.push({
                name: legend[ind],
                type: type,
                smooth: smooth,
                showSymbol: false,
                itemStyle: {
                    color: color
                },
                data: seriesData,
                yAxisIndex: ind
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
        const {display_value, raw_value} = dynMap[getPointKey(nameLeft, deviceData[this.defaultAliasKey])] || {};
        const { name } = nameLeft;

        return <ValListStyleShow 
            className = {styles.headLeft} 
            part = {keyStringMap.CARD}
            loction = {keyStringMap.TITLE_LEFT}
            quota = {nameLeft} 
            raw_value = {raw_value} 
            display_value = {display_value}
            aKey = {getPointKey(nameLeft, deviceData[this.defaultAliasKey])}
        />
    }

    renderNameRight(){
        const { data: deviceData, dataState } = this.props;
        const dynMap = dataState.getDyndata();
        const measure = dataState.getCardNameRight()[0];
        if(!measure)return null;

        const {unit = '', nameCn, nameEn} = measure;
        const key = getPointKey(measure, deviceData[this.defaultAliasKey]);

        const {display_value, raw_value} = dynMap[key] || {};
        return <div className = {styles.headRight}>
            <span>{'('}</span>
            <DynData 
                name={isZh ? nameCn : nameEn}
                aKey={key}
                value={display_value || SLOT}
                unit = {unit}
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
            let {chartType = 'line', color = theme.chartLineColor} = (chart[CARD])[OVERVIEW];
            return {
                type: chartType,
                color: color
            }
        })

        return <div 
            onClick={e => {e.preventDefault();e.stopPropagation();}} 
            className={`${styles.chart} ${unique ? styles.chartfull : ''}`}
        >
            <EchartsWrap 
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
            />
        </div>;
    }

    renderMiddleQuotas(unique){
        const { data: deviceData, dataState } = this.props;
        const quotas = dataState.getCardQuotas();
        const dynMap = dataState.getDyndata();

        const fontWidth = 16;
        const dataNameMaxLen = Math.max.apply(null, quotas.map((point: TPoint, ind) => {
            return (isZh ? point.nameCn : point.nameEn).length;
        }));
        const dataNameWidth = isFinite(dataNameMaxLen) ? dataNameMaxLen * fontWidth : 0;

        return <div className={`${styles.quotas} ${unique ? styles.quotasfull : ''}`}>
        {
            quotas.map((point: TPoint, ind) => {
                const { nameCn, nameEn, unit, tableNo } = point;
                const key = getPointKey(point, deviceData[this.defaultAliasKey]);
                const data = dynMap[key] || {};

                const param = {
                    quota: point,
                    data: data,
                    part: keyStringMap.CARD,
                    location: keyStringMap.QUOTA
                }

                return <div key={ind} className={styles.quotaitem}>
                    <div 
                        className={`${styles.itemname} ${isZh ? '' : styles.normal}`} 
                        style={isZh ? {width: dataNameWidth} : {}}
                    >
                        <EllipsisToolTip>{isZh ? nameCn : `${nameEn} :`}</EllipsisToolTip>
                    </div>
                    <div>
                        <DynData 
                            name={isZh ? nameCn : nameEn}
                            aKey={key}
                            unit = {unit}
                            unitClassName = {styles.itemunit}
                            bgShow = {getPointType(tableNo) === 'yx'}
                            colorShow = {getPointType(tableNo) !== 'yx'}
                            {...(getConditionStyle(param))}
                            size = {'15px'}
                            iconFontSize = {'12px'}
                        />
                    </div>
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

        return <div 
            className={`${styles.icon} ${smallCls} ${uniqueCls}`}
        >
            <ValListStyleShow 
                rotateClassName = {isRotate ? styles.rotate : ''}
                quota = {icon} 
                raw_value = {raw_value}
                part = {keyStringMap.CARD} 
                loction = {keyStringMap.OVERVIEW}
                assocValue = {assocValue}
                hideDes = {true}
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
            {!noQuota && this.renderMiddleQuotas(noIcons && noChart)}
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

                return <div key={ind}>
                    <div style={{
                        background: display_value && colorFrom && colorTo ? `linear-gradient(90deg, ${colorFrom} 0%, ${colorTo} 100%)`:''
                    }}
                    >
                            <FontIcon type={IconType[icon]}/>
                    </div>
                    <DynData 
                        name = {isZh ? point.nameCn : point.nameEn}
                        aKey={key}
                        value={display_value}
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
                    <div className={styles.headline}>
                        <Tooltip placement="bottomLeft" title={deviceData[this.defaultNameKey]}>
                            {deviceData[this.defaultNameKey]}
                        </Tooltip>
                    </div>
                    {isLarge && this.renderNameRight()}
                </div>
                {isLarge && this.renderMiddle()}
                {isLarge && pageState.grade === GRADE.FARM && this.renderBottom()}
            </div>
        );
    }
}

export default Card;