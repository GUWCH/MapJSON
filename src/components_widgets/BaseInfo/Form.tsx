import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react';
import CommonDynData from 'DynData';
import { useRecursiveTimeoutEffect } from 'ReactHooks';
import { TimerInterval } from '@/common/const-scada';
import { DECIMAL, getPointKey } from '@/common/constants';
import useDataStore from '../common/components/PointTplConfiguration/dataStore';
import { AccConvert, CoeConvert, PointWithConf } from '../common/components/PointTplConfiguration/models';
import styles from './Form.module.scss';
import { daoIsOk, _dao } from '@/common/dao';
import { Grid, AutoSizer } from 'react-virtualized';

export type FormProps = {
    alias: string | { alias: string; name: string; showName: string }[];
    pointsWithConf: PointWithConf[];
}

const Form: React.FC<FormProps> = ({ alias, pointsWithConf }) => {
    const { pointsValueMap, fetchPointsValue } = useDataStore()

    let multiAlias: any[] = [];
    if (!Array.isArray(alias)) {
        multiAlias.push({ alias: alias });
    } else {
        multiAlias = alias;
    }

    const cells = multiAlias.map(o => {
        return pointsWithConf.map((v, i) => {
            const dynKey = getPointKey(v, o.alias);
            const pointValue = pointsValueMap[dynKey] as IDyn | undefined
            const conf = v.conf;

            const convert: Partial<AccConvert & CoeConvert> = conf?.convert ?? {}
            return <CommonDynData
                key={dynKey}
                wrapperStyle={{width: '100%'}}
                containerCls={styles.info}
                nameCls={`${styles.l} ${styles.ellipsis}`}
                valueContainerCls={styles.r}
                valueCls={styles.ellipsis}
                valueBackground={pointValue?.fill_color}
                valueColor={pointValue?.line_color}
                point={{
                    nameCn: o.showName && v.name.cn ? `${o.showName} ${v.name.cn}` : v.name.cn,
                    nameEn: o.showName && v.name.en ? `${o.showName} ${v.name.en}` : v.name.en,
                    aliasKey: dynKey,
                    tableNo: v.tableNo,
                    fieldNo: v.fieldNo,
                    unit: v.unit
                }}
                value={pointValue}
                transform={{
                    nameCn: o.showName && conf.showTitleCn ? `${o.showName} ${conf.showTitleCn}` : conf.showTitleCn,
                    nameEn: o.showName && conf.showTitleEn ? `${o.showName} ${conf.showTitleEn}` : conf.showTitleEn,
                    convert: {
                        coefficient: convert.coefficient?.toString(),
                        unit: convert.unit,
                        decimal: convert.decimal
                    },
                    conditions: conf.conditions
                }}
                tipTrigger={'hover'}
            />
        })
    });

    // alias类型可能为string | array
    useRecursiveTimeoutEffect(() => {
        return [
            () => {
                return fetchPointsValue(alias, pointsWithConf)
            }
        ];
    }, TimerInterval as number, [pointsWithConf, alias], true);

    return <div className={styles.container}>
        {cells}
    </div>
}

const MIN_COL_WIDTH = 250
const LARGE_COL_WIDTH = 360;
const ROW_HEIGHT = 46
const COL_GAP = 32

type PointWithAlias = IPointSearch & { assetAlias: string }
const getKey = (p: IPointSearch) => `1:${p.table_no}:${p.point_alias}:${p.field_no}`

