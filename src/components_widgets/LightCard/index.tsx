import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { Observer } from 'mobx-react';
import PageCard from '../../components_utils/Card'
import DynData from 'DynData';
import { _dao, daoIsOk } from '@/common/dao';
import { useRecursiveTimeoutEffect } from '@/components/ReactHooks';
import {LightCardTimerInterval} from '@/common/const-scada';
import {CustomMenuData} from '@/common/util-scada';
import {POINT_TABLE, POINT_FIELD} from '@/common/constants';
import {LIGHT_CARD_OPTIONS, msg} from './constant';
import { StyledModal as Modal } from 'Modal';
import { FontIcon, IconType } from 'Icon';
import styles from './style.mscss';
import { notify } from "Notify";
import { Col, Collapse, Divider, Row, Select, Space, Switch, Tag } from "antd";
import { DefaultButton, PrimaryButton } from "Button";
import { useMemoryStateCallback } from "@/common/util-memory";
import { ReactSortable } from "react-sortablejs";
import { getAssetAlias } from "@/common/utils";

const {Panel} = Collapse

export {default as LightCardForm} from './form';

export const LightCardDefaultOptions = {

}

export interface ILightCardCfg {
    customAssetAlias?: string;
    title?: string;
    title_en?: string,
    lightCardProps: {
        type: string,
        group: Array<string>,
        alarmGrade: string,
        yxValue: string,
        characterFilter: boolean,
        sortType: string,
        cardWidth?: number,
        cardHeight?: number
    }
}

export const getDefaultProps = (type = LIGHT_CARD_OPTIONS[0].value): ILightCardCfg['lightCardProps'] => {
    switch(type){
        // case 'deviceLightCard':
        default:
            return {
                type: 'deviceLightCard',
                group: [],
                alarmGrade: '',
                yxValue: '',
                characterFilter: false,
                sortType: '',
            }
    }
}

// 组件注册时默认属性, 组件渲染使用, 表单里动态配置项
export const LightCardDefaultCfg: ILightCardCfg = {
    lightCardProps: getDefaultProps()
};

const isDev: boolean = process.env.NODE_ENV === 'development';

const reorder = (sortType, p, n) => {
    switch(sortType){
        case 'no_asc':
            return (!isNaN(p.no) && !isNaN(n.no) ? Number(p.no) - Number(n.no) : 0);
        case 'no_desc':
            return (!isNaN(p.no) && !isNaN(n.no) ? Number(n.no) - Number(p.no) : 0);
        case 'name_asc':
            return (typeof p.name === 'string' && typeof n.name === 'string' ? (p.name < n.name ? -1 : 1) : 0);
        case 'name_desc':
            return (typeof p.name === 'string' && typeof n.name === 'string' ? (p.name > n.name ? -1 : 1) : 0);
        case 'node_no_asc':
            return ('node_no' in p && 'node_no' in n && !isNaN(p.node_no) && !isNaN(n.node_no) ? Number(p.node_no) - Number(n.node_no) : 0);
        case 'node_no_desc':
            return ('node_no' in p && 'node_no' in n && !isNaN(p.node_no) && !isNaN(n.node_no) ? Number(n.node_no) - Number(p.node_no) : 0);
        default:
            return 0;
    }
}

const reorderYXData = (sortType: string, p: ILightWordYXData, n: ILightWordYXData, levelArr: IWarnLevel[]) => {
    const pLevelIndex = levelArr.findIndex(l => l.value === p.warnlevel)
    const nLevelIndex = levelArr.findIndex(l => l.value === n.warnlevel)
    if(pLevelIndex === nLevelIndex){ // 无置顶 | 置顶优先级相同
        switch(sortType){
            case 'no_asc':
                return (!isNaN(p.no) && !isNaN(n.no) ? Number(p.no) - Number(n.no) : 0);
            case 'no_desc':
                return (!isNaN(p.no) && !isNaN(n.no) ? Number(n.no) - Number(p.no) : 0);
            case 'name_asc':
                return (typeof p.name === 'string' && typeof n.name === 'string' ? (p.name < n.name ? -1 : 1) : 0);
            case 'name_desc':
                return (typeof p.name === 'string' && typeof n.name === 'string' ? (p.name > n.name ? -1 : 1) : 0);
            default:
                return 0;
        }
    }else{ // 有置顶且优先级不同
        if(pLevelIndex === -1) return 1
        if(nLevelIndex === -1) return -1
        return pLevelIndex - nLevelIndex
    }
}

