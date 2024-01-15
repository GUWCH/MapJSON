import scadaCfg, { CommonTimerInterval } from '@/common/const-scada';
import { _dao } from '@/common/dao';
import { useMemoryStateCallback } from '@/common/util-memory';
import { getStyleValue, groupByTableNo } from '@/common/util-scada';
import { NODE_TYPE, getAssetAlias } from '@/common/utils';
import { DropDown, SetSelect as IconSelect, confirm } from '@/components';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import { FontIcon, Icon2, IconType } from "Icon";
import SetModal, { ContentItem } from 'SetModal';
import { Popover } from "antd";
import _ from 'lodash';
import { Observer } from 'mobx-react';
import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import PageCard from '../../components_utils/Card';
import {
    BG_KEY,
    defaultPointProps,
    geoMsg,
    getPointDropDown,
    isZh,
    otherType,
    pointTypes,
    yxItemDropDown
} from './constants';
import DragDrop, { DragDropData, Config as PosConfig } from './dragDrop';
import UploadWrap from './upload';

import { getDynKey } from "@/common/utils/model";
import styles from './style.module.scss';
import { NameTooltipInfo } from './tooltips/DeviceTooltip';

const isDev: boolean = process.env.NODE_ENV === 'development';

export const GeographyDistDefaultOptions = {}
export const GeographyDistDefaultCfg = {}
// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const GeographyDistCfg: IGeographyDistCfg = {};

export interface IGeographyDistCfg {
    customAssetAlias?: string;
    title?: string,
    title_en?: string,
    cfg?: ExternalCfg[]
    devices?: DeviceType[]
}

export interface Device {
    type: string,
    jumpable?: boolean,
    jumpToTpl?: boolean,
    toSwitchPage?: boolean,
    needStatus: boolean,
    needQuotas: boolean,
    needName: boolean,
    needStatics: boolean,
    typeIcon: string,
    deviceTypeName: string,
    prefixName: string,
    aliasList: string[]
}

interface QuotaItem {
    key?: string;
    alias: string;
    name_cn: string;
    name_en: string;
    table_no: number;
    field_no: number;
    unit?: string;
    const_name_list?: any[];
    // 配置的样式
    edictNameCn?: string | undefined;
    edictNameEn?: string | undefined;
    icon?: string;
    color?: string;
    convert?: any;
    ycCondition?: any;
    yxCondition?: any;
}

interface ExternalCfg {
    type: string,
    needStatus: boolean,
    needQuotas: boolean,
    needBg?: boolean,
    name_cn: string,
    name_en: string,
    status: QuotaItem[],
    quotas: QuotaItem[],
    bg?: QuotaItem[],
}

export interface DeviceType {
    key: string;
    name_cn: string;
    name_en: string;
    total: {
        alias: string,
        name_cn?: string,
        name_en?: string,
        table_no: number,
        field_no: number,
    },
    count: {
        alias: string,
        name_cn?: string,
        name_en?: string,
        table_no: number,
        field_no: number,
        color?: string,
        statusDescCn?: string,
        statusDescEn?: string
    }
}

type CacheCfg = {
    type: string,
    icon: string,
    editCount?: number,
    status: QuotaItem[],
    quotas: QuotaItem[],
    bg?: QuotaItem[]
}[]

export type BgCache = {
    rawName?: string,
    uName?: string
} | null

const labelPoints = (selectedItems, onAttriChange, isYx = false, isBg = false) => {
    return (selectedItems || []).map((item, index) => {
        let {
            edictNameCn,
            edictNameEn,
            icon,
            color,
            convert,
            ycCondition,
            yxCondition
        } = Object.assign({}, defaultPointProps, item);
        return {
            title: isZh ? item.name_cn : item.name_en,
            key: item.key,
            dragabled: isYx || isBg ? false : true,
            dropDownContent: <DropDown
                key={index}
                data={isYx ? { color: color, icon: icon } : {
                    edictNameCn: edictNameCn,
                    edictNameEn: edictNameEn,
                    color: color,
                    convert: convert,
                    icon: icon,
                    ycCondition: ycCondition,
                    yxCondition: yxCondition
                }}
                content={isYx || isBg ? yxItemDropDown : getPointDropDown(item)}
                onChange={(attri) => onAttriChange(item.key, attri)}
            />
        };
    })
}

