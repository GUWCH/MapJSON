import * as React from 'react';
import { Tooltip, TooltipProps } from 'antd';
import hexToRgba from 'hex-to-rgba';
import { FontIcon, IconType, PureIcon } from 'Icon';
import { NumberUtil, BStools } from '@/common/utils';
import { autoComma, PointEvt, CustomMenuData } from '@/common/util-scada';
import Intl from '@/common/lang';
import { VALUES } from '@/common/constants';

import styles from './style.mscss';

const text = {
    cn: {
        name: '名称',
        alias: '别名',
        value: '值',
        tip: '(点击添加分析对象)'
    },
    en: {
        name: 'Name',
        alias: 'Alias',
        value: 'Value',
        tip: '(Click to Analysis)'
    }
}[Intl.locale];

export type ICommonDynDataProps = {
    wrapperCls?: string;
    /** wrapper样式 */
    wrapperStyle?: React.CSSProperties;
    /** 根据定义显示不同布局方式 */
    layout?: CommonDynLayout;
    /** 整个容器className */
    containerCls?: string;
    /** 整个容器样式 */
    containerStyle?: React.CSSProperties;
    /** 显示名称 */
    showName?: boolean;
    /** 名称后面是否需要冒号 */
    nameColon?: boolean;
    /** 名称容器className */
    nameContainerCls?: string;
    /** 名称className */
    nameCls?: string;
    /** 名称样式 */
    nameStyle?: React.CSSProperties;
    /** 是否显示单位, 默认显示在数据后方 */
    showUnit?: boolean;
    /** 单位放在名称后方 */
    unitAfterName?: boolean;
    /**unitAfterName=false使能 */
    unitCls?: string;
    /**unitAfterName=false使能 */
    unitStyle?: React.CSSProperties;
    locale?: 'cn' | 'en',
    point: {
        aliasKey: string;
        tableNo: number | string;
        fieldNo: number | string;
        nameCn?: string;
        nameEn?: string;
        unit?: string;
        decimal?: number | string;
    };
    /** 显示数据 */
    showValue?: boolean;
    /** 数据 */
    value?: Partial<IDyn> | string | number;
    /** 数据className */
    valueCls?: string;
    /** 数据容器className */
    valueContainerCls?: string;
    /** 数据容器style */
    valueContainerStyle?: React.CSSProperties;
    /** 
     * @deprecated 动态字均取display_value不需额外指定值
     */ 
    valuePropName?: keyof IDyn;
    /** 数据默认颜色, 优先级最低 */
    valueDefaultColor?: string;
    /** 数据最终背景, 优先级最高 */
    valueBackground?: string;
    /** 数据最终颜色, 优先级最高 */
    valueColor?: string;
    valuePattern?: CommonDynPattern;
    transform?: {
        nameCn?: string | null;
        nameEn?: string | null;
        /** 左侧的圆形点背景色, icon存在会居中显示 */
        background?: string;
        /** 左侧的图标 */
        icon?: keyof typeof IconType;
        /** 左侧的图标置于值左侧, 当showName=true时可以保证图标在值的左侧 */
        iconLeftValue?: boolean;
        /** 针对模拟量值的显示映射, key对应的是各个模拟量值, 优先于外侧的icon, background, 与conditions/convert是互斥的 */
        valueMap?: {
            [key: string]: {
                /** 值颜色, 高于valueDefaultColor, 低于valueColor */
                color?: string;
                /** 值图标, 如果需要显示在值左侧, 根据情况将iconLeftValue设为true */
                icon?: keyof typeof IconType;
                /** 值图标颜色 */
                iconColor?: string;
                /** 值图标背景或圆点背景 */
                background?: string;
            }
        },
        /** 针对测量值的条件过滤 */
        conditions?: {
            min: number | string;
            max: number | string;
            /** 条件配置的颜色, 高于valueDefaultColor, 低于valueColor */
            color: string;
        }[] | null,
        /** 针对测量值的数据转换 */
        convert?: {
            coefficient?: string | number;
            unit?: string;
            decimal?: number | string | null;
        } | null
    };
    /** Tooltip位置定义 */
    placement?: TooltipProps['placement'];
    /** Tooltip触发方式 */
    tipTrigger?: TooltipProps['trigger'];
    /** Tooltip里是否显示数据 */
    tipShowValue?: boolean;
    /**
     * 关闭点击功能
     */
    disableClick?: boolean;
    /** 点击生成的菜单里可以添加自定义菜单 */
    customMenuData?: Array<CustomMenuData>;
    /**
     * 光字牌闪烁, 事件需要置顶
     */
    eventRaised?: boolean;
    /**浮动窗口里点击生成菜单时需要保持浮动窗情况使用 */
    eventWrap?: boolean;
};