const confirm = (list: string[], callback?: () => void) => {
    let aliasList = list.map((alias) => {
        return !alias ? '' : '1:61:' + alias + ':10';
    })

    _dao.confirmSignal({
        alias: aliasList
    }).then((res) => {
        if(daoIsOk(res)){
            notify(res.message ? msg('LIGHT_CARD.successSome') : msg('LIGHT_CARD.success'));
        }else{
            notify(msg('LIGHT_CARD.fail'));
        }
    }).finally(() => {
        callback && callback();
    })
}

enum ConfirmMenuType {
    clear, update
}
const handlePopMenu = (event: MouseEvent, menus: ConfirmMenuType[], opt: {
    aliasList?: string[]
    onClear?: () => void
    onConfirm?: () => void
} = {}) => {
    const {aliasList, onClear, onConfirm} = opt
    const {clientX, clientY} = event;
    const container = document.createElement('div');
    container.className = styles.confirm;
    container.style.top = `${clientY}px`;
    container.style.left = `${clientX}px`;

    menus.forEach(m => {
        switch(m){
            case ConfirmMenuType.clear: {
                const item = document.createElement('div')
                item.innerHTML = msg('LIGHT_CARD.clearAll');
                container.appendChild(item)
                if(onClear){
                    item.onclick = onClear
                }
                break
            }
            default: {
                const item = document.createElement('div')
                item.innerHTML = msg('LIGHT_CARD.dwAll')
                if(aliasList){
                    item.onclick = () => {confirm(aliasList, onConfirm)};
                }
                container.appendChild(item)
            }
        }
    })
    
    document.body.appendChild(container);
    return container;
}

const LightCardItem = ({
    item,
    itemStyle,
    valChanged,
    onClear,
    onUpdate
}:{
    item: ILightWordYXData,
    itemStyle: CSSProperties,
    valChanged: boolean,
    onClear: (alias: string) => void,
    onUpdate: (alias: string) => void
}) => {
    const {bg, color, name, alias, val, val_desc, flash: needUpdate, freq} = item;
    const [isVisitable, setIsVisitable] = useState(true);
    const flash = valChanged || needUpdate
    const visitable = useRef(true);
    const flashTime = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            flashTime.current !== null && window.clearTimeout(flashTime.current);
        }
    }, [])

    useEffect(() => {
        setIsVisitable(true);
        
        const fn = () => {
            setIsVisitable(!visitable.current);
            visitable.current = !visitable.current;
            flashTime.current !== null && window.clearTimeout(flashTime.current);
            flashTime.current = window.setTimeout(fn, freq);
        }

        flashTime.current !== null && window.clearTimeout(flashTime.current);
        flash && fn();

        return () => {
            flashTime.current !== null && window.clearTimeout(flashTime.current);
        }

    }, [flash, freq])


    const customMenuData: CustomMenuData[] = []
    if(needUpdate){
        customMenuData.push({
            name: msg('LIGHT_CARD.dw'), 
            click: (pointAliasOrKey, menuInfo) => {onUpdate(alias)}
        })
    }
    if(valChanged){
        customMenuData.push({
            name: msg('LIGHT_CARD.clear'),
            click: () => onClear(item.alias)
        })
    }

    return <div 
        key={alias}  
        style = {itemStyle}
    >
        <DynData 
            wrapperCls={styles.card}
            containerCls={styles.common}
            nameContainerCls={styles.name}
            nameStyle={{whiteSpace: 'normal'}}
            containerStyle={{
                background: bg,
                color: color,
                visibility: isVisitable ? 'visible' : 'hidden'
            }}
            eventRaised={true}
            showName={true}
            showUnit={false}
            showValue={false}
            tipShowValue={val_desc ? true : false}
            point={{
                nameCn: name,
                nameEn: name,
                aliasKey: alias,
                tableNo: POINT_TABLE.YX,
                fieldNo: POINT_FIELD.VALUE
            }}
            value={{display_value: val_desc}}
            transform={{
                convert: {
                    decimal: 0
                }
            }}
            tipTrigger={'hover'}
            customMenuData = {customMenuData}
        />
    </div>
}
export type LightCardCfgMemory = {
    enableChangeFlash: boolean
    enableHideReset: boolean
    topLevelArr: IWarnLevel[]
}