const getContent = (
    projectCfg: ExternalCfg[],
    curCfg: CacheCfg,
    onAttriChange,
    onChange,
    onStatusAttriChange,
    onStatusChange,
    handleOtherChange,
    onBgChange,
    onBgAttrChange
): ContentItem[] => {
    return projectCfg.map(deviceCfg => {
        const { type, name_cn, name_en, needStatus, needBg, needQuotas, bg, status, quotas } = deviceCfg;

        const curCfgItem = curCfg.find(item => item.type === type);

        // 必须使用组态配置里的,会变更, 保存配置里不能使用
        if (curCfgItem) {
            // 保存在const_name_list里了
            if (Array.isArray(curCfgItem.status)) {
                curCfgItem.status = curCfgItem.status.map(q => {
                    const native = status?.find(f => getDynKey({ point: f, assetAlias: '#.#.#' }) === q.key);
                    const { const_name_list = [], ...rest } = native || {};

                    q.const_name_list = const_name_list.map(objNative => {
                        const { name, name_en, value } = objNative;
                        const obj = q?.const_name_list?.find(c => String(c.value) === String(value));
                        return {
                            ...(obj || objNative),
                            name,
                            name_en,
                            value
                        }
                    });

                    return Object.assign({}, q, { ...rest });
                });
            }

            // 保存在const_name_list里了
            if (Array.isArray(curCfgItem.bg)) {
                curCfgItem.bg = curCfgItem.bg.map(q => {
                    const native = bg?.find(f => getDynKey({ point: f, assetAlias: '#.#.#' }) === q.key);
                    const { const_name_list = [], ...rest } = native || {};

                    q.const_name_list = const_name_list.map(objNative => {
                        const { name, name_en, value } = objNative;
                        const obj = q?.const_name_list?.find(c => String(c.value) === String(value));
                        return {
                            ...(obj || objNative),
                            name,
                            name_en,
                            value
                        }
                    });

                    return Object.assign({}, q, { ...rest });
                });
            }

            // 值类型改变导致可能有未匹配的配置, 过滤掉, 值不存在的保留因为添加添加没配置时这个值是不存在的，如果过滤掉会导致添加条件失败
            if (Array.isArray(curCfgItem.quotas)) {
                curCfgItem.quotas = curCfgItem.quotas.map(q => {
                    const temp = Object.assign({}, q, quotas?.find(f => getDynKey({ point: f, assetAlias: '#.#.#' }) === q.key) || {});
                    if (temp && Array.isArray(temp.yxCondition)) {
                        temp.yxCondition = temp.yxCondition.filter(c => !c.value || !!temp?.const_name_list?.find(nc => String(nc.value) === String(c.value)));
                    }
                    return temp;
                });
            }
        }

        const constList = (curCfgItem?.status[0]?.const_name_list || []).map(ele => {
            const { value, name, name_en, ...rest } = ele;

            return {
                key: String(value),
                name_cn: name,
                name_en: name_en,
                ...rest
            }
        })

        const constBgList = (curCfgItem?.bg?.[0]?.const_name_list || []).map(ele => {
            const { value, name, name_en, ...rest } = ele;

            return {
                key: String(value),
                name_cn: name,
                name_en: name_en,
                ...rest
            }
        })

        const points = (quotas || []).map(ele => {
            return { ...ele, key: getDynKey({ point: ele, assetAlias: '#.#.#' }) };
        })

        const statusPoints = (status || []).map(ele => {
            return {
                value: getDynKey({ point: ele, assetAlias: '#.#.#' }),
                name: isZh ? ele.name_cn : ele.name_en
            };
        })

        const bgPoints = (bg || []).map(ele => {
            return {
                value: getDynKey({ point: ele, assetAlias: '#.#.#' }),
                name: isZh ? ele.name_cn : ele.name_en
            };
        })

        return {
            title: isZh ? name_cn : name_en,
            key: type,
            dragabled: false,
            secondContent: [
                {
                    key: 'typeIcon',
                    type: 'customize',
                    customizeDom: <div>
                        <div className={styles.typeIcon}>
                            <span>{geoMsg('icon')}</span>
                            <IconSelect
                                key={'typeIcon'}
                                type={'icon'}
                                value={curCfgItem?.icon || ''}
                                onChange={(value) => { handleOtherChange(type, 'icon', value) }}
                                incluedNo={true}
                            ></IconSelect>
                        </div>
                        {/* {type === 'bs' ? <div className={styles.typeIcon}>
                        <span>{geoMsg('count')}</span>
                        <InputNumber 
                            key = {'editCount'}
                            size = {'small'}
                            min = {0}
                            max = {3}
                            value = {curCfgItem?.editCount || 0}
                            onChange = {(value) => {handleOtherChange(type, 'editCount',value)}}
                        />
                    </div> : null} */}
                    </div>
                },
                ...(needStatus ? [{
                    key: 'status',
                    keyName: geoMsg('status'),
                    nameShow: true,
                    type: 'yxSelect',
                    describe: geoMsg('describe'),
                    selectProps: {
                        incluedNo: true,
                        options: statusPoints,
                        value: curCfgItem?.status[0]?.key || '',
                        onChange: (...props) => onStatusChange(type, ...props)
                    },
                    itemProps: {
                        needDelete: false,
                        needSelect: false,
                        options: [],
                        selectedData: labelPoints(
                            constList,
                            (...props) => onStatusAttriChange(type, ...props),
                            true
                        )
                    }
                }] : []),
                ...(needBg ? [{
                    key: 'bg',
                    keyName: geoMsg('bg'),
                    nameShow: true,
                    type: 'yxSelect',
                    describe: geoMsg('describe'),
                    selectProps: {
                        incluedNo: true,
                        options: bgPoints,
                        value: (curCfgItem?.bg ?? [])[0]?.key || '',
                        onChange: (...props) => onBgChange(type, ...props)
                    },
                    itemProps: {
                        needDelete: false,
                        needSelect: false,
                        options: [],
                        selectedData: labelPoints(
                            constBgList,
                            (...props) => onBgAttrChange(type, ...props),
                            false,
                            true
                        )
                    }
                }] : []),
                ...(needQuotas ? [{
                    key: 'quota',
                    keyName: geoMsg('quota'),
                    nameShow: true,
                    type: 'points',
                    itemProps: {
                        limitNum: 5,
                        options: groupByTableNo(points.map((point) => {
                            const { name_cn, name_en, key, table_no } = point;
                            return {
                                name: isZh ? name_cn : name_en,
                                key: key,
                                tableNo: table_no
                            }
                        }), pointTypes, otherType, false),
                        selectedData: labelPoints(curCfgItem?.quotas, (...props) => onAttriChange(type, ...props)),
                        onChange: (...props) => onChange(type, ...props),
                    }
                }] : [])
            ]
        }
    })
}