const isEmpty = (x) => {
    return x === null || x === '' || typeof x === 'undefined';
}

/**布局定义 */
export enum CommonDynLayout {
    /**左颜色图标, 右上值, 右下名称 */
    LAYOUT1='left_top_bottom',
    /**水滴 */
    LAYOUT2='water_droplet',
    /**进度条 */
    LAYOUT3='progress_bar',
}

/**值显示的样式 */
export enum CommonDynPattern {
    DEFAULT='default',
    BAR='bar'
}

const isDebug = BStools.getQueryStringEnhance('debug') === '1';

const commonDynDataDefaultProps: Omit<ICommonDynDataProps, 'point'> = {
    showName: true,
    showUnit: true,
    showValue: true,
    locale: 'cn',
    // point: {},
    transform: {
        convert: {}
    }
}

class CommonDynData extends React.PureComponent<ICommonDynDataProps> {

    static defaultProps = commonDynDataDefaultProps;

    state: {
        outerMenu: Node | null
    } = {
        outerMenu: null
    }

    render(){
        const {
            wrapperCls,
            wrapperStyle={},
            layout,
            containerCls,
            containerStyle={},
            showName,
            nameColon,
            nameContainerCls='',
            nameCls='',
            nameStyle={},
            showUnit,
            unitAfterName,
            unitCls='',
            unitStyle={},
            showValue,
            point: {
                nameCn: rawNameCn,
                nameEn: rawNameEn,
                unit: rawUnit,
                aliasKey='',
                tableNo='',
                fieldNo='',
                decimal: rawDecimal = 2
            }, 
            valueContainerCls='',
            valueContainerStyle={}, 
            valueCls='',
            value: dynValue, 
            valueDefaultColor='',
            valueBackground,
            valueColor, 
            valuePattern,
            transform: {
                nameCn,
                nameEn,
                background,
                icon,
                iconLeftValue,
                valueMap,
                conditions,
                convert={}
            } = {},
            placement,
            tipTrigger,
            tipShowValue=true,
            disableClick,
            customMenuData = [],
            eventRaised=false,
            eventWrap=false,
            ...restProps
        } = this.props;

        const {
            coefficient,
            unit,
            decimal
        } = convert || {};

        let isBitParse;
        let value, mapValue;
        if(typeof dynValue === 'object' && dynValue){
            value = dynValue.display_value || dynValue.raw_value || '';
            mapValue = dynValue.raw_value || '';
            isBitParse = dynValue.type === 'flag';
        }else{
            value = dynValue;
            mapValue = dynValue;
        }

        const keys = aliasKey.split(':');
        const keyStr = keys.length >= 3 ? keys[2] : (keys[0] || '');
        const fourKey = `1:${tableNo}:${keyStr}:${fieldNo}`;
        const convertValue = NumberUtil.format(value, coefficient, NumberUtil.isValidNumber(decimal) ? Number(decimal) : rawDecimal);
        const convertValueComma = NumberUtil.isValidNumber(convertValue) ? autoComma(convertValue, false) : convertValue;
        const convertName = (Intl.isZh ? nameCn || rawNameCn : nameEn || rawNameEn) || '';
        const convertUnit = unit || rawUnit;
        const showClickAlert = ['61', '62', '35'].indexOf(String(tableNo)) > -1 && !disableClick;
        
        // 值样式, 含条件样式, 非正常样式
        let valueFinalColor;
        if(Array.isArray(conditions) && NumberUtil.isValidNumber(convertValue)){
            for(let i = 0, lenght = conditions.length; i < lenght; i++){
                const { min, max, color } = conditions[i] || {};

                const isMatched = 
                    Number(!NumberUtil.isValidNumber(min) || Number(convertValue) >= Number(min)) & 
                    Number(!NumberUtil.isValidNumber(max) || Number(convertValue) <= Number(max));

                if(isMatched){
                    valueFinalColor = color;
                    break;
                }
            }
        }

        let valueMapItem;
        let newIcon = icon, newBackground = background, newIconColor;
        if(valueMap && valueMap[String(mapValue)]){
            valueMapItem = valueMap[String(mapValue)];
        }
        if(valueMapItem){
            if(valueMapItem.color) valueFinalColor = valueMapItem.color;
            if(valueMapItem.icon) newIcon = valueMapItem.icon;
            if(valueMapItem.background) newBackground = valueMapItem.background;
            if(valueMapItem.iconColor) newIconColor = valueMapItem.iconColor;
        }

        const valueStyle = Object.assign(
            {}, 
            valueDefaultColor ? {color: valueDefaultColor} : {},
            valueFinalColor ? {color: valueFinalColor} : {},
            valueBackground ? {background: valueBackground} : {},
            valueColor ? {color: valueColor} : {},
            disableClick ? {cursor: 'text'} : {}
        );

        const nameDom = ((newIcon || newBackground) && !iconLeftValue) || (showName && convertName) 
            ? <>
                {
                    ((newIcon || newBackground) && !iconLeftValue) && 
                    <IconColor icon = {newIcon} background={newBackground} color={newIconColor}/>
                }
                {
                    showName && convertName 
                    ? 
                        !showValue && !eventRaised
                        ? <RenderTooltip
                            trigger={tipTrigger}
                            placement={placement}
                            convertName={convertName}
                            convertValue={convertValueComma}
                            showValue={tipShowValue}
                            showAlert={showClickAlert}
                            convertUnit={convertUnit}
                            debugKey={isDebug ? fourKey : keyStr}
                        >
                            <div className={`${styles.dynItem} ${nameContainerCls}`}>
                            <span 
                                className={`${styles.name} ${nameCls||''}`} 
                                style={Object.assign({}, {cursor: 'pointer'}, nameStyle)}
                                onClick={(e) => {
                                    if(eventRaised) return;
                                    PointEvt.popMenu(fourKey, e.nativeEvent, customMenuData);
                                    e.stopPropagation();
                                    return false;
                                }}
                            >
                                {convertName}{showUnit && convertUnit && unitAfterName ? ` (${convertUnit})` : null}{nameColon ? ':' : ''}
                            </span>
                            </div>
                        </RenderTooltip>                            
                        : 
                        <div className={`${styles.dynItem} ${nameContainerCls}`} title={convertName}>
                            <span className={`${styles.name} ${nameCls||''}`} style={nameStyle}>
                                {convertName}{showUnit && convertUnit && unitAfterName ? ` (${convertUnit})` : null}{nameColon ? ':' : ''}
                            </span> 
                        </div>
                    : null
                }
            </> 
            : null;

        let valueDom: any = null;
        if(isBitParse){
            let values: string[] = [];
            let valueNames = typeof dynValue === 'object' ? dynValue.flag_name || [] : [];

            if(NumberUtil.isValidNumber(convertValue)){
                values = parseInt(String(convertValue)).toString(2).split('').reverse();
            }

            // 按位解析16位, 补位
            Array.from(Array(16 - values.length)).map(() => {
                values.push('0');
            });
            
            valueDom = <div style={{display: 'flex'}}>
                {Array.from(Array(16)).map((i, ind) => {
                    return <Tooltip
                        key={ind}
                        title={() => {
                            return <div>{valueNames[ind] || ''}</div>;
                        }} 
                        overlayClassName={styles.tip} 
                        overlayStyle={{maxWidth: 500}}
                        color={styles.tipColor}
                    >
                        <span key={ind} style={{
                            width: 10, 
                            height: 10, 
                            background: values[ind] === '0' ? 'green' : values[ind] === '1' ? 'red' : 'gray', 
                            borderRadius: 10, 
                            marginLeft: 5,
                            cursor: 'pointer'
                        }}></span>
                    </Tooltip>
                }).reverse()}
            </div>
        }else if(showValue){
            let valueNode = <span 
                className={`${styles.value} ${valueCls}`}
                onClick={disableClick ? undefined : (e) => {
                    if(eventRaised) return;
                    if(eventWrap){
                        PointEvt.popMenu(fourKey, e.nativeEvent, customMenuData, (node, dataLength) => {
                            if(dataLength){
                                this.setState({outerMenu: node});
                            }
                        });
                    }else{
                        PointEvt.popMenu(fourKey, e.nativeEvent, customMenuData);
                    }
                    
                    e.stopPropagation();
                    return false;
                }}
                style={valuePattern === CommonDynPattern.BAR ? {display: 'flex'} : valueStyle}
            >
                {
                    valuePattern === CommonDynPattern.BAR
                    ? <Progress 
                        value={convertValue}  
                        valueComma={(isEmpty(convertValueComma) ? VALUES.SLOT : convertValueComma)} 
                        name={convertName} 
                        unit={convertUnit}
                        // 优先使用无效的背景色, 其次是值颜色或默认色
                        color={valueStyle.background || valueStyle.color}
                    />
                    : (isEmpty(convertValueComma) ? VALUES.SLOT : convertValueComma)
                }
            </span>;

            valueDom = <RenderTooltip
                trigger={tipTrigger}
                placement={placement}
                convertName={convertName}
                convertValue={convertValueComma}
                showValue={tipShowValue}
                showAlert={showClickAlert}
                convertUnit={convertUnit}
                debugKey={isDebug ? fourKey : keyStr}
            >
                {
                    eventWrap 
                    ? <Tooltip 
                        key={'menu'}
                        overlayInnerStyle={{padding: 0, minHeight: 0}}
                        // @ts-ignore
                        showArrow={false}
                        placement={'rightTop'} 
                        visible={!!this.state.outerMenu }
                        overlay={this.state.outerMenu ? () => {
                            const menuNode = this.state.outerMenu;
                            if(menuNode){
                                // @ts-ignore
                                menuNode.style.position = 'static';
                                // @ts-ignore
                                menuNode.style.left = '';
                                // @ts-ignore
                                menuNode.style.top = '';
                                // @ts-ignore
                                menuNode.style.zIndex = '';
                                return <div ref={ ref => ref && ref.appendChild(menuNode) }/>
                            }
                        } : undefined}
                        destroyTooltipOnHide={{keepParent: false}}
                        onVisibleChange={(open) => {
                            if(!open){
                                this.setState({outerMenu: ''});
                            }
                        }}
                    >
                        {valueNode}
                    </Tooltip>
                    : valueNode
                }                
            </RenderTooltip>
        }

        const unitDom = showUnit && convertUnit && !unitAfterName 
        ? <span className={`${styles.unit} ${unitCls||''}`} style={unitStyle}>
            {convertUnit}
        </span>
        : null;

        let beforeVirtualDom: null | JSX.Element = null;
        let afterVirtualDom: null | JSX.Element = null;

        let dynLayoutCls = '';
        let dynLayoutNoIconCls = '';
        switch(layout){
            case CommonDynLayout.LAYOUT1:
                dynLayoutCls = styles.leftTopBottom;
                if(!newIcon && !newBackground){
                    dynLayoutNoIconCls = styles.leftTopBottomNoIcon;
                }
                break;
            case CommonDynLayout.LAYOUT2:
                dynLayoutCls = styles.waterDroplet;
                const virtualStyle = {
                    backgroundColor: valueContainerStyle.borderColor
                };
                beforeVirtualDom = <div className={styles.beforeVirtual} style={virtualStyle}/>;
                afterVirtualDom = <div className={styles.afterVirtual} style={virtualStyle}/>;
                break;

            case CommonDynLayout.LAYOUT3:
                dynLayoutCls = styles.processBar;
                break;

        }

        // 双层容器为了闪烁时事件提升
        const dynContent = <div
            key={fourKey}
            className={`${styles.dynWrap} ${wrapperCls||''}`} 
            style={Object.assign(eventRaised ? {cursor: 'pointer'} : {}, wrapperStyle)}
            onClick={(e) => {
                if(!eventRaised) return;
                PointEvt.popMenu(fourKey, e.nativeEvent, customMenuData);
                e.stopPropagation();
                return false;
            }}
        >
            <div 
                className={`${styles.dyn} ${dynLayoutCls} ${dynLayoutNoIconCls} ${containerCls||''}`} 
                style={containerStyle}
            >
                {nameDom}
                {(valueDom || unitDom) && 
                <div 
                    className={`${styles.dynItem} ${valueContainerCls}`} 
                    style = {valueContainerStyle}
                >
                    {beforeVirtualDom}
                    {
                        ((newIcon || newBackground) && iconLeftValue) && 
                        <IconColor icon = {newIcon} background={newBackground} color={newIconColor}/>
                    }
                    {valueDom}
                    {valuePattern === CommonDynPattern.BAR ? null : unitDom}
                    {afterVirtualDom}
                </div>}
            </div>
        </div>

        return eventRaised ? <RenderTooltip
            trigger={tipTrigger}
            placement={placement}
            convertName={convertName}
            convertValue={convertValueComma}
            showValue={tipShowValue}
            showAlert={showClickAlert}
            convertUnit={convertUnit}
            debugKey={isDebug ? fourKey : keyStr}
        >{dynContent}</RenderTooltip> : dynContent;
    }
}

