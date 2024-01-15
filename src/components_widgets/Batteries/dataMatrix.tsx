import React, { useState } from "react";
import { Tooltip } from "antd";
import {valueToColor} from "@/common/util-scada";
import { PureIcon, IconType } from 'Icon';
import EllipsisToolTip from 'EnvEllipsisTooltip';
import {msg, SLOT} from './constant';

import styles from './style.mscss';

export interface MatrixProps {
    value: string;
    name: string;
    unit: string;
    labels: Array<string>;
    pkNum: Number;
    data: Array<{}>;
    colNum: Number; 
    direction: 'row' | 'column'; 
    textColor: string;
    minMaxColor: [string, string];
}

export const groupByNum = (array, subGroupLength) => {
    let index = 0;
    let newArray = [];

    while(index < array.length) {
        newArray.push(array.slice(index, index += subGroupLength));
    }

    return newArray;
}

const parseData = (rawData: Array<{name: string, value: number, status: number}>, num: number) => {
    if(rawData.length === 0) return [];

    // 获取到最大最小值
    let max: number | '' = '';
    let min: number | '' = '';

    rawData.filter((r) => {
        return (r.value && !isNaN(r.value)) || r.value === 0;
    })
    .map((d, index) => {
        const numVal = Number(d.value);

        if(index === 0) {
            max = numVal;
            min = numVal;
        }else{
            if(numVal > max){
                max = numVal;
            }

            if(numVal < min){
                min = numVal;
            }
        }

        d.value = numVal;
    })

    // 根据pack数量分组
    let groupedData = groupByNum(rawData, rawData.length/num);

    let resData = [];
    console.log('groupedData',groupedData)
    groupedData.map((group, packIndex) => {
        let isMax = false;
        let isMin = false;

        let packMin = '';
        let packMax = '';

        group.filter((r) => {
            return (r.value && !isNaN(r.value)) || r.value === 0;
        })
        .map((ele, index) => {

            const eleNumVal = ele.value;

            if(index === 0) {
                packMax = eleNumVal;
                packMin = eleNumVal;
            }else{
                if(eleNumVal > packMax){
                    packMax = eleNumVal;
                }
                if(eleNumVal < packMin){
                    packMin = eleNumVal;
                }
            }

            if(!(eleNumVal < max)){
                isMax = true
            }
            if(!(eleNumVal > min)){
                isMin = true
            }
        });
        resData.push({
            No: `#${packIndex + 1}`,
            packMin: packMin,
            packMax: packMax,
            isMax: isMax,
            isMin: isMin,
            packData: group
        })

    })

    return {
        resData: resData,
        min: min, 
        max: max
    }
}

const redColor = '#FA465C';
const greenColor = '#09D993';