const Geographical = React.forwardRef<{
    handleReset: () => void
    handleSave: () => void
    handleExit: () => void
}, {
    bgUrl: string
    isEdit?: boolean
    isConfiguring?: boolean
    projectCfg: any,
    devicesTypes,
    assetAlias,
    id,
    pageId,
    afterClose,
}>((({
    bgUrl,
    isEdit,
    isConfiguring,
    projectCfg,
    devicesTypes,
    assetAlias,
    id,
    pageId,
    afterClose,
}, ref) => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [dynValueMap, setDynValueMap] = useState<
        Record<string, NameTooltipInfo[] | undefined>
    >({});

    const [posCacheConfig, setPosCacheConfig] = useMemoryStateCallback<PosConfig | null>(null, assetAlias, id);

    //默认配置计算
    let defaultCfg: any[] = useMemo(() => {
        let temp: any[] = [];
        Array.isArray(projectCfg) && projectCfg.map(ele => {
            const { type, icon, status = [], quotas = [], bg = [], quotaNum } = ele;

            temp.push({
                type: type,
                icon: icon || '',
                status: status.filter(q => q.isDefault).map(q => {
                    return Object.assign({}, q, { key: getDynKey({ point: q, assetAlias: '#.#.#' }) });
                }).slice(0, 1),
                quotas: quotas.filter(q => q.isDefault).map(q => {
                    let { defaultStyle = {}, ...rest } = q;
                    return Object.assign({}, rest, { key: getDynKey({ point: q, assetAlias: '#.#.#' }) }, defaultStyle);
                }).slice(0, quotaNum || 4),
                bg: bg.filter(q => q.isDefault).map(q => {
                    let { defaultStyle = {}, ...rest } = q;
                    return Object.assign({}, rest, { key: getDynKey({ point: q, assetAlias: '#.#.#' }) }, defaultStyle);
                }).slice(0, 1),
            })
        });
        return temp;
    }, [projectCfg]);
    const [cfg, setCfg] = useMemoryStateCallback<CacheCfg>(JSON.parse(JSON.stringify(defaultCfg)), pageId, id);

    const [curCfg, setCurCfg] = useState<CacheCfg>(JSON.parse(JSON.stringify(cfg)));  //当前指标配置
    const [curPosCfg, setCurPosCfg] = useState<PosConfig | null>(JSON.parse(JSON.stringify(posCacheConfig)))  // 当前地理位置配置

    const deviceData = useMemo<DragDropData[]>(() => devices.map(d => {
        const cfgItem = cfg.find(c => c.type === d.type);
        return {
            ...d,
            ...{ typeIconCode: cfgItem?.icon ?? '' },
        }
    }), [cfg, devices])

    // 初始化zIndex排序
    // useEffect(() => {
    //     if (deviceData.length === 0) return;
    //     const newConfig = deviceData.flatMap(d => d.aliasList)
    //         .sort((a, b) => {
    //             return (curPosCfg?.[a]?.zIndex || 999) - (curPosCfg?.[b]?.zIndex || 999);
    //         })
    //         .reduce((pre, cur, inx) => {
    //             return {
    //                 ...pre,
    //                 [cur]: {
    //                     ...curPosCfg?.[cur],
    //                     zIndex: inx + 1
    //                 }
    //             }
    //         }, {} as PosConfig)
    //     setCurPosCfg(newConfig);
    // }, [deviceData, curPosCfg])

    useEffect(() => {

        const fetchDevices = async () => {
            let tree = await scadaCfg.getTree();
            let subStationAliasList = [];
            let subStationsRes = await _dao.getSubstationByFac([assetAlias]);
            if (subStationsRes.code == '10000' && subStationsRes.data.length > 0) {
                let temp = subStationsRes.data.find(d => d.fac_alias === assetAlias);
                if (temp && temp.substation) {
                    subStationAliasList = temp.substation.map(t => t.substation_alias);
                }
            }
            let newDevice = [];

            if (tree) {
                newDevice = projectCfg.map(dT => {
                    const { status, quotas, name_cn = '', name_en = '', ...rest } = dT;
                    let aliasList: string[] = [];

                    if (dT.type === 'bs') {
                        aliasList = subStationAliasList;
                    } else {
                        // @ts-ignore
                        const arr = tree.getNodesByParam('node_type', NODE_TYPE[dT.type]);
                        arr.filter(a => {
                            let { alias = '' } = a;
                            return alias && assetAlias && alias.split('.')[0] === assetAlias;
                        }).map((a) => {
                            aliasList.push(a.alias)
                        })
                    }

                    return {
                        ...rest,
                        typeIcon: '',
                        deviceTypeName: isZh ? name_cn : name_en,
                        aliasList: aliasList
                    }
                })

                setDevices(newDevice)
            }
        }

        if (isDev) {
            setDevices(projectCfg.map(dT => {
                const { status, quotas, name_cn = '', name_en = '', ...rest } = dT;
                let aliasList: string[] = [];

                switch (dT.type) {
                    case 'matrix':
                        aliasList = [
                            'SD1.Matrix001.Statistics',
                            'SD1.Matrix002.Statistics',
                            'SD1.Matrix003.Statistics', 'SD1.Matrix004.Statistics',
                            'SD1.Matrix005.Statistics', 'SD1.Matrix006.Statistics', 'SD1.Matrix007.Statistics', 'SD1.Matrix008.Statistics',
                            'SD1.Matrix009.Statistics', 'SD1.Matrix010.Statistics', 'SD1.Matrix011.Statistics', 'SD1.Matrix012.Statistics',
                            'SD1.Matrix013.Statistics', 'SD1.Matrix014.Statistics', 'SD1.Matrix005.Statistics', 'SD1.Matrix016.Statistics',
                            'SD1.Matrix017.Statistics', 'SD1.Matrix018.Statistics', 'SD1.Matrix019.Statistics', 'SD1.Matrix020.Statistics',
                            'SD1.Matrix021.Statistics', 'SD1.Matrix022.Statistics', 'SD1.Matrix023.Statistics', 'SD1.Matrix024.Statistics',
                            'SD1.Matrix025.Statistics', 'SD1.Matrix026.Statistics', 'SD1.Matrix027.Statistics', 'SD1.Matrix028.Statistics',
                        ];
                        break;

                    case 'wts':
                        aliasList = [
                            'SD1.Farm.WTS001', 'SD1.Farm.WTS002'
                        ];
                        break;

                    case 'bs':
                        aliasList = [
                            'SXGLSS', 'SXGLSS01'
                        ]
                        break;
                }

                return {
                    ...rest,
                    typeIcon: '',
                    deviceTypeName: isZh ? name_cn : name_en,
                    aliasList: aliasList
                }
            }))
        } else {
            fetchDevices();
        }
    }, [])

    useEffect(() => {
        setCurPosCfg(JSON.parse(JSON.stringify(posCacheConfig)));
    }, [posCacheConfig])

    useEffect(() => {
        let newCfg = JSON.parse(JSON.stringify(cfg || []));
        if (!_.isEqual(newCfg, curCfg)) {
            setCurCfg(newCfg);
        }
    }, [cfg])

    useRecursiveTimeoutEffect(
        () => {
            if (devices.length === 0) {
                return;
            }

            let req: {
                id: string,
                decimal: number,
                key: string
            }[] = [];

            cfg.forEach(item => {
                let { type, status = [], quotas = [], bg = [] } = item;

                const { aliasList, needStatics = false } = devices.find(d => d.type === type) || {};

                (aliasList || []).forEach(alias => {
                    if (needStatics) {
                        devicesTypes.forEach((t) => {
                            const { count, total } = t;

                            count && req.push({
                                id: "",
                                decimal: 0,
                                key: getDynKey({ point: count, assetAlias: alias })
                            })

                            total && req.push({
                                id: "",
                                decimal: 0,
                                key: getDynKey({ point: total, assetAlias: alias })
                            })
                        })
                    }

                    status.map(o => {
                        req.push({
                            id: "",
                            decimal: 3,
                            key: getDynKey({ point: o, assetAlias: alias })
                        })
                    })

                    quotas.map(o => {
                        req.push({
                            id: "",
                            decimal: 3,
                            key: getDynKey({ point: o, assetAlias: alias })
                        })
                    })

                    bg.map(o => {
                        req.push({
                            id: "",
                            decimal: 3,
                            key: getDynKey({ point: o, assetAlias: alias })
                        })
                    })
                })
            })

            if (req.length === 0 || isEdit) {
                return;
            }

            return [
                () => {
                    return _dao.getDynData(req);
                },
                (res) => {
                    const valueMap: Record<string, IDyn> = {};
                    let singleDeviceValueMap = {};
                    const data = res.data || [];
                    data.forEach(o => {
                        valueMap[o.key] = o;
                    });

                    devices.map(device => {
                        let { type, aliasList, needStatics } = device;
                        aliasList.map(alias => {
                            singleDeviceValueMap[alias] = [];

                            const cfgItem = cfg.find(c => c.type === type);

                            let statusPoint = cfgItem?.status[0];
                            let bgPoint = (cfgItem?.bg ?? [])[0];
                            let quotaPoints = cfgItem?.quotas;

                            if (statusPoint) {
                                let pointKey = getDynKey({ point: statusPoint, assetAlias: alias })
                                let { name_cn, name_en, edictNameCn, edictNameEn } = statusPoint;

                                let pointVal = {
                                    key: pointKey,
                                    isStatus: true,
                                    name: isZh ? (edictNameCn || name_cn) : (edictNameEn || name_en),
                                    ...getStyleValue(statusPoint, valueMap[pointKey])
                                }

                                singleDeviceValueMap[alias].push(pointVal);
                            }

                            if (bgPoint) {
                                let pointKey = getDynKey({ point: bgPoint, assetAlias: alias });
                                let { name_cn, name_en, edictNameCn, edictNameEn } = bgPoint;

                                let pointVal = {
                                    key: pointKey,
                                    isBg: true,
                                    name: isZh ? (edictNameCn || name_cn) : (edictNameEn || name_en),
                                    ...getStyleValue(bgPoint, valueMap[pointKey])
                                }

                                singleDeviceValueMap[alias].push(pointVal);
                            }

                            quotaPoints && quotaPoints.map(quota => {
                                let pointKey = getDynKey({ point: quota, assetAlias: alias })
                                let { name_cn, name_en, edictNameCn, edictNameEn } = quota;

                                let pointVal = {
                                    key: pointKey,
                                    isStatus: false,
                                    name: isZh ? (edictNameCn || name_cn) : (edictNameEn || name_en),
                                    ...getStyleValue(quota, valueMap[pointKey])
                                }

                                singleDeviceValueMap[alias].push(pointVal);
                            })

                            if (needStatics) {
                                (devicesTypes as DeviceType[]).map((t) => {
                                    const { key, name_cn, name_en, count, total } = t;

                                    const countKey = count ? getDynKey({ point: count, assetAlias: alias }) : '';
                                    const totalKey = total ? getDynKey({ point: total, assetAlias: alias }) : '';

                                    let pointVal = {
                                        countKey: countKey,
                                        totalKey: totalKey,
                                        key: key,
                                        isStatus: false,
                                        isStatics: true,
                                        name: isZh ? name_cn : name_en,
                                        countVal: valueMap[countKey]?.display_value,
                                        totalVal: valueMap[totalKey]?.display_value,
                                        color: count?.color
                                    }

                                    singleDeviceValueMap[alias].push(pointVal);

                                })
                            }
                        })

                    })

                    setDynValueMap(singleDeviceValueMap);
                }
            ];
        },
        CommonTimerInterval,
        [cfg, devices, devicesTypes, isEdit]
    )

    useImperativeHandle(ref, () => {
        return {
            // 地理分布按钮点击
            handleReset: () => setCurPosCfg(null),
            handleSave: () => setPosCacheConfig(curPosCfg, () => { }),
            handleExit: () => setCurPosCfg(posCacheConfig)
        }
    }, [curPosCfg, posCacheConfig])

    const handleStatusAttriChange = (type, itemKey, attri) => {
        let newCurCfg = Array.from(curCfg, x => x);
        let curCfgItem = newCurCfg.find(item => item.type === type);
        if (!curCfgItem || !curCfgItem.status || curCfgItem.status.length === 0) {
            return;
        }

        let { const_name_list = [] } = curCfgItem.status[0];

        let item = const_name_list.find(ele => String(ele.value) === itemKey);
        if (item) {
            Object.assign(item, attri);
            setCurCfg(JSON.parse(JSON.stringify(newCurCfg)));
        }
    }

    const handleStatusChange = (type, value) => {

        let newCurCfg = Array.from(curCfg, x => x);
        let curCfgItem = newCurCfg.find(item => item.type === type);

        if (!curCfgItem) {
            curCfgItem = {
                type: type,
                icon: '',
                status: [],
                quotas: []
            }

            newCurCfg.push(curCfgItem)
        }

        curCfgItem.status = [];

        let projectCfgItem = projectCfg.find(item => item.type === type);

        if (projectCfgItem) {
            let target = projectCfgItem?.status?.find(ele => {
                return getDynKey({ point: ele, assetAlias: '#.#.#' }) === value;
            })

            if (target) {
                target.key = value;
                curCfgItem.status = [target];
            }
        }

        setCurCfg(JSON.parse(JSON.stringify(newCurCfg)));
    }

    const onBgChange = (type, value) => {

        let newCurCfg = Array.from(curCfg, x => x);
        let curCfgItem = newCurCfg.find(item => item.type === type);

        if (!curCfgItem) {
            curCfgItem = {
                type: type,
                icon: '',
                status: [],
                quotas: [],
                bg: []
            }

            newCurCfg.push(curCfgItem)
        }

        curCfgItem.bg = [];

        let projectCfgItem = projectCfg.find(item => item.type === type);

        if (projectCfgItem) {
            let target = projectCfgItem?.bg?.find(ele => {
                return getDynKey({ point: ele, assetAlias: '#.#.#' }) === value;
            })

            if (target) {
                target.key = value;
                curCfgItem.bg = [target];
            }
        }

        setCurCfg(JSON.parse(JSON.stringify(newCurCfg)));
    }

    const onBgAttrChange = (type, itemKey, attrs) => {
        let newCurCfg = Array.from(curCfg, x => x);
        let curCfgItem = newCurCfg.find(item => item.type === type);
        if (!curCfgItem || !curCfgItem.bg || curCfgItem.bg.length === 0) {
            return;
        }

        let { const_name_list = [] } = curCfgItem.bg[0];

        let item = const_name_list.find(ele => String(ele.value) === itemKey);
        if (item) {
            Object.assign(item, attrs);
            setCurCfg(JSON.parse(JSON.stringify(newCurCfg)));
        }
    }

    const handleAttriChange = (type, pointKey, attri) => {
        let newCurCfg = Array.from(curCfg, x => x);
        let curCfgItem = newCurCfg.find(item => item.type === type);
        if (!curCfgItem) return;

        let point = curCfgItem?.quotas?.find(ele => ele.key === pointKey);
        if (point) {
            Object.assign(point, attri);

            setCurCfg(newCurCfg);
        }
    }

    const handlePointsChange = (type, valList: Array<{ key: string, title: string }>) => {
        let newCurCfg = Array.from(curCfg, x => x);
        let rawCurCfgItem = curCfg.find(item => item.type === type);
        let curCfgItem = newCurCfg.find(item => item.type === type);

        if (!curCfgItem) {
            curCfgItem = {
                type: type,
                icon: '',
                status: [],
                quotas: []
            }

            newCurCfg.push(curCfgItem)
        }

        let projectCfgItem = projectCfg.find(item => item.type === type);

        // add
        valList.map(val => {
            if ((rawCurCfgItem?.quotas || []).map(point => point.key).indexOf(val.key) === -1) {
                const rawPoint = (projectCfgItem?.quotas || [])
                    .map(ele => {
                        return { ...ele, key: getDynKey({ point: ele, assetAlias: '#.#.#' }) };
                    })
                    .find(option => option.key === val.key);

                rawPoint && curCfgItem?.quotas.push(Object.assign({}, rawPoint, {
                    key: val.key,
                    name: val.title,
                    ...defaultPointProps
                }))
            }
        })

        // delete
        curCfgItem.quotas = curCfgItem.quotas.filter(point => {
            return point.key && valList.map(ele => ele.key).indexOf(point.key) > -1
        })

        const valKeys = valList.map(val => val.key)

        // reorder
        curCfgItem.quotas.sort((a, b) => {
            if (!a.key) {
                return b.key ? -1 : 1
            }
            if (!b.key) {
                return a.key ? 1 : 0
            }
            return valKeys.indexOf(a.key) - valKeys.indexOf(b.key);
        });

        setCurCfg(newCurCfg);
    }

    const handleOtherChange = (type, key, val) => {
        let newCurCfg = Array.from(curCfg, x => x);
        let curCfgItem = newCurCfg.find(item => item.type === type);

        if (!curCfgItem) {
            curCfgItem = {
                type: type,
                icon: '',
                status: [],
                quotas: []
            }

            newCurCfg.push(curCfgItem)
        }

        curCfgItem[key] = val;
        setCurCfg(newCurCfg);
    }

    return <div className={styles.container}>
        <div className={styles.content}>
            <DragDrop
                isEdit={!!isEdit}
                bgUrl={bgUrl}
                data={deviceData}
                valData={dynValueMap}
                config={curPosCfg ?? {}}
                onConfigChange={(d) => { setCurPosCfg(d) }}
            />
        </div>
        <SetModal
            isDoubleFold={true}
            visible={isConfiguring}
            title={geoMsg('set')}
            content={getContent(
                projectCfg,
                curCfg,
                handleAttriChange,
                handlePointsChange,
                handleStatusAttriChange,
                handleStatusChange,
                handleOtherChange,
                onBgChange,
                onBgAttrChange
            )}
            memorySave={() => {
                setCfg(JSON.parse(JSON.stringify(curCfg)), () => { });
            }}
            handleReset={() => setCurCfg(JSON.parse(JSON.stringify(cfg)))}
            afterClose={afterClose}
        />
    </div>;
}))

