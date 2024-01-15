import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Popover, PopoverProps } from 'antd';
import Intl, { msgTag } from '@/common/lang';
import { useDeepCompareEffect } from 'react-use';
import DropDown from 'DropDown';
import { DoubleButtons } from 'Button';
import PointSelect from 'PointSelect';
import { uIdKey } from '../../components_utils/models';
import { IKeyInfoCfg, CacheConfig, CacheItem } from './index';
import styles from './style.mscss';

const msg = msgTag('pagetpl');
const nameKey = Intl.isZh ? 'name_cn' : 'name_en';
const nameKey2 = Intl.isZh ? 'name' : 'name_en';
const editNameKey = Intl.isZh ? 'nameCn' : 'nameEn';

interface ICompSet extends PopoverProps {
    children?: React.ReactNode;
    config: IKeyInfoCfg;
    cache: CacheConfig;
    onCancle?: () => void;
    onConfirmed?: (data: {}) => void;
}

const CompSet = (props: ICompSet) => {
    const { children, ...restProps } = props;
    const [visible, setVisible] = useState(false);

    return <Popover 
		overlayClassName= {styles.keyinfoSet}
		autoAdjustOverflow = {true}
		arrowPointAtCenter = {true}
		destroyTooltipOnHide = {true}
        overlayStyle={{minHeight: 250, width: 350}}
        placement={'bottomRight'}
        trigger={'click'}
		content={<CompSetContent
            {...restProps}
            onCancle={() => {setVisible(false)}} 
            onConfirmed={(info) => {
                typeof props.onConfirmed === 'function' && props.onConfirmed(info);
                setVisible(false);
            }}
        />}
        visible={visible}
        onVisibleChange={(v) => setVisible(v)}
	>{children}</Popover>
}

export default React.memo(CompSet, (prev, next) => {
    const same = _.isEqual(prev.config, next.config) && _.isEqual(prev.cache, next.cache);
    return same;
});