export const defaultLightCardCfg: LightCardCfgMemory = {
    enableChangeFlash: false,
    enableHideReset: false,
    topLevelArr: []
}

const getRandomId = () => (Math.random() * (10 ** 6)).toFixed(0) + 'randomId'

const LightCardCfgModal:React.FC<{
    originCfg: LightCardCfgMemory
    onCancel: () => void
    onConfirm: (newCfg: LightCardCfgMemory) => void
}> = ({originCfg, onCancel, onConfirm}) => {
    const [enableChangeFlash,setEnableFlash] = useState<boolean>(originCfg.enableChangeFlash)
    const [enableHideReset,setEnableHideReset] = useState<boolean>(originCfg.enableHideReset)
    const [topLevelArr,setTopLevelArr] = useState<IWarnLevel[]>(originCfg.topLevelArr)
    const [allLevel, setAllLevel] = useState<IWarnLevel[]>([])

    useEffect(() => {
        _dao.getAlarmLevel()
        .then(res => {
            if(daoIsOk(res)){
                const data = res.data as IWarnLevel[]
                setAllLevel(data)
            }
        })
        .catch(e => {
            console.error('fetch alarm level error',e);
        })
    }, [])

    return <Modal
        title={msg('LIGHT_CARD.config')}
        destroyOnClose={true}
        centered={true}
        visible={true}
        width={300}
        closable={false}
        onCancel={onCancel}
        footer={<div className={styles.modal__footer}>
            <DefaultButton onClick={onCancel}>{msg('LIGHT_CARD.cancel')}</DefaultButton>
            <PrimaryButton onClick={() => {
                onConfirm({
                    enableChangeFlash: enableChangeFlash,
                    enableHideReset: enableHideReset,
                    topLevelArr: topLevelArr
                })
            }}>{msg('LIGHT_CARD.save')}</PrimaryButton>
        </div>}>
        <Space className={styles.modal__body} direction='vertical' style={{width: '100%'}} size='middle'>
            <div className={styles.btns}>
                <div>
                    <Space>
                        {msg('LIGHT_CARD.flash')}
                        <Switch checked={enableChangeFlash} onChange={(v) => setEnableFlash(v)} />
                    </Space>
                </div>
                <div>
                    <Space>
                        {msg('LIGHT_CARD.hideReset')}
                        <Switch checked={enableHideReset} onChange={(v) => setEnableHideReset(v)} />
                    </Space>
                </div>
            </div>
            <Space direction="vertical" size={'small'} style={{width:'100%'}}>
                <div className={styles.level_label}>
                    {msg('LIGHT_CARD.topLevel')}
                </div>
                <Select className={styles.select} mode='multiple' 
                value={topLevelArr.map(l => l.value)}
                onChange={(values) => {
                    const newArr = values.map(v => allLevel.find(l => l.value === v)).filter(o => o) as IWarnLevel[]
                    setTopLevelArr(newArr)
                }}
                tagRender={({label, value, closable, onClose}) => {
                    return <Tag color='#517775' closable={closable} onClose={onClose}>
                        {label}
                    </Tag>
                }}>
                    {allLevel.map(l => <Select.Option key={l.value} value={l.value}>{l.name}</Select.Option>)}
                </Select>
                <ReactSortable list={topLevelArr} setList={setTopLevelArr}>
                    {topLevelArr.map(l => <div className={styles.item} key={l.value}>
                        <FontIcon type={IconType.DRAG}/>
                        {l.name}
                    </div>)}
                </ReactSortable>
            </Space>
        </Space>
    </Modal>
}