export const FullForm: React.FC<{ alias: string | { alias: string; name: string; showName: string }[], trimNamePrefix?: boolean }> = ({
    alias, trimNamePrefix
}) => {
    const [allPoints, setAllPoints] = useState<PointWithAlias[]>([])
    const [assertNameMap, setAssetNameMap] = useState<{ [key: string]: string }>({}) // key: alias
    const [indexRange, setRange] = useState<{ start: number, stop: number }>()
    const timestampRef = useRef(Date.now())
    const [valueMap, setValueMap] = useState<{ timestamp: number, data: { [key: string]: IDyn } }>({ data: {}, timestamp: timestampRef.current })

    useEffect(() => {
        if (!alias) {
            return
        }

        const aliasArr: string[] = [];
        const aliasWithBayArr: string[] = [];
        if (Array.isArray(alias)) {
            alias.map(v => {
                aliasArr.push(v.alias);
                aliasWithBayArr.push(v.alias);
                // 获取间隔名称
                if(v.alias.split('.').length > 3){
                   const bayAlias = v.alias.split('.').slice(0, 3).join('.');
                   aliasWithBayArr.indexOf(bayAlias) > -1 ? null : aliasWithBayArr.push(bayAlias); 
                }
            })
        } else {
            aliasArr.push(alias);
            aliasWithBayArr.push(alias);
            // 获取间隔名称
            if(alias.split('.').length > 3){
                const bayAlias = alias.split('.').slice(0, 3).join('.');
                aliasWithBayArr.indexOf(bayAlias) > -1 ? null : aliasWithBayArr.push(bayAlias);
            }
        }

        if (trimNamePrefix) {
            _dao.getInfoByAlias(aliasWithBayArr.join(','), 'disp_name').then(res => {
                if(daoIsOk(res) && res.data){
                    const nameMap = res.data.reduce((p, c) => {
                        if (c) {
                            return {
                                ...p,
                                [c.alias]: c.disp_name
                            }
                        }
                        return p
                    }, {} as { [key: string]: string })
                    setAssetNameMap(nameMap)
                }
            })
        }

        Promise.all(
            aliasArr.map(alias =>
                _dao.searchAssetPoint({
                    ddyc_flag: -1,
                    name_alias_flag: 1,
                    node_name_list: alias,
                    row_begin: 1,
                    row_count: 50000,
                    // search_key: '',
                    is_filter: true,
                    is_all: true
                }).then(res => {
                    if (daoIsOk(res)) {
                        const rawData = res.data as IPointSearch[]
                        return rawData.map(p => Object.assign({ assetAlias: alias }, p))
                    }
                    console.error('fetch points error, alias: ' + alias)
                    return []
                })
            )
        )
            .then(pointsArr => {
                setAllPoints(pointsArr.flat(1))
            })
            .catch(e => {
                console.error(e);
            })
    }, [alias])

    useRecursiveTimeoutEffect(() => [
        async () => {
            if (!indexRange) {
                return
            }

            const pMap: { [key: string]: IPointSearch } = {}
            const reqData: { id: string, key: string, decimal: number }[] = []
            const reqTimestamp = Date.now()

            const points = allPoints.slice(indexRange.start, indexRange.stop + 1)
            points.forEach(p => {
                const key = getKey(p)
                pMap[key] = p
                reqData.push({
                    id: "",
                    key,
                    decimal: DECIMAL.COMMON
                })
            })

            if (reqTimestamp < timestampRef.current) {
                return
            }

            const dynRes = await _dao.getDynData(reqData)
            if (daoIsOk(dynRes)) {
                const dynData = dynRes.data as IDyn[]
                const data = dynData.reduce((p, c) => ({ ...p, [c.key]: c }), {} as { [key: string]: IDyn })

                if (reqTimestamp >= timestampRef.current) {
                    setValueMap({
                        timestamp: timestampRef.current,
                        data: Object.assign({}, valueMap.data, data)
                    })
                }
            } else {
                console.error('fetch dynData error');
            }
        }
    ], TimerInterval as number, [indexRange, allPoints])

    const hasBitParse = allPoints.filter((p) => p.type === 'flag').length;
    return <div className={styles.container_full}>
        <AutoSizer >
            {({ height, width }) => {
                const innerWidth = width - 8 + COL_GAP // 减去滚动条宽度
                const columnCount = Math.floor(innerWidth / (hasBitParse ? LARGE_COL_WIDTH : MIN_COL_WIDTH))
                const actualColWidth = innerWidth / columnCount
                const rowCount = Math.ceil(allPoints.length / columnCount)

                const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
                    const i = columnCount * rowIndex + columnIndex
                    if (i > allPoints.length - 1) {
                        return <div style={style} key={key}>
                            <div className={styles.cell_empty} />
                        </div>
                    }
                    const remainder = (columnIndex + 1) % columnCount
                    let cellCls: string

                    switch (columnCount) {
                        case 1: { // 单列布局
                            cellCls = styles.cell_single;
                            break;
                        }
                        case 2: { // 双列布局
                            cellCls = remainder === 0 ? styles.cell_double_end : styles.cell_double_start
                            break;
                        }
                        default: { // 多列布局
                            if (remainder === 0) {
                                cellCls = styles.cell_mutiple_end
                            } else {
                                cellCls = styles.cell_mutiple
                            }
                        }
                    }

                    const p = allPoints[i]
                    const pKey = getKey(p)
                    const pv = valueMap.data[pKey] as IDyn | undefined

                    const prefixToTrim = assertNameMap[p.assetAlias];
                    const bayPrefixToTrim = assertNameMap[(p.assetAlias.split('.')).slice(0, 3).join('.')];
                    let name = (p.point_name || '').trim();
                    if(prefixToTrim || bayPrefixToTrim){
                        let filterName = prefixToTrim;
                        if(!name.startsWith(prefixToTrim)){
                            filterName = bayPrefixToTrim;
                        }

                        if(filterName){
                            name = name.replace(new RegExp('^' + filterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '');
                        }
                    }

                    return <div key={key} style={style}>
                        <div className={cellCls}>
                            <CommonDynData
                                key={pKey}
                                wrapperStyle={{width: '100%'}}
                                containerCls={styles.info_full}
                                nameCls={`${styles.l} ${styles.ellipsis}`}
                                valueContainerCls={styles.r}
                                valueCls={styles.ellipsis}
                                valueBackground={pv?.fill_color}
                                valueColor={pv?.line_color}
                                point={{
                                    nameCn: name,
                                    nameEn: name,
                                    aliasKey: pKey,
                                    tableNo: p.table_no,
                                    fieldNo: p.field_no,
                                    unit: p.point_unit
                                }}
                                value={pv}
                                tipTrigger={'hover'}
                            />
                        </div>
                    </div>
                }

                const handleSectionRendered = ({
                    columnOverscanStartIndex, rowOverscanStartIndex,
                    columnOverscanStopIndex, rowOverscanStopIndex
                }: {
                    columnOverscanStartIndex: number,
                    columnOverscanStopIndex: number,
                    columnStartIndex: number,
                    columnStopIndex: number,
                    rowOverscanStartIndex: number,
                    rowOverscanStopIndex: number,
                    rowStartIndex: number,
                    rowStopIndex: number
                }) => {
                    const triggerTimestamp = Date.now()
                    timestampRef.current = triggerTimestamp
                    const start = columnCount * rowOverscanStartIndex + columnOverscanStartIndex
                    const stop = columnCount * rowOverscanStopIndex + columnOverscanStopIndex

                    setTimeout(() => {
                        if (triggerTimestamp >= timestampRef.current) {
                            setRange({ start, stop })
                        }
                    }, 500)
                }
                return <Grid
                    className={styles.full_grid}
                    cellRenderer={cellRenderer}
                    onSectionRendered={handleSectionRendered}
                    columnCount={columnCount}
                    columnWidth={actualColWidth}
                    height={height}
                    rowCount={rowCount}
                    rowHeight={ROW_HEIGHT}
                    width={width}
                    style={{
                        overflowX: 'hidden'
                    }}
                />
            }}
        </AutoSizer>
    </div>

}

export default observer(Form)