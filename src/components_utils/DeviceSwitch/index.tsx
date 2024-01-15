import React, { useEffect, useState } from 'react';
import { IconType, FontIcon } from 'Icon';
import { _dao, daoIsOk } from '@/common/dao';
import { NumberUtil, isBayTable } from '@/common/utils';
import ScadaCfg from '@/common/const-scada';
import styles from './style.mscss';

const sortNo = ScadaCfg.isSortNoForDataList();

interface IDeviceSwitch {
    showSwitch?: boolean;
    /** 页面当前所处节点 */
    pageNodeAlias?: string;
    /** 默认资产名称, 组态里使用 */
    defaultAssetName?: string;
    /** 当前资产别名 */
    assetAlias?: string;
    /** 资产所属类型的表号 */
    tableNo?: string | number;
    /** 资产所属类型 */
    type?: string | number;
    switchCallback?: (assetAlias?: string, list?: any[]) => void;
    /**名称较长时样式处理,需要外出限制大小 */
    nameEllipsis?: boolean;
}

const DeviceSwitch = (props: IDeviceSwitch) => {
    const { 
        showSwitch, 
        pageNodeAlias, 
        assetAlias, 
        defaultAssetName, 
        tableNo, 
        type,
        switchCallback,
        nameEllipsis
    } = props;

    const [name, setName] = useState(defaultAssetName || '');
    const [assetList, setAssetList] = useState<{name: string; alias: string}[]>([]);

    // 获取名称
    useEffect(() => {
        if(!assetAlias) return;

        const fetchName = async () => {
            const res = await _dao.getInfoByAlias(assetAlias as string, 'disp_name');
            if(daoIsOk(res) && res.data && res.data[0]){
                setName(res.data[0].disp_name);
            }
        }
        fetchName();
    }, [assetAlias]);

    // 获取列表信息进行切换
    useEffect(() => {
        if(!showSwitch) return;
        if(!NumberUtil.isValidNumber(tableNo) || !NumberUtil.isValidNumber(type)) return;

        const fetchAssetList = async () => {
            const deviceType = isBayTable(tableNo) ? `${type}` : `${tableNo}_${type}`;
            const res = await _dao.getTreeList(deviceType, pageNodeAlias);
            if(daoIsOk(res)){
                const data: ITree[] = res.data;
                setAssetList(data
                    .filter(d => d.node_type === deviceType || (
                        d.node_type.startsWith('BAY_') 
                        && ['BAY_OTHER', 'BAY_STATISTIC'].indexOf(d.node_type as string) === -1
                    ) || (d.node_type.startsWith('DEVICE_'))) // 老的间隔和设备是定义了字符串的
                    .map((d) => ({
                        name: d.display_name as string,
                        alias: d.alias as string,
                        order_no: d.order_no
                    })).sort(sortNo 
                        ? (prev, next) => {
                            const pNo = (prev.order_no || '').replace(/\,/g, '');
                            const nNo = (next.order_no || '').replace(/\,/g, '');
                            const diff =  Number(pNo || 0) - Number(nNo || 0);

                            if(diff === 0){
                                const pName = prev.name.replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                const nName = next.name.replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                                return pName.localeCompare(nName);
                            }

                            return diff;
                        } 
                        : (prev, next) => {
                            const pName = prev.name.replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                            const nName = next.name.replace(/(\d+)/g,($,$1)=>$1.padStart(10, '0'));
                            return pName.localeCompare(nName);
                        }
                    )
                );
            }
        }

        fetchAssetList();
    }, [tableNo, type]);

    const assetIndex = assetList.findIndex((asset) => asset.alias === assetAlias);
    const assetLength = assetList.length;

    return <div className={styles.wrap}>
        {showSwitch && <FontIcon 
            className={`${styles.arrowLeft} ${assetIndex <= 0 ? styles.arrowDisabled : ''}`}
            type={IconType.DIRECT_LEFT} 
            style={{fontSize: 10}}
            onClick={() => {
                if(assetIndex <= 0)return;
                typeof switchCallback === 'function' 
                && switchCallback(assetList[assetIndex-1].alias, JSON.parse(JSON.stringify(assetList)));
            }}
        />}
        <span className={nameEllipsis ? styles.name : ''} title={name}>{name}</span>
        {showSwitch && <FontIcon 
            className={`${styles.arrowRight} ${assetIndex >= assetLength - 1 ? styles.arrowDisabled : ''}`}
            type={IconType.DIRECT_RIGHT} 
            style={{fontSize: 10}}
            onClick={() => {
                if(assetIndex >= assetLength - 1)return;
                typeof switchCallback === 'function' 
                && switchCallback(assetList[assetIndex+1].alias, JSON.parse(JSON.stringify(assetList)));
            }}
        />}
    </div>;
}

export default DeviceSwitch;