export function LightCard(props: Omit<WidgetProps, 'configure'> & {configure: ILightCardCfg}) {
    const { assetAlias = '', configure, scale, isDemo, id = getRandomId(), pageId=getRandomId() } = props;
    const { customAssetAlias, title, title_en, lightCardProps } = configure;
    const {cardHeight, cardWidth} = lightCardProps;

    const finalAssetAlias = getAssetAlias(assetAlias, customAssetAlias);
    
    const [cfgMemory, setMemory] = useMemoryStateCallback<LightCardCfgMemory>(defaultLightCardCfg, pageId, id)
    const [cardData, setCardData] = useState<ILightWordYXData[]>([]);
    const [assetNameSet, setAssetNameSet] = useState({});
    const [refreshFlag, setRefreshFlag] = useState(1);
    const [showCfg, setShowCfg] = useState(false)
    const containerRef = useRef(null);
    const menu = useRef<HTMLDivElement>();

    const preDataValueMap = useRef<{[key:string]: number}>({}) // key: alias
    const [changed, setChanged] = useState<string[]>([]) // alias
    useEffect(() => {
        if(cfgMemory.enableChangeFlash){
            const newChanged:string[] = Array.from(changed)
            cardData.forEach((data) => {
                if(preDataValueMap.current[data.alias] !== undefined && data.val !== preDataValueMap.current[data.alias]){
                    newChanged.push(data.alias)
                }
            })
            preDataValueMap.current = cardData.reduce((p,c) => ({...p, [c.alias]: c.val}), {})
            setChanged(newChanged)
        }else{
            preDataValueMap.current = {}
            setChanged([])
        }
    }, [cfgMemory.enableChangeFlash, cardData])

    const flashAliasList = cardData.filter(d => d.flash).map(d => d.alias);

    const removeMenu = () => {
        window.setTimeout(
            () => {
                menu.current && menu.current.remove()
            },
            300
        ) 
    }

    if(!isDemo){
        useEffect(() => {
            return () => {
                window.removeEventListener('mousedown', removeMenu)
            }
        }, [])

        useEffect(() => {
            let assetAliasStr = finalAssetAlias;
            // 名称不规则, 同时获取间隔名称, 设备名匹配不上则用间隔的
            if(finalAssetAlias.split('.').length > 3){
                assetAliasStr = assetAliasStr + ',' + finalAssetAlias.split('.').slice(0, 3).join('.')
            }
            _dao.getInfoByAlias(assetAliasStr, 'disp_name').then(res => {
                if (daoIsOk(res) && res.data) {
                    const nameMap = res.data.reduce((p, c) => {
                        if (c) {
                            return {
                                ...p,
                                [c.alias]: c.disp_name
                            }
                        }
                        return p
                    }, {} as { [key: string]: string })
                    setAssetNameSet(nameMap)
                }
            })
        }, [finalAssetAlias])

        useRecursiveTimeoutEffect(
            () => {
                let {type, group, alarmGrade, yxValue, characterFilter, sortType} = lightCardProps;
                return [
                    () => {
                        return _dao.lightWords('', {
                            key: finalAssetAlias,
                            group: group.join(','),
                            valfilter: yxValue,
                            warnlevel: alarmGrade,
                            newMode: true
                        });
                    }, 
                    (res) => {
                        let tempData: ILightWordDataGroup<ILightWordYXData>['data'] = [];
                        if(daoIsOk(res)){
                            (res.data as ILightWord<ILightWordYXData>[]).map(d => {
                                let {name} = d;
                                d.data.map(dd => {
                                    dd.data.map(ddd => {
                                        let isRepeat = tempData.find(tempD => {
                                            return tempD.alias === ddd.alias;
                                        });

                                        if(!isRepeat && characterFilter){
                                            let assetName = assetNameSet[d.alias] || name;
                                            const bayAliasName = assetNameSet[d.alias.split('.').slice(0, 3).join('.')];

                                            ddd.name = (ddd.name || '').trim();

                                            if(!ddd.name.startsWith(assetName)){
                                                assetName = bayAliasName;
                                            }

                                            if(assetName){
                                                let reg = new RegExp('^' + (assetName || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                                                ddd.name = ddd.name.replace(reg, '').trim();
                                            }
                                        }
                                        
                                        if(!isRepeat) {
                                            tempData.push(ddd);
                                        }
                                    })
                                })
                            })
                        }
                        tempData.sort(function(p, n){
                            return reorderYXData(sortType, p, n, cfgMemory.topLevelArr);
                        });
                        setCardData(tempData);
                    }
                ];
            }, 
            LightCardTimerInterval, 
            [refreshFlag, assetNameSet, finalAssetAlias, cfgMemory.enableHideReset, cfgMemory.topLevelArr]
        );

        useEffect(() => {
            // 容器外部点击菜单清除
            window.addEventListener('mousedown', removeMenu);

            return () => {
                window.removeEventListener('mousedown', removeMenu)
            }

        }, [finalAssetAlias])
    }

    const refresh = () => {
        // 实时库延时
        setTimeout(() => {
            setRefreshFlag(refreshFlag + 1);
        }, 500)
    }

    return <Observer>{() => {
        return <PageCard {...configure} title = {title} title_en = {title_en} 
            extra={<button className={styles.btn}>
                <FontIcon type={IconType.CONFIG} onClick={e => setShowCfg(true)} />
            </button>}>
            <div
                className={styles.lightPlate} 
                style = {{
                    gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth || 150}px, 1fr))`,
                    gridTemplateRows: `repeat(auto-fill, ${cardHeight || 34}px)`
                }} 
                ref = {containerRef}
                onClick = {(e) => {
                    if(flashAliasList.length > 0 || changed.length > 0 ){
                        const menus:ConfirmMenuType[] = []
                        flashAliasList.length > 0 && menus.push(ConfirmMenuType.update)
                        changed.length > 0 && menus.push(ConfirmMenuType.clear)
                        menu.current = handlePopMenu(e.nativeEvent, menus,
                            {
                                aliasList: flashAliasList,
                                onClear: () => setChanged([]),
                                onConfirm: () => refresh()
                            }
                        )
                    }
                }}
                onMouseDown = {(e) => {e.stopPropagation(); menu.current && menu.current.remove()}}
            >
                {cardData.map((o) => {
                    if((!cfgMemory.enableHideReset || o.val !== 0)){ // 复归隐藏
                        return <LightCardItem 
                            key={o.alias}
                            item={o} 
                            itemStyle = {{height: `${cardHeight || 34}px`}}
                            valChanged = {changed.includes(o.alias)}
                            onClear = {alias => setChanged(changed.filter(a => a !== alias))}
                            onUpdate = {alias => confirm([alias], refresh)}
                        />
                    }
                })}
            </div>
            {showCfg && <LightCardCfgModal originCfg={cfgMemory} 
                onCancel={() => setShowCfg(false)} 
                onConfirm={(newCfg) => {
                    setMemory(newCfg)
                    setShowCfg(false)
                }}
            />}
        </PageCard>
    }}</Observer>
}