const CompSetContent = (props: ICompSet) => {
    const { config, cache } = props;
    const statusPoints = config.statusInfo.selectedObject?.selectedPoint || [];
    const statusCache = cache.statusInfo;
    const paramPoints = config.parameterInfo.selectedObject?.selectedPoint || [];
    const paramCache = cache.parameterInfo;
    const operateInfo = config.operateInfo;
    const operateCache = cache.operateInfo;

    let operateList = ['useToken', 'useStart', 'useStop', 'useReset']
        .filter(key => {
            // 非风机无复位
            return key === 'useReset' ? operateInfo.isWtg && operateInfo[key] : operateInfo[key];
        })
        .map(key => ({
            key,
            id: key,
            value: key,
            title: msg(`KEY_INFO.${key}`)
        }));

    const operateListWithCustomize = operateList.concat((operateInfo.customize || []).map(item => ({
        key: item.key,
        id: item.key,
        value: item.key,
        title: item[nameKey2]
    })));

    const [newStatusCache, setNewStatusCache] = useState<CacheItem[]>([]);
    const [newParamCache, setNewParamCache] = useState<CacheItem[]>([]);
    const [newOperateCache, setNewOperateCache] = useState<CacheConfig["operateInfo"]>({});

    useEffect(() => {
        setNewStatusCache(JSON.parse(JSON.stringify(statusCache)));
        setNewParamCache(JSON.parse(JSON.stringify(paramCache)));
        setNewOperateCache(JSON.parse(JSON.stringify(operateCache)));
    }, []);

    useDeepCompareEffect(() => {
        setNewStatusCache(JSON.parse(JSON.stringify(statusCache)));
    }, [statusCache]);

    useDeepCompareEffect(() => {
        setNewParamCache(JSON.parse(JSON.stringify(paramCache)));
    }, [paramCache]);

    useDeepCompareEffect(() => {
        setNewOperateCache(JSON.parse(JSON.stringify(operateCache)));
    }, [operateCache]);

    const operateListSelected = operateListWithCustomize.filter(p => newOperateCache[p.key]);

    return <div>
        <div className={styles.setHeader}>
            <span>{msg('KEY_INFO.set')}</span>
        </div>
        <div style={{
            height: window.innerHeight - 250,
            margin: '10px 0',
            overflow: 'auto'
        }}>
            {
                Array.isArray(statusPoints) && statusPoints.length > 0 &&
                <div>
                    <div>{msg('KEY_INFO.status')}</div>
                    <PointSelect 
                        limitNum={1} 
                        selectedData={newStatusCache.map((p) => {
                            const isMeasure = (p.key.startsWith('62') || p.key.startsWith('35'));
                            const isNoMeasure = p.key.startsWith('61');
                            const statusPoint = statusPoints.find(f => f[uIdKey] === p.key);
                            const consts = statusPoint?.const_name_list || [];
                            
                            let condition: any[] =  [];
                            if(isMeasure){
                                condition.push({
                                    name: msg('KEY_INFO.style'),
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
                                condition.push({
                                    members: [{
                                        component: 'custom',
                                        customRender: <PointSelect 
                                            limitNum={-1} 
                                            selectedData = {consts.map(c => {
                                                return {
                                                    title: c[nameKey2],
                                                    key: c.value,
                                                    dropDownContent: <DropDown 
                                                        data={(p.attrs?.valueMap || {})[c.value] || {}}
                                                        content = {[{
                                                            name: msg('KEY_INFO.style'),
                                                            members: [{
                                                                component: 'icon',
                                                                key: 'icon',
                                                            },{
                                                                component: 'colorPick',
                                                                key: 'background',
                                                            }]
                                                        }]}
                                                        onChange = {(args) => {
                                                            setNewStatusCache((old) => {
                                                                const statusPoint = old.find(status => status.key === p.key);
                                                                if(statusPoint){
                                                                    /**@ts-ignore */
                                                                    statusPoint.attrs = statusPoint.attrs || {};
                                                                    /**@ts-ignore */
                                                                    statusPoint.attrs.valueMap = statusPoint.attrs.valueMap || {};
                                                                    /**@ts-ignore */
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
                                                    title: c[nameKey2],
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
                                            dropDownStyle = {{width: "100%"}}
                                        />
                                    }]
                                });
                            }

                            return {
                                title: statusPoint?.[nameKey],
                                key: p.key,
                                dropDownContent: <DropDown 
                                    data={p.attrs || {}}
                                    content = {[{
                                        name: msg('KEY_INFO.showName'),
                                        members: [{
                                            component: 'input',
                                            key: editNameKey
                                        }]
                                    }].concat(condition)}
                                    onChange = {(args) => {
                                        setNewStatusCache((old) => {
                                            const cur = old.find(o => o.key === p.key);
                                            if(cur){
                                                cur.attrs = Object.assign({}, cur.attrs, args);
                                            }
                                            return Object.assign([], old);
                                        });
                                    }}
                                />
                            }
                        })}
                        options={statusPoints.map((p) => {
                            return {
                                id: p[uIdKey],
                                key: p[uIdKey],
                                title: p[nameKey],
                                value: p[uIdKey],
                                needLabelShow: true
                            }
                        })}
                        onChange = {(args) => {
                            setNewStatusCache((old) => {
                                let temp = {};
                                old.map(status => {
                                    temp[status.key] = status;
                                });
                                let updatedCache: any[] = [];
                                (args || []).map(option => {
                                    const cache = temp[option.key];
                                    if(cache){
                                        updatedCache.push(JSON.parse(JSON.stringify(cache)));
                                    }else{
                                        updatedCache.push(JSON.parse(JSON.stringify(option)));
                                    }
                                });
                                return updatedCache;
                            });
                        }}
                        needDelete = {true}
                        needSelect = {true}
                        treeProps = {{
                            treeDefaultExpandAll: true,
                            style: {width: '100%'}
                        }}
                        dropDownStyle = {{width: "100%"}}
                    />
                </div>
            }            
            {
                Array.isArray(paramPoints) && paramPoints.length > 0 &&
                <div>
                    <div>{msg('KEY_INFO.parameter')}</div>
                    <PointSelect 
                        limitNum={3} 
                        selectedData={newParamCache.map((p) => {
                            const paramPoint = paramPoints.find(f => f[uIdKey] === p.key) || {};
                            const condition = (p.key.startsWith('62') || p.key.startsWith('35')) ? [{
                                members: [{
                                    component: 'condition',
                                    type: 'convert',
                                    key: 'convert',
                                }]
                            }] : [];
                            return {
                                title: paramPoint[nameKey],
                                key: p.key,
                                dropDownContent: <DropDown 
                                    data={p.attrs || {}}
                                    content = {[{
                                        name: msg('KEY_INFO.showName'),
                                        members: [{
                                            component: 'input',
                                            key: editNameKey
                                        }]
                                    },{
                                        name: msg('KEY_INFO.style'),
                                        members: [{
                                            component: 'icon',
                                            key: 'icon',
                                        },{
                                            component: 'colorPick',
                                            key: 'background',
                                        }]
                                    }].concat(condition)}
                                    onChange = {(args) => {
                                        setNewParamCache((old) => {
                                            const cur = old.find(o => o.key === p.key);
                                            if(cur){
                                                cur.attrs = Object.assign({}, cur.attrs, args);
                                            }
                                            return Object.assign([], old);
                                        });
                                    }}
                                />
                            }
                        })}
                        options={paramPoints.map((p) => {
                            return {
                                id: p[uIdKey],
                                key: p[uIdKey],
                                title: p[nameKey],
                                value: p[uIdKey],
                                needLabelShow: true
                            }
                        })}
                        onChange = {(args) => {                        
                            setNewParamCache((old) => {
                                let temp = {};
                                old.map(param => {
                                    temp[param.key] = param;
                                });
                                let updatedCache: any[] = [];
                                (args || []).map(option => {
                                    const cache = temp[option.key];
                                    if(cache){
                                        updatedCache.push(JSON.parse(JSON.stringify(cache)));
                                    }else{
                                        updatedCache.push(JSON.parse(JSON.stringify(option)));
                                    }
                                });
                                return updatedCache;
                            });
                        }}
                        needDelete = {true}
                        needSelect = {true}
                        treeProps = {{
                            treeDefaultExpandAll: true,
                            style: {width: '100%'}
                        }}
                        dropDownStyle = {{width: "100%"}}
                    />
                </div>
            }            
            {
                Array.isArray(operateListWithCustomize) && operateListWithCustomize.length > 0 && 
                <div>
                    <div>{msg('KEY_INFO.operate')}</div>
                    <PointSelect 
                        limitNum={-1} 
                        selectedData={operateListSelected.map((p) => {
                            return {
                                title: p.title,
                                key: p.key
                            }
                        })}
                        options={operateListWithCustomize.map((p) => {
                            return {
                                id: p.key,
                                key: p.key,
                                title: p.title,
                                value: p.key,
                                needLabelShow: true
                            }
                        })}
                        onChange = {(args) => {
                            const ope = {};
                            args.map(o => {
                                ope[o.key] = true;
                            });
                            setNewOperateCache(ope);
                        }}
                        needList={false}
                        needDelete = {true}
                        needSelect = {true}
                        treeProps = {{
                            treeDefaultExpandAll: true,
                            style: {width: '100%'}
                        }}
                        dropDownStyle = {{width: "100%"}}
                    />
                </div>
            }            
        </div>
        <DoubleButtons 
            onCancle={() => {props.onCancle && props.onCancle()}}
            onConfirmed={() => {
                props.onConfirmed && props.onConfirmed(JSON.parse(JSON.stringify({
                    statusInfo: newStatusCache,
                    parameterInfo: newParamCache,
                    operateInfo: newOperateCache
                })));
            }}
        />
    </div>
}