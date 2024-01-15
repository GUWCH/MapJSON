import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Konva from 'konva';
import KonvaWrap from 'KonvaWrap';
import { calcCusEventProps, fireCustomEvent } from "DrawLib/utils";
import CommonDynData from "DynData";
import {BASE_SIZE, getImageSize} from './constants';
import {msg} from '../../constants';
import { useNavigate } from 'react-router-dom';

import styles from './style.mscss';
import _ from "lodash";

interface Positions {
    scaleX: number,
    scaleY: number
}

export type Config = {
    [key: string]:{
        positions: Positions;
        zIndex: number;
    }
} | null;

interface DragDropProps{
    isEdict: boolean;
    data: Array<{
        alias: string;
        display_name: string;
        [key:string]: any; 
    }>,
    valData: {
        [key: string]: Array<{
            key: string,
            isStatus: boolean,
            name: string,
            value: string | number,
            unit?: string,
            color?: string
        }>
    }
    config: Config,
    onDragEnd: (cfg: {[key: string]: Positions}) => void,
}

const DragDrop = ({
    isEdict,
    data, 
    valData,
    config,
    onDragEnd
}: DragDropProps) => {

    const navigator = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [curConfig, setCurConfig] = useState(config);
    const [resizeCount, setResizeCount] = useState(0); 
    
    const imageObj = useMemo(() => {
        const img = new Image();
        img.src = require('../../img/subsystem_large.png').default;
        return img;
    }, []);

    useEffect(() => {
        const resize = () => {
            setResizeCount(c => c + 1);
        }

        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
        }
    }, [])

    useEffect(() => {
        // 初始化zIndex排序
        const initConfig = (data, config) => {

            let newConfig = {};

            if(data.length === 0) return;

            let newData = JSON.parse(JSON.stringify(data));

            let reorderData = newData.sort(function(a, b){
                return (config[a.alias]?.zIndex || 999) - (config[b.alias]?.zIndex || 999);
            })

            reorderData.map((d, index) => {
                if(!newConfig[d.alias]){
                    newConfig[d.alias] = {};
                }
                Object.assign(newConfig[d.alias], config[d.alias] || {}, {zIndex: index + 1})
            })

            setCurConfig(newConfig);

            return reorderData;
        }
        initConfig(data, config || {});
    }, [data, config])

    const reorderZIndex = (key, rest = {}) => {
        let newConfig = Object.assign({}, curConfig);

        let oldZIndex = newConfig[key].zIndex;

        Object.keys(curConfig || {}).map(eleKey => {
            if(eleKey === key){
                newConfig[eleKey] = Object.assign({}, 
                    (curConfig || {})[eleKey], 
                    {zIndex: Object.keys(curConfig || {}).length},
                    rest
                )
            }else if(newConfig[eleKey].zIndex > oldZIndex){
                newConfig[eleKey] = Object.assign({}, 
                    (curConfig || {})[eleKey], 
                    {zIndex: newConfig[eleKey].zIndex - 1},
                )
            }
        }) 

        if(!_.isEqual(newConfig, curConfig)){
            setCurConfig(newConfig);
            onDragEnd(newConfig);
        }
    }

    const drawImage = ({
        key,
        name,
        imageObj, 
        x, 
        y,
        containerWidth,
        containerHight,
        width,
        height,
        draggable,
        status,
        scale,
        numScale, // 子系统个数相关缩放
        tooltipData
    }) => {

        let group = new Konva.Group({
            x: x,
            y: y,
            width: width,
            height: height,
            draggable: draggable,
            dragBoundFunc:  function(pos) {
                var newX = pos.x < 0 ? 0 : (pos.x > (containerWidth - width) ? (containerWidth - width) : pos.x);
                var newY = pos.y < 0 ? 0 : (pos.y > (containerHight - height) ? (containerHight - height) : pos.y);
                return {
                  x: newX,
                  y: newY
                };
            }
        })

        let darthVaderImg = new Konva.Image({
            image: imageObj,
            x: 0,
            y: 0,
            width: width,
            height: height,
            dragBoundFunc:  function(pos) {
                var newX = pos.x < 0 ? 0 : (pos.x > (containerWidth - width) ? (containerWidth - width) : pos.x);
                var newY = pos.y < 0 ? 0 : (pos.y > (containerHight - height) ? (containerHight - height) : pos.y);
                return {
                  x: newX,
                  y: newY
                };
            }
        });

        let textNo = new Konva.Text({
            x: 42 * numScale * scale,
            y: 23 * numScale * scale,
            width: 47 * numScale * scale,
            height: 24 * numScale * scale,
            text: name,
            align: 'center',
            verticalAlign: 'middle',
            fontSize: 11 * numScale * scale,
            fontFamily: 'SFPro-Medium, SFPro',
            fill: '#fff',
        });

        let {color} = status[0] || {};

        let rectNo = new Konva.Rect({
            x: 42 * numScale * scale,
            y: 23 * numScale * scale,
            width: 47 * numScale * scale,
            height: 24 * numScale * scale,
            fill: color || 'rgba(45, 95, 117, 0.8)',
            cornerRadius: 15 * numScale * scale,
        });

        textNo.on('mouseover', function (evt) {
            const cusEvtProps = calcCusEventProps(evt, key);
            cusEvtProps && fireCustomEvent('showCustomNode', {
                ...Object.assign({}, cusEvtProps),
                data: tooltipData,
                tooltipProps: {
                    placement: 'bottomLeft',
                    overlayClassName: styles.antdTooltip
                }
            })
        });
    
        textNo.on('mouseout', function (evt) {
            const cusEvtProps = calcCusEventProps(evt, key)
            cusEvtProps && fireCustomEvent('hideCustomNode', {
                ...cusEvtProps,
                data: undefined,
                tooltipProps: undefined
            })
        });

        group.on('click', function () {
            if(isEdict) {
                // 重新排序
                reorderZIndex(key);
            }else{
                document.body.style.cursor = 'auto';
                navigator(`/${key}`, {replace: true});
            }
        })

        group.on('mouseover', function () {
            document.body.style.cursor = isEdict ? 'move' : 'pointer';
        })

        group.on('mouseout', function () {
            document.body.style.cursor = 'default';
        })

        group.on('dragend', function () {
            let {x, y} = this.getAbsolutePosition();

            reorderZIndex(key, {
                positions: {
                    scaleX: x / containerWidth,
                    scaleY: y / containerHight
                }
            });
        })

        darthVaderImg.cache();
        darthVaderImg.drawHitFromCache();

        group.add(darthVaderImg);
        group.add(rectNo);
        group.add(textNo);

        return group;
    }

    const draw = useCallback((stage: Konva.Stage) => {
        if (!stage || !containerRef.current || data.length === 0) return;
        const layer = new Konva.Layer()
        stage.destroyChildren();
        stage.clear();

        const {clientWidth, clientHeight} = containerRef.current;

        if(!clientHeight || !clientHeight){
            return;
        }

        const scale = Math.min(clientHeight/BASE_SIZE.height, clientWidth/BASE_SIZE.width);

        let {width, height, colNum, rowNum} = getImageSize(data.length);

        if(!rowNum){
            rowNum = Math.ceil(data.length / colNum);
        }

        let itemHight = (clientHeight - height * scale) / (rowNum - 1);

        let tempdarthVaderImgList: any[] = [];

        data.map((ele, index) => {
            let {alias = ''} = ele;
            const res = /(\d+)$/g.exec(alias.split('.')[1] || '');
            let No = '';
            if(res){
                No = res[1];
            }

            const lineNo = parseInt(String(index / colNum));

            const {positions = null, zIndex} = (curConfig || {})[ele.alias] || {};

            const darthVaderImg = drawImage({
                key: alias,
                name: No ? `#${No}` : alias,
                imageObj: imageObj, 
                x: positions?.scaleX ? positions.scaleX * clientWidth : (index % colNum) * (width - 40) * scale, 
                y: positions?.scaleY ? positions.scaleY * clientHeight : lineNo * itemHight, 
                containerWidth: clientWidth,
                containerHight: clientHeight,
                width: width * scale, 
                height: height * scale, 
                draggable: isEdict,
                tooltipData: {
                    title: `#${No}${msg('subsystem')}`,
                    infos: (valData[alias] ?? [])
                },
                status: (valData[alias] || []).filter(v => v.isStatus),
                scale: scale,
                numScale: width / 120

            });

            tempdarthVaderImgList.push({
                obj: darthVaderImg,
                zIndex: (curConfig || {})[alias]?.zIndex
            })
        })

        tempdarthVaderImgList.sort(function(a, b){
            return a.zIndex - b.zIndex;
        }).map(ele => {
            layer.add(ele.obj);
        })

        stage.add(layer);
    }, [data, isEdict, curConfig, valData, resizeCount]);

    const cusTooltipNodeProvider = useCallback((evt) => {
        const data = evt.data as TTooltipData;
        return <DeviceTooltip {...data}/>;
    }, []);

    return <div 
        className={styles.dragDropContainer} 
        ref={containerRef} 
        id = {'dragDropContainer'}
    >
        <KonvaWrap
            width={containerRef.current?.clientWidth ?? 1 - 1}
            height={containerRef.current?.clientHeight ?? 1 - 1}
            draw={draw}
            cusTooltipNodeProvider={cusTooltipNodeProvider}
        />
    </div>
}

type TTooltipInfo = {
    key: string;
    isStatus?: boolean;
    name: string;
    value: string;
    rawValue?: string;
    unit?: string;
    color?: string;
    icon?: string;
};

type TTooltipData = {
    title: string;
    infos: TTooltipInfo[]
}

const DeviceTooltip = ({ title, infos }: TTooltipData) => {
    return <div className={styles.tooltip}>
        <span className={styles.tooltipTitle}>{title}</span>
        {
            infos
                .filter(v => !v.isStatus)
                .map((d) => {
                    let { key='', name, color, value, unit = '' } = d;
                    const keys = key.split(':');
                    return <div key={key} className={styles.tooltipInfo}>
                        <span>{name}</span>
                        <span>
                            <CommonDynData
                                key={key}
                                showName={false}
                                point={{
                                    nameCn: name,
                                    nameEn: name,
                                    tableNo: keys.length > 3 ? keys[1] : '',
                                    fieldNo: keys.length > 3 ? keys[3] : '',
                                    aliasKey: key,
                                    unit: unit
                                }}
                                value={value}
                                transform={{
                                    background: color
                                }}
                                eventWrap={true}
                            />
                        </span>
                    </div>
                })
        }
    </div>
}

export default DragDrop;