const Matrix: React.FC<MatrixProps> = (props: MatrixProps) => {
    let toFixedNumber: number
    const {value, name, unit, pkNum, data, colNum, direction, textColor, minMaxColor, containerWidth, labels} = props;
    if(unit.toLowerCase() == 'v'){
        toFixedNumber = 3
    }else{
        toFixedNumber = 1
    }
    console.log('martrix data',data)
    const [isPositionMin, setIsPositionMin] = useState(false);
    const [isPositionMax, setIsPositionMax] = useState(false);
    console.log('pkNum',pkNum)
    const {resData = [], min, max} = parseData(data, pkNum);
    console.log('resData',resData)
    const validNotFloat = /^([0-9]*[.0-9])$/ 
    const titleText = (data, No, name, unit, getMarkColor) => {
        const len = data.packData.length;
        let calHight = null;
        if(len < 15){
            calHight = 22 * len;
        }else{
            calHight = 22 * Math.ceil(len/2);
        }

        return <div>
            <div className={styles.tooltipNo}>{No}</div>
            <div className={styles.tooltipEles} style = {{height: `${calHight}px`}}>{
                data.packData.map((d, index) => {
                    const color = getMarkColor(d.value);
                    return <div key = {index} className={styles.tooltipEle}> 
                        <div className={styles.mark} style={{backgroundColor: color}} />
                            <span className={styles.tooltipDes}>{`#${index + 1}${name}:`}&nbsp;</span>
                            <span>{`${!d.value && d.value !== 0 ?  SLOT : validNotFloat.test(d.value) == -1?d.value:d.value.toFixed(toFixedNumber)}${unit}`}</span>
                    </div>
                }) 
            }</div>
        </div>
    }

    return <div key={value} className = {styles.matrixContainer} style = {{width: containerWidth}}>
        <div className={styles.head}>
            <span className={styles.separate}/>
            <span>{`${name} (${unit})`}</span>
        </div>
        <div className={styles.content}>
            <div className={styles.matrixBox}>
                <div className={styles.matrix} style = {{flexDirection: direction, height: `${36 * colNum}px`}}>
                    {resData.map((d, index) => {
                        const {No, packMin, packMax, isMax, isMin} = d;
                        const minBgColor = valueToColor(minMaxColor[0], minMaxColor[1], Number(labels[labels.length - 1]), Number(labels[0]), packMin);
                        const maxBgColor = valueToColor(minMaxColor[0], minMaxColor[1], Number(labels[labels.length - 1]), Number(labels[0]), packMax);

                        const getMarkColor = (value) => {
                            return valueToColor(minMaxColor[0], minMaxColor[1], Number(labels[labels.length - 1]), Number(labels[0]), value);
                        }

                        let minStyle = {backgroundColor: minBgColor};
                        if(isMin && isPositionMin){
                            minStyle['border'] = `2px solid ${greenColor}`
                        }

                        let maxStyle = {backgroundColor: maxBgColor};
                        if(isMax && isPositionMax){
                            maxStyle['border'] = `2px solid ${redColor}`
                        }

                        return <Tooltip 
                            key={index}
                            overlayClassName={styles.tooltip}
                            placement="right" 
                            title={titleText(d, No, name, unit, getMarkColor)}
                        >
                            <div 
                                className={styles.matrixItem}
                                key={index}
                                style = {{width: `calc((100% - 6px)/${direction === 'row' ? colNum : Math.ceil(resData.length / colNum)} - 5px)`}}
                            >
                                <div className={styles.showNo}><span style={{color: textColor}}>{No}</span></div>
                                <div 
                                    className={styles.leftHalf} 
                                    style = {maxStyle}
                                />
                                <div 
                                    className={styles.rightHalf} 
                                    style = {minStyle}
                                />
                            </div>
                        </Tooltip>
                    })}
                </div>
            </div>
            <div className={styles.barBox}>
                <div className={styles.bar}>
                    <div 
                        className={styles.barColor}
                        style = {{background: `linear-gradient(${minMaxColor[1]}, ${minMaxColor[0]})`}}
                    />
                    <div className={styles.barUnit}>{`(${unit})`}</div>
                </div>
                <div className={styles.label}>
                    {
                        labels.map((l, ind) => {
                            return <div 
                                key={ind} 
                                className={styles.labelItem}
                            >{l}</div>
                        })
                    }
                </div>
            </div>
        </div>
        <div className={styles.footer}>
            <EllipsisToolTip><span className={styles.footerItem} onClick={() => {setIsPositionMax(!isPositionMax)}}>
                <PureIcon 
                    type={IconType.POSITION_CIRCLE}
                    style = {isPositionMax ? {color: redColor} : {}}
                />
                <span className={styles.footerDes}>{`${msg('BATTERIES.max')}${name}:`}</span>
                <span className={styles.footerValue}>{` ${(max && !isNaN(max)) || max === 0 ? validNotFloat.test(max) == -1?max:max.toFixed(toFixedNumber) : SLOT}${unit}`}</span>
            </span></EllipsisToolTip>
            <EllipsisToolTip><span className={styles.footerItem} onClick={() => {setIsPositionMin(!isPositionMin)}}>
                <PureIcon 
                    type={IconType.POSITION_CIRCLE}
                    style = {isPositionMin ? {color: greenColor} : {}}
                />
                <span className={styles.footerDes}>{`${msg('BATTERIES.min')}${name}:`}</span>
                <span className={styles.footerValue}>{` ${(min && !isNaN(min)) || min === 0 ? validNotFloat.test(min) == -1?min:min.toFixed(toFixedNumber) : SLOT}${unit}`}</span>
            </span></EllipsisToolTip>
        </div>
    </div>
}

export default Matrix