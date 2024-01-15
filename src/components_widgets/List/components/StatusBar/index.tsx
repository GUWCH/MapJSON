import * as React from 'react';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import { _dao, daoIsOk } from '@/common/dao';
import { TimerInterval } from '@/common/const-scada';
import { isZh } from '../../constants';
import { IDataState } from '../../stores/storeData';
import { IPageState } from '../../stores/storePage';
import { IconColor } from '../StyleShow';
import CommonDynData from '@/components/DynData';
import styles from './style.mscss';
import { combinePointKey, getDynKey } from '@/common/utils/model';

interface IStatusBarProps{
    dataState: IDataState;
    pageState: IPageState;
    isDev?: boolean;
};

@observer
class StatusBar extends React.PureComponent<IStatusBarProps> {
    
    constructor(props){
        super(props);
    }

    timer: any = null;
    deposer: any;

    state = {
        dynData: {},
        valList: []
    }

    componentDidMount(){
        this.deposer = reaction(() => this.props.dataState.getFilter(), (filters) => {
            filters && this.fetchFilterDatasourceData();
        });
    }
    
    componentWillUnmount(){
        clearTimeout(this.timer);
        this.deposer && this.deposer();
    }

    fetchFilterDatasourceData(){
        const { pageState, dataState } = this.props;
        const nodeAlias = pageState.nodeAlias;
        const filters = dataState.getFilter();
        if(filters.length === 0) return;

        const dataSourceArr = filters.flatMap(f => Object.entries(f.conf?.valueMap ?? {}).map(([k,v]) => {
            return v.dataSource
        })).filter(d => d)

        const req = dataSourceArr.filter(d => d).map(d => ({
            id: '',
            key: getDynKey({point: d!, assetAlias: nodeAlias}),
            decimal: 0
        }));
        
        clearTimeout(this.timer);
        const get = async () => {

            if(req.length === 0) return;

            const res = await _dao.getDynData(req);
            const dynData = {};

            if(daoIsOk(res)){
                res.data.forEach(data => {
                    delete data.timestamp;
                    dynData[data.key] = data;
                });
            }

            this.setState({dynData: Object.assign({}, this.state.dynData, dynData)}, () => {
                clearTimeout(this.timer);
                this.timer = setTimeout(get, TimerInterval as number);
            });
        }

        get();
    }

    render(){
        const { pageState, dataState} = this.props;

        const filters = dataState.getFilter();
        const valList = filters.flatMap(f => {
            const valueList = f.valueList ?? []
            const valueMap = f.conf?.valueMap ?? {}
            const values = valueList.map(v => {
                const cfg = valueMap[v.value]
                return {
                    pointKey: combinePointKey(f),
                    ...v,
                    color: cfg?.color?.[0],
                    enable: cfg?.enable ?? true,
                    icon: cfg?.icon,
                    dataSource: cfg?.dataSource
                }
            })
            return values
        }).filter(v => v.enable)

        if(valList.length === 0) return null;

        let {dynData} = this.state;

        return (
            <div className={styles.statusbar}>
                {valList.map((ele, ind) => {
                    let {icon, color, dataSource} = ele;
                    let statisticsContent: React.ReactNode;

                    if(dataSource){
                        const nodeKey = getDynKey({
                            point: dataSource,
                            assetAlias:pageState.nodeAlias
                        });
                        const {tableNo, fieldNo, nameCn, nameEn} = dataSource;

                        statisticsContent = <span>(
                            <CommonDynData 
                                showName = {false}
                                valueBackground={dynData[nodeKey]?.fill_color}
                                valueColor={dynData[nodeKey]?.line_color}
                                point={{
                                    aliasKey: nodeKey,
                                    tableNo: tableNo,
                                    fieldNo: fieldNo,
                                    nameCn: nameCn,
                                    nameEn: nameEn,
                                    decimal: 0
                                }}
                                value={dynData[nodeKey]}
                            />
                        )</span>;
                    }

                    return <button 
                        key={ind}
                        className={ele?.checked ? styles.hov: ''}
                        onClick={() => dataState.setFilter({...ele, checked: !ele.checked})}
                    >
                    <IconColor icon = {icon} color = {color} iconFontSize={12}/>
                    {isZh ? ele.name : ele.name_en}
                    {statisticsContent}
                    </button>
                })}
            </div>
        );
    }
}

export default StatusBar;