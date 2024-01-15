import * as React from 'react';
import { observer } from 'mobx-react';
import { Button, Input, Popover, Space } from 'antd';
import { AntSlider2 } from '@/components';
import { Icon, Icon2, FontIcon, IconType } from 'Icon';
import { MODE, GRADE, msg, keyStringMap, reqDecimal, getConditionStyle, isZh, defaultIconArr } from '../../constants';
import Set from '../QuotaSet';
import { IDataState } from '../../stores/storeData';
import { IPageState } from '../../stores/storePage';
import styles from './style.mscss';
import { _dao, daoIsOk } from '@/common/dao';
import { BAY_TYPE, DEVICE_TYPE, isOtherDeviceType } from '@/common/utils';
import { TableState } from '../List';
import scadaCfg from '@/common/const-scada';
import { notify } from 'Notify';
import { isValidNumber } from '@/common/utils/number';
import { isNumber } from 'lodash';

interface IToolBarProps{
    dataState: IDataState;
    pageState: IPageState;
    isDev?: boolean;
    tableState?: TableState
};

@observer
class ToolBar extends React.PureComponent<IToolBarProps, {
    exporting: boolean
}> {
    state = {
        exporting: false
    }

    changeFlag(flag){
        const { dataState } = this.props;
        dataState.setMode(flag);
    }

    exportData(){
        const pageState = this.props.pageState;
        const { deviceType, nodeAlias } = pageState;
        const dataState = this.props.dataState
        const tableState = this.props.tableState
        const defaultNameKey = 'WTG.Name'
        const toggleLoading = () => this.setState((state) => ({exporting: !state.exporting}))
        scadaCfg.getCurNodeName(({display_name} = {display_name: ''}) => {
            const filename = display_name + 
                (pageState.grade === GRADE.FARM? '' : ('_' + pageState.getDeviceName()))

            // @ts-ignore
            window.SysExport?.init({
                cb: function(type, cb){
                    let filters = dataState.getFilter();
                    const parasArr = filters.map(f => ({
                        type: f.alias,
                        field: isNumber(f.fieldNo)? f.fieldNo: parseInt(f.fieldNo),
                        decimal: reqDecimal
                    }));
                    const cols = dataState.getListColumns()

                    const req = {
                        id: "",
                        data_level: isOtherDeviceType(deviceType) ? 'device' : deviceType,
                        device_type: isOtherDeviceType(deviceType) ? deviceType : '',
                        filter_bay_type: deviceType === DEVICE_TYPE.INVERTER 
                        ? BAY_TYPE.INVERTER_STR
                        : (deviceType === DEVICE_TYPE.DC_COMBINER ? BAY_TYPE.AC_COMBINER_STR: ''),
                        farm_type: "",
                        root_nodes: nodeAlias,
                        paras: parasArr.concat(cols.map(ele => ({
                            type: ele.alias,
                            field: Number(ele.fieldNo || ''),
                            decimal: reqDecimal,
                            table_no: Number(ele.tableNo)
                        }))),
                        page_num: null,     //如果导出，页数传null
                        row_count: null,    //如果导出，条数传null
                        savetype: type,    //如果导出，传非null（csv、xls、pdf三选一）；如果查询，传null或不传
                        columns: [          //如果导出，传导出文件的列头属性
                            {
                                typeName: msg('name'),
                                name: defaultNameKey,
                            },
                            ...cols.map(ele => {
                                // @ts-ignore
                                const {unit} = getConditionStyle({
                                    quota: ele,
                                    data: {},
                                    part: keyStringMap.GRID,
                                    location: keyStringMap.UNIVERSAL
                                });
                                const {edictNameCn, edictNameEn, convert} = (ele[keyStringMap.GRID])[keyStringMap.UNIVERSAL];
                                const currentName = isZh ? edictNameCn || ele.nameCn : edictNameEn || ele.nameEn;
                                return {
                                    typeName: `${currentName}${unit || ele.unit ? ` (${unit || ele.unit})` : ''}`,
                                    name: `${ele.alias}:${ele.fieldNo}`,
                                    coefficient: convert?.coefficient,
                                    decimal: convert?.decimal
                                };
                            })
                        ],
                        top_rows: (dataState.getUserTopData() || []).join(','),
                        order_by: tableState?.sortBy || defaultNameKey,
                        is_asc: tableState?.sortOrder !== 'descend',
                        if_filter: false,
                        filters: [
                            ...dataState.getReqFilter(),
                            ...dataState.getSearchFilter(defaultNameKey)
                        ],
                        tree_grid: false,
                        need_color: false,
                        filename: filename
                    }

                    toggleLoading()
                    _dao.getDeviceList(req)
                    .then(res => {
                        if (daoIsOk(res)) {
                            if (res.file_path) {
                                scadaCfg.downLoad(res.file_path, undefined)
                            } else {
                                throw new Error('file_path not exist:' + res.file_path)
                            }
                        } else {
                            throw new Error('res not ok')
                        }
                    })
                    .catch((e) => {
                        console.error('export error',e)
                        notify(msg('exportError'))
                    })
                    .finally(() => toggleLoading())
                    return true;
                }
            })

        }) 
    }
    
    render(){
        const { pageState, dataState } = this.props;

        const config = dataState.getCategoryCfg() as any
        const largeIconFlag = {
            name: msg('flag.largeIcon'),
            flag: MODE.LARGE_ICON,
            iconType: IconType.CARD
        }
        const smallIconFlag = {
            name: msg('flag.smallIcon'),
            flag: MODE.SMALL_ICON,
            enable: pageState.grade === GRADE.DEVICE,
            iconType: IconType.CARD2
        }
        const listIconFlag = {
            name: msg('flag.list'),
            flag: MODE.LIST,
            iconType: IconType.TABLE
        }

        const flags = (config?.otherCfg?.iconArr ?? defaultIconArr).map(k => {
            if(k === MODE.LARGE_ICON) return largeIconFlag
            if(k === MODE.SMALL_ICON) return smallIconFlag
            return listIconFlag
        })

        let step = 0.01;
        // let min = 0.5;
        let min = 0.62;
        let max = 1;

        return (
            <div className={styles.toolbar}>
                <Space>
                    <Input 
                        style={{width: 220}} 
                        prefix={<FontIcon type={IconType.SEARCH}/>} 
                        placeholder={
                            pageState.grade === GRADE.DEVICE 
                            ? `${pageState.getDeviceName()}${msg('name')}` 
                            : `${msg('farm')}${msg('name')}`
                        }
                        value={dataState.getSearchText()}
                        onChange={(e) => {
                            dataState.setSearchText(e.target.value);
                        }}
                    />
                    {
                        this.props.dataState.getMode() === MODE.LIST && 
                        <Button type='primary' onClick={(e) => {this.exportData()}}>{msg('export')}</Button>
                    }
                </Space>
                <div className={styles.toolitem}>
                    {
                        pageState.grade === GRADE.DEVICE
                        ? [MODE.LARGE_ICON, MODE.SMALL_ICON].indexOf(dataState.getMode()) > -1
                        ? <div style={{width: 200}}>
                            <AntSlider2
                                min={min}
                                max={max}
                                step={step}
                                value={dataState.getUserIconSize()}
                                onChange={(val, percent) => {
                                    dataState.setUserIconSize(val);
                                }}
                            />
                        </div>
                        : null
                        : null
                    }
                    <Set 
                        height = {window.innerHeight - 290}
                        isFarm = {pageState.grade === GRADE.FARM}
                        listType = {'list'}
                        data = {{
                            quotaList: dataState.getModels(),
                            cfg: dataState.getCategoryCfg()
                        }}
                        placement={'bottomRight'}
                        trigger={'click'}
                        visible={dataState.isConfiguring}
                        onVisibleChange={visible => {
                            dataState.setIsConfiguring(visible);
                        }}
                        onCancel={() => {
                            dataState.setIsConfiguring(false);
                        }}
                        onSubmit={(data) => {
                            console.log('submit data', JSON.parse(JSON.stringify(data)))
                            dataState.initFilter((JSON.parse(JSON.stringify(data.quotaCfg)) || []).filter((ele: any) => {
                                return (ele[keyStringMap.FILTER])[keyStringMap.UNIVERSAL];
                            }))
                            dataState.saveConfig(JSON.parse(JSON.stringify(data)));
                            dataState.setIsConfiguring(false);
                        }}
                    >
                        <div onClick={(e) => {
                            dataState.setIsConfiguring();
                            e.stopPropagation();
                        }}
                        >
                            <Icon2 
                                type={IconType.CONFIG} tip={msg('flag.config')} highlight={dataState.isConfiguring}></Icon2>
                        </div>
                    </Set>
                        
                    <div className={styles.switch}>
                    {
                        flags
                        .filter((ele) => !('enable' in ele) || ele.enable)
                        .map((ele, ind) => {
                            const {flag, name, iconType} = ele;
                            const highlight = dataState.getMode() === flag;

                            return <div 
                                className={styles.impact}
                                key={ind}
                                onClick={() => this.changeFlag(flag)}
                            >
                                <Icon type={iconType} tip={name} highlight={highlight}/>
                            </div>
                        })
                    }
                    </div>
                </div>
            </div>
        );
    }
}

export default ToolBar;