export function GeographyDist(props: Omit<WidgetProps, 'configure'> & {
    externalCfg?: {
        title?: string,
        title_en?: string,
        customAssetAlias?: string,
        cfg?: ExternalCfg[],
        devicesTypes?: DeviceType[]
    },
    customAssetAlias?: string
}) {
    const { id, pageId, assetAlias = '', scale, isDemo, externalCfg } = props;
    const { title = '', title_en = '', customAssetAlias = '', cfg = [], devicesTypes = [] } = externalCfg ?? {}

    const finalAssetAlias = isDev ? 'SD1.Farm.Statistics' : getAssetAlias(assetAlias, customAssetAlias);

    const [isConfiguring, setIsConfiguring] = useState(false);
    const [isEdictPopoverShow, setIsEdictPopoverShow] = useState(false);
    const [isSetBackground, setIsSetBackground] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [bg, setBg] = useState<any | null>(null);

    const [bgCacheConfig, setBgCacheConfig]       // 背景图片缓存
        = useMemoryStateCallback<BgCache>(null, assetAlias, BG_KEY);

    // 获取初始背景图片的文件流
    useEffect(() => {
        if (!bgCacheConfig || !bgCacheConfig.uName) {
            setBg(null);
            return;
        };

        _dao.backgroundImgDisplay(bgCacheConfig.uName).then((res) => {
            if (res && res.url) {
                setBg(res);
            } else {
                setBg(null);
            }
        })
    }, [bgCacheConfig])

    const geoChild = useRef<{
        handleReset: () => void
        handleSave: () => void
        handleExit: () => void
    }>(null);

    return <Observer>{() => {
        return <PageCard
            title={title}
            title_en={title_en}
            extra={
                isEdit ? <div className={styles.onEditor}>
                    <button onClick={() => {
                        confirm({
                            title: geoMsg('resetTitle'),
                            content: geoMsg('resetContent'),
                            okText: geoMsg('ok'),
                            cancelText: geoMsg('cancel'),
                            onOk: () => {
                                geoChild.current?.handleReset();
                            }
                        });

                    }}>{geoMsg('reset')}</button>
                    <button onClick={() => {
                        setIsEdit(false);
                        geoChild.current?.handleSave();
                    }}>{geoMsg('save')}</button>
                    <button onClick={() => {
                        confirm({
                            title: geoMsg('exitTitle'),
                            content: geoMsg('exitContent'),
                            okText: geoMsg('ok'),
                            cancelText: geoMsg('cancel'),
                            onOk: () => {
                                geoChild.current?.handleExit();
                                setIsEdit(false);
                            }
                        });
                    }}>{geoMsg('exit')}</button>
                </div>
                    :
                    <div className={styles.head}>
                        <Popover
                            placement="bottomRight"
                            trigger="click"
                            overlayInnerStyle={{ backgroundColor: '#083F4D' }}
                            content={
                                <div style={{ cursor: 'pointer' }}>
                                    <p onClick={() => setIsEdit(true)}>{geoMsg('editLable')}</p>
                                    <p onClick={() => setIsSetBackground(!isSetBackground)}>{geoMsg('editBg')}</p>
                                </div>
                            }
                        >
                            <div className={styles.editor} onClick={() => {
                                setIsEdictPopoverShow(!isEdictPopoverShow)
                            }}>
                                <FontIcon type={IconType.EDITOR}></FontIcon>
                            </div>
                        </Popover>
                        <div className={styles.set} onClick={() => { setIsConfiguring(!isConfiguring) }}>
                            <Icon2 type={IconType.CONFIG} highlight={isConfiguring} ></Icon2>
                        </div>
                    </div>
            }
        >
            {!isDemo && <Geographical
                ref={geoChild}
                bgUrl={bg?.url || ''}
                isEdit={isEdit}
                isConfiguring={isConfiguring}
                projectCfg={externalCfg?.cfg}
                devicesTypes={devicesTypes}
                assetAlias={finalAssetAlias}
                id={id}
                pageId={pageId}
                afterClose={() => { setIsConfiguring(false) }}
            />}
            <UploadWrap
                initFileList={bgCacheConfig && bg ? [{
                    uid: 1,
                    name: bgCacheConfig?.rawName || '',
                    status: 'done',
                    url: bg.url,
                    uName: bgCacheConfig?.uName || ''
                }] : []}
                bgCacheConfig={bgCacheConfig}
                setBgCacheConfig={(data) => setBgCacheConfig(data, () => { })}
                isSetBackground={isSetBackground}
                afterClose={() => setIsSetBackground(false)}
            />
        </PageCard>
    }}</Observer>
}