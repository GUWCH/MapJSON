import React, { useEffect, useState, useRef, useMemo } from 'react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import CommonDynData from 'DynData';
import { useRecursiveTimeoutEffect } from 'ReactHooks';
import { TimerInterval } from '@/common/const-scada'
import Intl, { msgTag } from '@/common/lang';
import { getPointKey } from "@/common/constants";
import { PointWithConf } from '../common/components/PointTplConfiguration/models';
import useDataStore from '../common/components/PointTplConfiguration/dataStore';
import styles from './style.mscss'
import { GREEN_COLOR, RED_COLOR } from '../common/components/PointTplConfiguration';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

export const msg = msgTag('pagetpl');
export const isZh = Intl.isZh;

export type TabLightPlateProps = {
    alias: string
    pointsWithConf: PointWithConf[]
}

const TabLightPlate = (props: TabLightPlateProps) => {
    const { alias, pointsWithConf } = props
    const { pointsValueMap, fetchPointsValue } = useDataStore()

    const sortList: (PointWithConf&{data: IDyn, isTop: boolean, background?: string, dynKey: string})[] = []

    pointsWithConf.map(p => {
        const newPoint = toJS(p);
        const valueMap = newPoint.conf?.valueMap??{};
        const dynKey = getPointKey(newPoint, alias);
        const dynData = pointsValueMap[dynKey] || {};
        let valueConfig = {};
        if(dynData.raw_value){
            valueConfig = valueMap[dynData.raw_value] || {};
        }
        if(!('background' in valueConfig)){
            if(String(dynData.status_value) === '0'){
                valueConfig.background = GREEN_COLOR;
            }else if(String(dynData.status_value) === '1'){
                valueConfig.background = RED_COLOR;
            }            
        }
        sortList.push(Object.assign(
            {}, 
            newPoint, 
            {
                data: dynData, 
                isTop: valueConfig.isTop === '1', 
                background: valueConfig.background || '',
                dynKey: dynKey
            }
        ));
    })

    sortList.sort((a, b) => {
        const new_a: number = a.isTop ? 1 : 0;
        const new_b: number = b.isTop ? 1 : 0;
        return new_b - new_a
    });

    useRecursiveTimeoutEffect(() => {
        return [
            () => {
                return fetchPointsValue(alias, pointsWithConf)
            }
        ];
    }, TimerInterval as number, [pointsWithConf, alias]);

    return(
        <div className={styles.lightPlate}>
            {
                sortList.map(o => {
                    let style: CSSProperties = {};
                    if(o.data.fill_color){
                        style.background = o.data.fill_color;
                    }else if(o.background){
                        style.background = o.background;
                    }
                    return <div key={o.key}>
                        <CommonDynData 
                            wrapperCls={styles.card}
                            containerCls={styles.common}
                            nameContainerCls={styles.name}
                            nameStyle={{whiteSpace: 'normal'}}
                            containerStyle={style}
                            showUnit={false}
                            showValue={false}
                            point={{
                                nameCn: o.name.cn,
                                nameEn: o.name.en,
                                aliasKey: o.dynKey,
                                tableNo: o.tableNo,
                                fieldNo: o.fieldNo
                            }}
                            value={o.data}
                            tipShowValue={true}
                            transform={{
                                nameCn: o.conf.showTitleCn,
                                nameEn: o.conf.showTitleEn,
                                convert: {
                                    decimal: 0
                                }
                            }}
                            tipTrigger={'hover'}
                        />
                    </div>
                })
            }
        </div>
    );
  
}

export default observer(TabLightPlate)