export const TooltipTitle = (props) => {
    const {convertName,convertUnit,debugKey,showValue,convertValue,showAlert} = props
    return  <div>
        <div>
            <span style={{marginRight: 10}}>{text?.name}:</span>
            {convertName}
            {convertUnit ? <span>{`(${convertUnit})`}</span>: null}
        </div>
        <div>
            <span style={{marginRight: 10}}>{text?.alias}:</span>
            <span>{debugKey}</span>
        </div>
        {
            showValue &&
            <div>
                <span style={{marginRight: 10}}>{text?.value}:</span>
                <span>{isEmpty(convertValue) ? VALUES.SLOT : convertValue}</span>
            </div>
        }
        {
            showAlert && 
            <div style={{color: '#849EB3'}}>
                {text?.tip}
            </div>
        }                
    </div>;
}

const RenderTooltip = (props) => {
    const { 
        children, 
        placement, trigger 
    } = props;
    return <Tooltip 
        placement={ placement || 'top' }
        title={() => <TooltipTitle {...props} />} 
        overlayClassName={styles.tip} 
        overlayStyle={{maxWidth: 500}}
        color={styles.tipColor}
        trigger={trigger || 'contextMenu'}
    >
        {children}
    </Tooltip>
}

const IconColor = (props: {
    icon?: keyof typeof IconType;
    color?: string;
    background?: string;
    size?: number;
    iconFontSize?: number
}) => {
    const {icon, color, background, size, iconFontSize} = props;

    const boxSize = icon ? (size ? size : 20) : 8;
    const iconStyle = {fontSize: 8};
    if(color){
        // @ts-ignore
        iconStyle.color = color;
    }

    return (icon || color || background) ? 
    <span className={styles.icon} style = {background ? {
        backgroundColor: background, 
        width: boxSize, 
        minWidth: boxSize,
        height: boxSize, 
        fontSize: iconFontSize
    } : {}}>
        {icon ? <FontIcon type={IconType[icon]} style={iconStyle}/> : null}
    </span> : null
}

