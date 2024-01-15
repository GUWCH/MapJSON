import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Input, Popover } from 'antd';
import { AntSlider2 } from '@/components';
import { Icon, Icon2, FontIcon, IconType } from 'Icon';
import { MODE, GRADE, msg, getCurQuotas, keyStringMap } from '../../constants';
import Set from '../../components/QuotaSet';

import styles from './style.mscss';

import { IDataState } from '../../stores/storeData';
import { IPageState } from '../../stores/storePage';

interface IToolBarProps{
    dataState: IDataState;
    pageState: IPageState;
};

@inject('pageState', 'dataState')
@observer
class ToolBar extends React.PureComponent<IToolBarProps> {

    componentWillMount(){
        const { dataState } = this.props;
        dataState.setMode(MODE.LARGE_ICON);
    }

    changeFlag(flag){
        const { dataState } = this.props;
        dataState.setMode(flag);
    }
    
    render(){
        const { pageState, dataState, containerRef } = this.props;

        const flags = [{
            name: msg('flag.largeIcon'),
            flag: MODE.LARGE_ICON,
            iconType: IconType.CARD
        }, {
            name: msg('flag.smallIcon'),
            flag: MODE.SMALL_ICON,
            enable: pageState.grade === GRADE.DEVICE,
            iconType: IconType.CARD2
        }, {
            name: msg('flag.list'),
            flag: MODE.LIST,
            iconType: IconType.TABLE
        }];

        let step = 0.01;
        let min = 0.5;
        let max = 1;

        const setContentHight = containerRef.current?.clientHeight - 280;

        return (
            <div className={styles.toolbar}>
                <Input 
                    style={{width: 220}} 
                    prefix={<FontIcon type={IconType.SEARCH}/>} 
                    placeholder={pageState.grade === GRADE.DEVICE ? `${pageState.getDeviceName()}名称` : '场站名称'}
                    value={dataState.getSearchText()}
                    onChange={(e) => {
                        dataState.setSearchText(e.target.value);
                    }}
                />
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
                                tooltipVisible={false}
                                onChange={(val, percent) => {
                                    dataState.setUserIconSize(val);
                                }}
                            />
                        </div>
                        : null
                        : null
                    }
                    <Set 
                        height = {setContentHight}
                        isFarm = {pageState.grade === GRADE.FARM}
                        listType = {'list'}
                        data = {{
                            quotaList: getCurQuotas(
                                dataState.getModels(), 
                                pageState.nodeType, 
                                pageState.grade === GRADE.FARM
                                ),
                            cfg: dataState.getCategoryCfg()
                        }}
                        placement={'bottomRight'}
                        trigger={'click'}
                        visible={dataState.isConfiguring}
                        onVisibleChange={visible => {
                            dataState.setIsConfiguring(visible);
                        }}
                        onCancle={() => {
                            dataState.setIsConfiguring(false);
                        }}
                        onSubmit={(data) => {
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