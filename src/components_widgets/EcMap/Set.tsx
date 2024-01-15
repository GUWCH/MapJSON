import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useDeepCompareEffect } from "react-use";
import _ from 'lodash';
import { ModalProps } from 'antd';
import DropDown, { DropDownComponentType, DropDownProps } from 'DropDown';
import { ExtractModel, uIdKey } from '@/components_utils/models';
import { PointSelect, PointSelectProps } from "@/components";
import SetModal from '@/components/SetModal';
import Intl, { msgTag } from '@/common/lang';
import { IEcMapCfg, EcMapCache, EcMapFnTypes } from './index';

const msg = msgTag('pagetpl');

interface ICompSet extends ModalProps {
    children?: React.ReactNode;
    filters?: (string | number)[];
    config: ExtractModel | ExtractModel[];
    cache: EcMapCache;
    onSave?: (data: EcMapCache) => void;
    visible?: boolean;
}

const CompSet = (props: ICompSet) => {
    const { 
        children, 
        visible=false, 
        title='', 
        afterClose=()=>{}, 
        onSave=()=>{},
        filters,
        config,
        cache={},
        ...restProps 
    } = props;

    const getKey = useCallback((m: ExtractModel) => {
        return `${m.table_no}_${m.type}`;
    }, []);

    // 初始化组态配置里场站类型列表
    const domains = useMemo(() => {
        return (Array.isArray(config) ? config : config ? [config] : []).map(m => {
            return {
                name: Intl.isZh ? m.model_name_cn || m.model_name : m.model_name,
                value: getKey(m),
                type: String(m.type)
            }
        })
    }, [config]);
    
    // 初始化缓存
    const [site, setSite] = useState({selected: domains[0] ? domains[0].value : ''});
    const [tempCache, setTempCache] = useState<EcMapCache>(() => {
        let temp = {};
        domains.map(d => {
            temp[d.value] = {};
            for(let k in EcMapFnTypes){
                temp[d.value][EcMapFnTypes[k]] = {
                    show: false,
                    points: []
                }
            }
        });
        return Object.assign({}, temp, JSON.parse(JSON.stringify(cache)));
    });
    const curSite: ExtractModel = useMemo(() => {
        return config.filter(c => getKey(c) === site.selected)[0];
    }, [config, site.selected]);

    const siteContents: any[] = [];
    if(site.selected){
        for(const fnType in EcMapFnTypes){
            const fnKey: EcMapFnTypes = EcMapFnTypes[fnType];
            const siteConfigPoints = ((curSite?.fnMap || {})[fnKey] || []);
            const cacheData = tempCache[site.selected][fnKey];
            const cacheDataKey = 'points';

            let firstHeadline = '';
            let secondHeadline = '';
            let isChecked = false;
            let pointTree = false;
            let pointTreeMax = -1;

            switch(fnKey){
                case EcMapFnTypes.STATUS:
                    firstHeadline = msg('MAP.status');
                    secondHeadline = msg('MAP.statusType');
                    isChecked = false;
                    break;
                case EcMapFnTypes.INFO:
                    firstHeadline = msg('MAP.info');
                    secondHeadline = msg('MAP.infoType');
                    isChecked = true;
                    break;
                case EcMapFnTypes.OVERVIEW:
                    firstHeadline = msg('MAP.overview');
                    isChecked = true;
                    pointTree = true;
                    pointTreeMax = 3;
                break;
                case EcMapFnTypes.QUOTA:
                    firstHeadline = msg('MAP.quota');
                    isChecked = true;
                    pointTree = true;
                    pointTreeMax = 6;
                break;
                case EcMapFnTypes.STATISTICS:
                    firstHeadline = msg('MAP.stat');
                    isChecked = true;
                    pointTree = true;
                    pointTreeMax = 12;
                break;
            }

            siteContents.push({
                key: fnKey,
                type: 'customize',
                aboveExtra: () => {
                    return <DropDown 
                        // @ts-ignore
                        data={cacheData}
                        content = {[{
                            name: firstHeadline,
                            members: !isChecked ? [] : [{
                                component: DropDownComponentType.CHECK,
                                key: 'show'
                            }]
                        }]}
                        onChange = {(args) => {
                            setTempCache(c => {
                                c[site.selected][fnKey] = Object.assign({}, cacheData, args);
                                return Object.assign({}, c);
                            });
                        }}
                    />
                },
                customizeDom: () => {                
                    const dropdownData = {[cacheDataKey]: (cacheData?.points || []).map(p => p.key)};
                    const pointRender = cacheData?.points?.map((p) => {
                        const configPoint = siteConfigPoints.find(f => f[uIdKey] === p.key) || {};

                        const item1 = {
                            name: msg('MAP.showName'),
                            members: [{
                                component: 'input',
                                key: Intl.isZh ? 'nameCn' : 'nameEn'
                            }]
                        };
                        const item2 = {
                            name: msg('MAP.style'),
                            members: [{
                                component: 'icon',
                                key: 'icon',
                            },{
                                component: 'colorPick',
                                key: 'background',
                            }]
                        };
                        const item2_1 = {
                            name: msg('MAP.style'),
                            members: [{
                                component: 'icon',
                                key: 'icon',
                            }]
                        };
                        const item3 = {
                            name: msg('MAP.style'),
                            members: [{
                                component: 'select',
                                key: 'chart',
                                type: 'chartType'
                            },{
                                component: 'colorPick',
                                key: 'chartColor',
                            }]
                        };
                        const item4 = {
                            members: [{
                                component: 'condition',
                                type: 'convert',
                                key: 'convert'
                            }]
                        };
                        const item5 = {
                            members: [{
                                component: 'condition',
                                type: 'ycCondition',
                                key: 'conditions'
                            }]
                        };
                        const item6 = {
                            members: [{
                                component: 'condition',
                                type: 'yxConditionIconBg',
                                key: 'valueMap',
                                valueList: configPoint?.const_name_list || []
                            }]
                        };

                        const items: any[] = [];
                        switch(fnKey){
                            case EcMapFnTypes.STATUS: {
                                const isMeasure = (p.key.startsWith('62') || p.key.startsWith('35'));
                                const isNoMeasure = p.key.startsWith('61');
                                const consts = configPoint?.const_name_list || [];

                                if(isMeasure){
                                    items.push({
                                        name: msg('MAP.style'),
                                        members: [{
                                            component: 'icon',
                                            key: 'icon',
                                        },{
                                            component: 'colorPick',
                                            key: 'background',
                                        }]
                                    }, {
                                        members: [{
                                            component: 'condition',
                                            type: 'convert',
                                            key: 'convert',
                                        }]
                                    });
                                }

                                if(isNoMeasure){
                                    items.push({
                                        members: [{
                                            component: 'custom',
                                            customRender: <PointSelect 
                                                limitNum={-1} 
                                                selectedData = {consts.map(c => {
                                                    return {
                                                        title: Intl.isZh ? c.name : c.name_en,
                                                        key: c.value,
                                                        dropDownContent: <DropDown 
                                                            data={(p.attrs?.valueMap || {})[c.value] || {}}
                                                            content = {[{
                                                                name: msg('MAP.style'),
                                                                members: [{
                                                                    component: 'icon',
                                                                    key: 'icon',
                                                                },{
                                                                    component: 'colorPick',
                                                                    key: 'background',
                                                                }]
                                                            }]}
                                                            onChange = {(args) => {
                                                                setTempCache((old) => {
                                                                    const statusPoint = (cacheData[cacheDataKey] || []).find(status => status.key === p.key);
                                                                    if(statusPoint){
                                                                        statusPoint.attrs = statusPoint.attrs || {};
                                                                        statusPoint.attrs.valueMap = statusPoint.attrs.valueMap || {};
                                                                        statusPoint.attrs.valueMap[c.value] = Object.assign({}, statusPoint.attrs.valueMap[c.value] || {}, args);

                                                                    }
                                                                    return JSON.parse(JSON.stringify(old));
                                                                });
                                                            }}
                                                        />
                                                    }
                                                })} 
                                                options = {consts.map(c => {
                                                    return {
                                                        id: c.value,
                                                        key: c.value,
                                                        title: Intl.isZh ? c.name : c.name_en,
                                                        value: c.value,
                                                        needLabelShow: true
                                                    }
                                                })} 
                                                onChange = {() => {}}
                                                needDelete = {false}
                                                needSelect = {false}
                                                treeProps = {{
                                                    treeDefaultExpandAll: true,
                                                }}
                                                dropDownStyle = {{width: "100%", minWidth: 0}}
                                            />
                                        }]
                                    });
                                }
                                break;
                            }
                            case EcMapFnTypes.INFO:
                                items.push(item4);
                                break;
                            case EcMapFnTypes.OVERVIEW:
                                items.push(item1, item3, item4);
                            break;
                            case EcMapFnTypes.QUOTA:
                                const isMeasure = (p.key.startsWith('62') || p.key.startsWith('35'));
                                const isNoMeasure = p.key.startsWith('61');
                                if(isNoMeasure){
                                    items.push(item1, item6);
                                }else{
                                    items.push(item1, item2_1, item5, item4);
                                }
                                
                            break;
                            case EcMapFnTypes.STATISTICS:
                                items.push(item2);
                            break;
                        }

                        return {
                            title: Intl.isZh ? configPoint.name_cn : configPoint.name_en,
                            key: p.key,
                            dropDownContent: <DropDown 
                                data={p.attrs || {}}
                                content = {items}
                                onChange = {(args) => {
                                    setTempCache((old) => {
                                        p.attrs = Object.assign({}, p.attrs || {}, args);
                                        return Object.assign({}, old);
                                    });
                                }}
                            />
                        }
                    });

                    return <>
                        {
                            !pointTree && <DropDown 
                                data={dropdownData}
                                content = {[{
                                    name: secondHeadline,
                                    members: [{
                                        component: DropDownComponentType.SELECT,
                                        options: siteConfigPoints.map(p => {
                                            return {
                                                name: Intl.isZh ? p.name_cn : p.name_en,
                                                value: p[uIdKey]
                                            }
                                        }),
                                        key: cacheDataKey,
                                        dataIsArray: true
                                    }]
                                }]}
                                onChange = {(args) => {
                                    const points = args[cacheDataKey] || [];
                                    const selectPoints = siteConfigPoints.filter(p => points.indexOf(p[uIdKey]) > -1);
                                    setTempCache(c => {
                                        c[site.selected][fnKey] = Object.assign({}, cacheData, {
                                            [cacheDataKey]: selectPoints.map(p => {
                                                return {
                                                    key: p[uIdKey],
                                                    title: Intl.isZh ? p.name_cn : p.name_en
                                                }
                                            })
                                        });
                                        return Object.assign({}, c);
                                    });
                                }}
                            />
                        }                        
                        <PointSelect 
                            limitNum={pointTreeMax} 
                            selectedData={pointRender}
                            options={siteConfigPoints.map((p) => {
                                return {
                                    id: p[uIdKey],
                                    key: p[uIdKey],
                                    title: Intl.isZh ? p.name_cn : p.name_en,
                                    value: p[uIdKey],
                                    needLabelShow: true
                                }
                            })}
                            onChange = {(args) => {
                                setTempCache(c => {
                                    // 已配置数据要合并
                                    const oldDataMap = {};
                                    (cacheData[cacheDataKey] || []).map(p => oldDataMap[p.key] = p);
                                    const newData = args.map(f => {
                                        return Object.assign({}, f, oldDataMap[f.key] || {});
                                    });
                                    c[site.selected][fnKey] = Object.assign({}, cacheData, {
                                        [cacheDataKey]: newData
                                    });
                                    return Object.assign({}, c);
                                });
                            }}
                            needDelete = {true}
                            needSelect = {pointTree}
                            treeProps = {{style: {width: '100%', height: '36px', marginBottom: '10px'}}}
                            dropDownStyle = {{width: "100%"}}
                        />
                    </>
                }
            });
        }
    }

    useDeepCompareEffect(() => {
        const filterDomains = domains.filter(d => 
            !Array.isArray(filters) || 
            filters.length === 0 || 
            filters.indexOf(d.type) > -1
        );
        setSite({selected: filterDomains[0] ? filterDomains[0].value : ''});
    }, [domains, filters]);

    return <SetModal 
        title={title}
		content={[{
            key: '',
            keyName: '',
            nameShow: false,
            describe: '',
            type: 'customize',
            customizeDom: () => {
                return <DropDown 
                    data={site}
                    content = {[{
                        name: msg('MAP.domain'),
                        members: [{
                            component: DropDownComponentType.SELECT,
                            options: domains.filter(d => !Array.isArray(filters) || filters.length === 0 || filters.indexOf(d.type) > -1),
                            key: 'selected'
                        }]
                    }]}
                    onChange = {(args) => {
                        setSite((old) => {
                            return Object.assign({}, old, args);
                        });
                    }}
                />
            }
        }].concat(siteContents)}
        visible={visible}
        afterClose={afterClose}
        handleReset={() => {
            setTempCache(() => {
                let temp = {};
                domains.map(d => {
                    temp[d.value] = {};
                    for(let k in EcMapFnTypes){
                        temp[d.value][EcMapFnTypes[k]] = {
                            show: false,
                            points: []
                        }
                    }
                });
                return Object.assign({}, temp, JSON.parse(JSON.stringify(cache)));
            });
        }}
        memorySave={() => {
            onSave(JSON.parse(JSON.stringify(tempCache)));
        }}
        {...restProps}
	>{children}</SetModal>
}

export default React.memo(CompSet, (prev, next) => {
    const same = _.isEqual(prev.visible, next.visible);
    return same;
});