const Progress = (props: {
    value?: number | string | null;
    valueComma?: number | string | null;
    name?: string;
    unit?: string;
    color?: string;
    onClick?: React.MouseEventHandler<HTMLDivElement>
}) => {
    const { value, valueComma, unit, color, onClick } = props;
    const style: {
        width: string;
        background?: string;
    } = {
        width: '0%'
    };

    // 只有单位为%的才计算百分比, 其它都显示整个进度条, 非数字的为0%
    if(NumberUtil.isValidNumber(value)){
        if(unit === '%'){
            // 百分数>100则满显, <0则不显
            style.width = (Number(value) > 100 ? 100 : (Number(value) < 0 ? 0 : value)) + '%';
        }else{
            style.width = '100%';
        }
    }

    if(color){
        let startColor = color;
        if(color.indexOf('#') === 0){
            startColor = hexToRgba(color, 0.1);
        }else if(color.indexOf('rgb') === 0){
            let temp = color.replace(/(rgb|rgba)\(/, '').replace(/\)/, '');
            let rgb = temp.split(',');
            startColor = `rgba(${rgb[0]||255}, ${rgb[1]||255}, ${rgb[2]||255}, .1)`;
        }
        
        style.background = `linear-gradient(90deg, ${startColor}, ${color})`;
    }

    return <Tooltip 
        key={'progress'}
        placement={'top'} 
        destroyTooltipOnHide={{keepParent: false}}
        trigger={'hover'}
        overlay={() => {
            return `${valueComma}${unit ? ` ${unit}` : ''}`
        }}
    >
        <div className={styles.progress} onClick={onClick}>
            <div className={styles.progressBar} style={style}></div>
        </div>
    </Tooltip>
}

export default CommonDynData;