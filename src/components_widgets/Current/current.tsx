import React, { useState } from "react";
import _ from 'lodash';
import  {_dao}  from "@/common/dao";
import {CurrentPoint} from './disperse';
import CurrentComponent, { UNUSED_NO } from './StringCurrent';
import {msg} from './constant';

import styles from './style.mscss';

export interface CurrentProps {
    currentPoints: Array<CurrentPoint>;
    dynValueMap: Object;
    setStatus: boolean;
    closeSet: Function;
    isMultiType: boolean;
    title: string;
    isDemo: boolean | undefined;
    beforeChange: () => void,
    afterChange: (isOk: boolean) => void,
}

const demoMockData = {
    currentPoints: [
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur1:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur2:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur3:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur4:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur5:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur6:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur7:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur8:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur9:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur10:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur11:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur12:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur13:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur14:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur15:9"
        },
        {
            "id": "",
            "decimal": 2,
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur16:9"
        }
    ],
    dynValueMap: {
        "SD1.Matrix001.CBX001.INVT001.Cur1": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur1:9",
            "display_value": "1.31",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur2": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur2:9",
            "display_value": "1.36",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur3": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur3:9",
            "display_value": "1.33",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur4": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur4:9",
            "display_value": "1.32",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur5": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur5:9",
            "display_value": "1.37",
            "status": "工况退出",
            "status_value": 4,
            "line_color": "#ffffff",
            "fill_color": "#ffffff",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur6": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur6:9",
            "display_value": "1.37",
            "status": "工况退出",
            "status_value": 4,
            "line_color": "#ffffff",
            "fill_color": "#ffffff",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur7": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur7:9",
            "display_value": "1.33",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur8": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur8:9",
            "display_value": "1.33",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur9": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur9:9",
            "display_value": "1.36",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur10": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur10:9",
            "display_value": "1.33",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur11": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur11:9",
            "display_value": "1.32",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur12": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur12:9",
            "display_value": "1.36",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur13": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur13:9",
            "display_value": "1.33",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur14": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur14:9",
            "display_value": "1.34",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur15": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur15:9",
            "display_value": "1.36",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        },
        "SD1.Matrix001.CBX001.INVT001.Cur16": {
            "id": "",
            "key": "1:62:SD1.Matrix001.CBX001.INVT001.Cur16:9",
            "display_value": "1.33",
            "status": "无效",
            "status_value": 1,
            "line_color": "#000000",
            "fill_color": "#00aa00",
            "timestamp": "2022-07-27 13:33:00"
        }
    }
}

const Current: React.FC<CurrentProps> = (props: CurrentProps) => {

    const {setStatus, closeSet, isMultiType = false, title, isDemo, ...restProps} = props;

    let {currentPoints, dynValueMap} = props;

    if(isDemo){
        currentPoints = demoMockData.currentPoints;
        dynValueMap = demoMockData.dynValueMap;
    }

    const [currentSet, setCurrentSet] = useState(false);

    const currentClose = () => {
        setCurrentSet(false);
    }

    return <div className = {styles.container}>
        {isMultiType ? null : <div className = {styles.head}>
            <span>{title}</span>
            <button className={styles.setButton}
                onClick={() => {
                    setCurrentSet(true);
                }}
            >
                {msg('CURRENT.set')}
            </button>
        </div>}
        <CurrentComponent
            title={msg('CURRENT.current')}
            data={(currentPoints || []).map(point => {
                return dynValueMap[point.key.split(':')[2]] || {};
            })}
            isSetStatus = {isMultiType ? setStatus : currentSet}
            closeSet = {isMultiType ? closeSet : currentClose}
            {...restProps}
        ></CurrentComponent>
    </div>
}

export default Current;