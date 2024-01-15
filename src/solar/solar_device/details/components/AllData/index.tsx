import React, { useEffect, useRef, useState } from 'react';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import { _dao, daoIsOk } from '@/common/dao';
import { getPointKey } from '@/common/constants';
import { autoComma } from '@/common/util-scada';
import { NumberUtil, escapeRegExp } from '@/common/utils';
import styles from './style.mscss';

interface IAllData {
    style?: React.CSSProperties;
    title?: string;
    assetAlias: string;
    timeout: number;
    filterSiteName?: string;
    filterAssetName?: string;
    oldPoints?: IOldPoint[]; // 以前固定的测点优先显示在前面
}

interface IOldPoint {
    [x: string]: any;
    name: any;
    unit: string;
    alias: string;
    tableNo: number;
    fieldNo: number;
    decimal: number;
    coefficient: number;
}

type TPoint = {
    field_no: string,
    point_alias: string,
    point_name: string,
    point_unit: string,
    table_no: string | number,
    time_zone_info: string,
    value_type: string
};

const defaultProps = {
    title: '',
    assetAlias: '',
    timeout: 5000,
    filterSiteName: '',
    filterAssetName: '',
    oldPoints: []
};

const formatNumber = (value, factor, decimal) => {
    value = NumberUtil.removeCommas(value);
    if(factor === 1 || factor === null || isNaN(factor) || value === '' || value === null || isNaN(value)) return value;

    value = NumberUtil.multiply(value, factor, String(decimal) === '0' ? 0 : decimal || 2);

    return autoComma(value);
};

function AllData(props: IAllData = defaultProps){
    const { assetAlias, title, filterSiteName, filterAssetName, timeout, oldPoints=[], style={} } = props;
    const reqTimer = useRef(undefined);

    const [allPoints, setAllPoints] = useState<IOldPoint[]>([]);
    const [dynMap, setDynMap] = useState({});

    const destory = () => {
        clearTimeout(reqTimer.current);
    }

    useEffect(() => {
        return () => {
            destory();
        }
    }, []);

    useEffect(() => {
        destory();
        setAllPoints([]);
        setDynMap({});

        if(assetAlias){
            (async () => {
                const res = await _dao.searchAssetPoint({
                    ddyc_flag: -1,
                    name_alias_flag: 1,
                    node_name_list: assetAlias,
                    row_begin: 1,
                    row_count: 50000,
                    search_key: '',
                    is_all: true
                });
                if(daoIsOk(res)){
                    
                    setAllPoints(res.data);
                    
                    if(res.data.length > 0){
                        getAllData(assetAlias, res.data);
                    }
                }
            })();
        }
    }, [assetAlias]);

    const getArrayPoint = (points) => {
        if(!Array.isArray(points) || points.length === 0) return [];

        // 列表里可能有undefined
        const rawPoints = JSON.parse(JSON.stringify(oldPoints));
        const undefinedIndex: number[] = [];
        const odlPointKeys = rawPoints
            .filter((p, ind) => {
                if(p){
                    return true;
                }else{
                    undefinedIndex.push(ind);
                    return false;
                }
            })
            .map(p => generateKey(p, assetAlias));
        let pointData = points
        .filter(p => String(p.table_no) !== '61')
        .map(p => convertPointModel(p))
        .filter(p => odlPointKeys.indexOf(generateKey(p, assetAlias)) === -1);
        
        const undefinedPoint = pointData.splice(0, undefinedIndex.length);
        undefinedIndex.map((index, ind) => {
            rawPoints[index] = undefinedPoint[ind];
        });
        return rawPoints.filter(p => !!p).concat(pointData);
    }

    const getAllData = async (assetAlias, pointData: IOldPoint[]) => {
        const req = getArrayPoint(pointData).map(d =>{
            return {
                id: '',
                key: generateKey(d, assetAlias),
                decimal: 'decimal' in d ? d.decimal : 2
            }
        });

        if(req.length === 0)return;

        const res = await _dao.getDynData(req);

        if(daoIsOk(res)){
            const nextDynMap = {};
            res.data.map((d) => {
                d.timestamp = undefined;
                nextDynMap[d.key] = Object.assign({}, d);
            });
            setDynMap(d => nextDynMap);
        }

        destory();
        reqTimer.current = setTimeout(() => {
            getAllData(assetAlias, pointData);
        }, timeout || 5000);
    }

    const generateKey = (point, assetAlias) => {
        // 设备且有一段的直接使用设备
        if(assetAlias.split('.').length === 4 && point.alias.split('.').length === 1){
            return `1:${point.tableNo}:${assetAlias}:${point.fieldNo}`;
        }
        return getPointKey(point, assetAlias);
    }

    const convertPointModel = (point: TPoint) => {
        return {
            name: point.point_name,
            alias: point.point_alias,
            unit: point.point_unit || '',
            tableNo: point.table_no,
            fieldNo: point.field_no
        };
    }

    return <div className={styles.alldata} style={style}>
        {title && <div className={styles.header}>{title}</div> }
        <div className={styles.main}>
            {getArrayPoint(allPoints)
            .map((point, ind) => {
                const key = generateKey(point, assetAlias as string);
                const next = dynMap[key] || {};
                const {display_value, status_value, status} = next;

                // 界面资产名称过滤
                let name = point.name || '';
                if(filterSiteName){
                    name = name.trim().replace(new RegExp(`^${escapeRegExp(filterSiteName)}`), '');
                }
                if(filterAssetName){
                    name = name.trim().replace(new RegExp(`^${escapeRegExp(filterAssetName)}`), '');
                }

                const value = formatNumber(display_value, point.coefficient, point.decimal);
                return <div key={ind}>
                    <span>
                        <EllipsisToolTip style={{verticalAlign: 'top'}}>
                            {`${name}:`}
                        </EllipsisToolTip>
                    </span>
                    <span>
                        <EllipsisToolTip style={{verticalAlign: 'top'}}>
                            {value !== 0 && !value ? '--' : value}
                        </EllipsisToolTip>
                    </span>
                    <span>{point.unit || ''}</span>
                </div>
            })}
        </div>
    </div>
}

export default AllData;