import React, { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import { _dao, daoIsOk } from '@/common/dao';
import { getPointKey } from '@/common/constants';
import EllipsisToolTip from "ellipsis-tooltip-react-chan";
import { escapeRegExp } from '@/common/utils';
import styles from './style.mscss';

interface ILightWord {
    title?: string;
    assetAlias: string;
    timeout: number;
    filterSiteName?: string;
    filterAssetName?: string;
    showTip: boolean;
    oldPoints?: object[]; // 以前固定的测点优先显示在前面
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
    showTip: false,
    oldPoints: []
};

// 不显示的测点
const excludesPointAlias = [
    'WTST.State',    'BXTF.State',    'CBBX.State',    'EMT.State', 
    'INVT.ListSts',  'INVT.UnionSts', 'INVT.OemState', 'INVT.Fault', 
    'CBBX{n}.State', 'INVT{n}.ListSts', 'INVT{n}.UnionSts', 'INVT{n}.OemState', 'INVT{n}.Fault'
];

const NORMAL_STATUS = '0';
const NORMAL_VALUE = '0';
const ABNORMAL_VALUE = '1';

function LightWord(props: ILightWord = defaultProps){
    const { assetAlias, title, filterSiteName, filterAssetName, timeout, showTip } = props
    const reqTimer = useRef(undefined);

    const [points, setPoints] = useState<TPoint[]>([]);
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
        setPoints([]);
        setDynMap({});

        if(assetAlias){
            (async () => {
                const res = await _dao.searchAssetPoint({
                    ddyc_flag: 2,
                    name_alias_flag: 1,
                    node_name_list: assetAlias,
                    row_begin: 1,
                    row_count: 50000,
                    search_key: ''
                });
                if(daoIsOk(res)){
                    let pointData: TPoint[] = res.data;

                    // 测点过滤
                    const aliasNo = assetAlias.replace(/.*[^\d](\d+)$/, ($, $1) => {
                        return $1;
                    });
                    const assetBay = assetAlias.split('.').slice(0, 3).join('.');
                    const excludes = excludesPointAlias.map(p => `${assetBay}.${p.replace('{n}', aliasNo)}`);
                    pointData = pointData.filter((point) => {
                        return excludes.indexOf(point.point_alias) === -1;
                    });

                    setPoints(pointData);
                    
                    if(pointData.length > 0){
                        getYxData(assetAlias, pointData);
                    }
                }
            })();
        }
    }, [assetAlias]);

    const getYxData = async (assetAlias, pointData: TPoint[]) => {
        const req = pointData.map(d =>{
            return {
                id: '',
                key: getPointKey(convertPointModel(d), assetAlias),
                decimal: 0
            }
        });

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
            getYxData(assetAlias, pointData);
        }, timeout || 5000);
    }

    const convertPointModel = (point: TPoint) => {
        return {
            name: point.point_name,
            alias: point.point_alias,
            unit: '',
            tableNo: point.table_no,
            fieldNo: point.field_no,
            decimal: 0
        };
    }

    const prevData: object[] = [];
    const nextData: object[] = [];
    const otherData:  object[] = [];
    points
    .map((point, ind) => {
        const key = getPointKey(convertPointModel(point), assetAlias as string);
        const next = dynMap[key] || {};
        const {display_value, raw_value, status_value, status} = next;
        
        const statusClsName = String(status_value) !== NORMAL_STATUS
        ? '' 
        : String(raw_value) === NORMAL_VALUE 
            ? styles.green 
            : String(raw_value) === ABNORMAL_VALUE ? styles.red : '';
        
        const desc = String(status_value) !== NORMAL_STATUS 
            ? status 
            : display_value || '';

        let name = point.point_name || '';
        if(filterSiteName){
            name = name.trim().replace(new RegExp(`^${escapeRegExp(filterSiteName)}`), '');
        }
        if(filterAssetName){
            name = name.trim().replace(new RegExp(`^${escapeRegExp(filterAssetName)}`), '');
        }

        const ret = {
            name: name,
            desc: desc,
            statusClsName: statusClsName
        };
        if(String(raw_value) === ABNORMAL_VALUE){
            prevData.push(ret);
        }else if(String(raw_value) === NORMAL_VALUE){
            nextData.push(ret);
        }else{
            otherData.push(ret);
        }
    });

    return <div className={styles.lightword}>
        {title && <div className={styles.header}>{title}</div> }
        <div className={styles.main}>
            {prevData.concat(nextData).concat(otherData)
            .map((data, ind) => {
                return <Tooltip
                    key={ind}
                    title={showTip ? data.desc : ''}
                >
                    <div className={`${data.statusClsName}`}>
                        <EllipsisToolTip style={{verticalAlign: 'top'}}>
                            {data.name}
                        </EllipsisToolTip>
                    </div>
                </Tooltip>;
            })}
        </div>
    </div>
}

export default LightWord;