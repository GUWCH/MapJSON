import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Konva from 'konva';
import { BStools } from '@/common/utils';
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
            isLightState?:boolean,
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
    const containerRef = useRef(null);
    const [curConfig, setCurConfig] = useState(config);
    const [resizeCount, setResizeCount] = useState(0);

    const layer = useRef<Konva.Layer>(new Konva.Layer());
    const tooltipLayer = useRef<Konva.Layer>(new Konva.Layer());
    const stage = useRef<Konva.Stage|null>(null);    
    
    const imageObj = useMemo(() => {
        const img = new Image();
        img.src = require('@/common/image/subsystem_large.png').default;
        return img;
    }, []);

    const redAlert = useMemo(() => {
        const img = new Image();
        img.src = require('@/common/image/red_alert.svg').default;
        return img;
    }, []);

    const greenAlert = useMemo(() => {
        const img = new Image();
        img.src = require('@/common/image/green_alert.svg').default;
        return img;
    }, []);

    useEffect(() => {
        if(containerRef.current){
            const {clientWidth, clientHeight} = containerRef.current;
            stage.current = new Konva.Stage({
                container: 'dragDropContainer',
                width: clientWidth - 1,
                height: clientHeight - 1,
            });
        }

        const resize = () => {
            if(stage.current && containerRef.current){
                const {clientWidth, clientHeight} = containerRef.current;
                stage.current.width(clientWidth - 1);
                stage.current.height(clientHeight - 1);
            }
            setResizeCount(c => c + 1);
        }

        window.addEventListener('resize', resize);

        return () => {
            layer.current.destroyChildren();
            layer.current.clear()
            layer.current.destroy();
            tooltipLayer.current.destroyChildren();
            tooltipLayer.current.clear()
            tooltipLayer.current.destroy();
            if(stage.current){                
                stage.current.destroyChildren();
                stage.current.clear()
                stage.current.width(0)
                stage.current.height(0)
                stage.current.destroy();
            }
            layer.current = null;
            tooltipLayer.current = null;
            stage.current = null;
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
        tooltipIns,
        status,
        alert,
        scale,
        numScale, // 子系统个数相关缩放
    }) => {

        let group = new Konva.Group({
            x: x,
            y: y,
            width: width,
            height: height,
            draggable: draggable,
            dragBoundFunc:  function(pos) {
                var newX = pos.x <= 0 ? 1 : (pos.x > (containerWidth - width) ? (containerWidth - width) : pos.x);
                var newY = pos.y <= 0 ? 1 : (pos.y > (containerHight - height) ? (containerHight - height) : pos.y);
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

        textNo.on('mouseover', function () {
            const tooltipWidth = tooltipIns.width();
            const tooltipHeight = tooltipIns.height();

            const rawX = x + this.x()
            const rawY = y + this.y() + this.height() + 5;

            tooltipIns.position({
                x: containerWidth - tooltipWidth < rawX ? containerWidth - tooltipWidth : rawX,
                y: containerHight - tooltipHeight < rawY ? containerHight - tooltipHeight : rawY,
            });
            
            !isEdict && tooltipIns.show();
        });
    
        textNo.on('mouseout', function () {
            tooltipIns.hide();
        });

        group.on('click', function () {
            if(isEdict) {
                // 重新排序
                reorderZIndex(key);
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
        alert.map((a, index) => {
            const {color} = a;
            let alertEle = new Konva.Image({
                image: color === 'red' ? redAlert : greenAlert,
                x: (18 + index * 10) * numScale * scale,
                y: ((index % 2 === 1 ? 48 : 38) - (index / 2 ) * 10) * numScale * scale,
                width: 10 * numScale * scale,
                height: 14 * numScale * scale,
            });

            group.add(alertEle);
        })
        group.add(rectNo);
        group.add(textNo);

        return group;
    }

    const getTooltips = useCallback((layer, No, valList) => {
        let group = new Konva.Group({
            width: 333,
            height: 38 + valList.length * 24
        });

        let bg = new Konva.Rect({
            width: 333,
            height: 38 + valList.length * 24,
            fill: "#01333D",
            cornerRadius: 4,
        });

        group.add(bg);

        let split = new Konva.Rect({
            x:12,
            y:10,
            width:4,
            height:14,
            fill: '#00A7DB',
        });

        let title = new Konva.Text({
            x:24,
            y:10,
            text: `#${No}${msg('subsystem')}`,
            fill: '#fff',
            fontSize: 14,
        })

        group.add(split);
        group.add(title);

        valList.map((l, index) => {
            let {name, color, value, unit = ''} = l;
            let itemGroup = new Konva.Group({
                x: 24,
                y: 38 + index * 24,
            });
            let nameObj = new Konva.Text({
                width: 210,
                height: 24,
                text: name,
                fill: '#fff',

            });
            let valueObj = new Konva.Text({
                x: 220,
                width: 73,
                height: 24,
                text: `${value || '--'} ${unit}`,
                fill: color || '#fff',
            })

            itemGroup.add(nameObj);
            itemGroup.add(valueObj);

            group.add(itemGroup);
        })

        group.hide();
        layer.add(group);

        return group;
    }, []);

    useEffect(() => {
        if(!BStools.isVisible())return;

        if(!stage.current || !containerRef.current || data.length === 0) return;
        layer.current.destroyChildren();
        layer.current.clear();
        tooltipLayer.current.destroyChildren();
        tooltipLayer.current.clear();
        stage.current.destroyChildren();
        stage.current.clear();
        
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
                tooltipIns: getTooltips(tooltipLayer.current, No, (valData[alias] || []).filter(v => !(v.isStatus || v.isLightState))),
                status: (valData[alias] || []).filter(v => v.isStatus),
                alert: (valData[alias] || []).filter(v => v.isLightState),
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
            layer.current.add(ele.obj);
        })

        stage.current.add(layer.current);
        stage.current.add(tooltipLayer.current);

    }, [data, isEdict, curConfig, valData, resizeCount])

    return <div 
        className={styles.dragDropContainer} 
        ref={containerRef} 
        id = {'dragDropContainer'}
    ></div>
}

export default DragDrop;