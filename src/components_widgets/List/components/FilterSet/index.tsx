import { isZh } from '@/common/util-scada';
import { combinePointKey, parsePointKey } from '@/common/utils/model';
import { ArrayElement } from '@/components_widgets/FactoryTopologyDiagram/utils';
import List from 'PointSelector/List';
import StyledAntSelect from 'Select/StyledAntSelect';
import React, { useContext, useEffect } from 'react';
import { keyStringMap, msg } from '../../constants';
import { getConfFromQuota, getFilterGroupFromOldData } from '../../oldVersionAdapter';
import { ListConfig } from '../../types';
import { GlobalContext } from '../QuotaSet/context';
import styles from './index.module.scss';

export type FilterSetProps = {}

const FilterSet: React.FC<FilterSetProps> = (props) => {
    const { state, dispatch } = useContext(GlobalContext);
    const quotaMap = state.quotaData
    const quotaOptions = state.quotaOptions
    const filterGroups = state.filterGroups

    useEffect(() => {
        if (!filterGroups) {
            const groupFromOld = getFilterGroupFromOldData(quotaMap)
            dispatch({
                filterGroups: groupFromOld
            })
        }
    }, [filterGroups])

    const options = (quotaOptions?.[keyStringMap.FILTER]?.[keyStringMap.UNIVERSAL]?.quotas ?? []).map((key: string) => {
        const quato = quotaMap[key ?? '']
        return {
            key: quato ? combinePointKey(quato) : '',
            value: quato ? combinePointKey(quato) : '',
            label: (isZh ? quato?.nameCn : quato?.nameEn) ?? ''
        }
    })

    const handleChange = (cfg: ListConfig.FilterConfig['filterGroups']) => {
        dispatch({
            filterGroups: cfg
        })
    }

    return <div className={styles.container}>
        <div className={styles.title}>
            <div>
                {msg('config.filterType')}
            </div>
            <StyledAntSelect containerCls={styles.select}
                showArrow allowClear showSearch={false} mode='multiple'
                value={filterGroups?.map(v => v.key)}
                options={options}
                onChange={(v) => {
                    handleChange(v.map(key => {
                        const { alias, tableNo, fieldNo } = parsePointKey(key)
                        const q = quotaMap[`${tableNo}:${alias}:${fieldNo}`]
                        if (!q) {
                            return
                        }

                        let conf: TPointConfiguration = {
                            valueMap: q.valueList.reduce((p, c) => {
                                return {
                                    ...p,
                                    [c.value]: {
                                        color: [],
                                        enable: true
                                    }
                                }
                            }, {} as TPointConfiguration['valueMap'])
                        }

                        if (filterGroups) {
                            conf = filterGroups.find(g => g.key === key)?.conf ?? conf
                        } else {
                            conf = getConfFromQuota(q) ?? conf
                        }

                        const group: ArrayElement<NonNullable<ListConfig.FilterConfig['filterGroups']>> = {
                            key: combinePointKey(q),
                            name: '',
                            nameCn: q.nameCn,
                            nameEn: q.nameEn,
                            tableNo: q.tableNo,
                            fieldNo: q.fieldNo,
                            alias: q.alias,
                            constNameList: q.valueList,
                            conf: conf
                        }

                        return group
                    }).filter(o => o) as ListConfig.FilterConfig['filterGroups'])
                }}
            >
            </StyledAntSelect>
        </div>
        <div className={styles.list}>
            <List data={filterGroups ?? []} onChange={handleChange}
                enableConfigs={['yxValueIcon', 'yxValueDatasource', 'yxValueEnable']}
                configContentParams={{
                    yxValueIcon: { withColor: true },
                    yxValueDatasource: {
                        candidates: (quotaOptions?.[keyStringMap.FILTER]?.[keyStringMap.UNIVERSAL]?.dataSource ?? []).map((key: string) => {
                            const quota = quotaMap[key ?? '']
                            if (!quota) return
                            const p: TPoint = {
                                alias: quota.alias,
                                name: '',
                                nameCn: quota.nameCn,
                                nameEn: quota.nameEn,
                                tableNo: quota.tableNo,
                                fieldNo: quota.fieldNo
                            }
                            return p
                        }).filter((p: TPoint | undefined) => p)
                    }
                }}
            />
        </div>
    </div>
}

export default FilterSet