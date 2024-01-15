import { TPointTypes } from '@/common/constants/point';
import msg from '@/common/lang';
import PointSelect from 'PointSelector';
import { ConfigKeys } from 'PointSelector/List';
import React, { useEffect, useMemo, useState } from 'react';
import dao from './dao';
import { combinePointKey } from '@/common/utils/model';

export const defaultPointConf = {
    lightPlateCondition: {
        background: {
            green: 'rgba(88,245,192,0.7)',
            red: 'rgba(250,70,92,0.7)'
        }
    }
}

type CommonProps = {
    /* 配置名 */
    name?: string,
    /* 候选测点 */
    initialCandidates?: TPoint[],
    /* 非标准点请求参数 */
    nonStandardPointsParam?: {
        level: number[],
        deviceAlias: string | { alias: string; name: string; showName: string }[],
        publicTypes?: TPointTypes
    },
    /* 开启指定配置功能，默认全部开启 */
    enableConfigs?: ConfigKeys[]
}

type PointConfigurationProps = MultiplePointConfigurationProps & {
    pointNumLimit?: number
    multiple?: boolean
}

const usePointConfiguration = ({
    name,
    defaultPointWithConfArr,
    pointWithConfArr,
    initialCandidates,
    nonStandardPointsParam,
    enableConfigs,
    pointNumLimit,
    multiple = true,
    removeable
}: PointConfigurationProps) => {
    const [data, setData] = useState<TPointWithCfg[]>(pointWithConfArr || defaultPointWithConfArr || [])
    useEffect(() => {
        if (pointWithConfArr) {
            setData(pointWithConfArr)
        }
    }, [pointWithConfArr])

    const [candidates, setCandidates] = useState<TPoint[]>(initialCandidates ?? [])

    let firstDeviceAlias = '';
    const deviceAlias = nonStandardPointsParam?.deviceAlias
    if (typeof deviceAlias === 'string') {
        firstDeviceAlias = deviceAlias;
    } else if (Array.isArray(deviceAlias) && deviceAlias[0]) {
        firstDeviceAlias = deviceAlias[0].alias;
    }

    useEffect(() => {
        if (firstDeviceAlias) {
            dao.getPoints(firstDeviceAlias, {
                publicTypes: nonStandardPointsParam?.publicTypes,
                modelLevels: nonStandardPointsParam?.level
            }).then(nonStandardPoints => {
                setCandidates(arr => arr.concat(nonStandardPoints))
            })
        }
    }, [firstDeviceAlias])

    const content = <PointSelect
        name={name}
        candidates={candidates}
        multiple={multiple}
        limit={pointNumLimit}
        selected={pointWithConfArr}
        defaultSelectedKeys={defaultPointWithConfArr?.map(p => combinePointKey(p))}
        listProps={{
            removeable: removeable,
            enableConfigs: enableConfigs,
        }}
        onChange={setData}
    />

    return { data, setData, content }
}

export type MultiplePointConfigurationProps = {
    /* 配置初始值（非受控） */
    defaultPointWithConfArr?: TPointWithCfg[],
    /* 配置值（受控） */
    pointWithConfArr?: TPointWithCfg[],
    /* 配置改变回调 */
    onChange?: (newCfg: TPointWithCfg[]) => void
    /* 是否可删除列表项 */
    removeable?: boolean
} & CommonProps

export const useMultiplePointConfiguration = (props: MultiplePointConfigurationProps): {
    data: TPointWithCfg[],
    configContent: React.ReactElement
} => {
    const { data, content } = usePointConfiguration(props)

    return {
        data,
        configContent: content
    }
}

export type SinglePointConfigurationProps = {
    /* 配置初始值（非受控） */
    defaultPointWithConf?: TPointWithCfg,
    /* 配置值（受控） */
    pointWithConf?: TPointWithCfg,
    /* 配置改变回调 */
    onChange?: (newCfg?: TPointWithCfg) => void
} & CommonProps

export const useSinglePointConfiguration = (props: SinglePointConfigurationProps) => {
    const pointWithConfArr = useMemo(
        () => props.pointWithConf ? [props.pointWithConf] : undefined,
        [props.pointWithConf]
    )
    const defaultPointWithConfArr = useMemo(
        () => props.defaultPointWithConf ? [props.defaultPointWithConf] : undefined,
        [props.defaultPointWithConf]
    )

    const { data, content } = usePointConfiguration({
        pointWithConfArr,
        defaultPointWithConfArr,
        pointNumLimit: 1,
        multiple: false,
        ...props,
        onChange: (newCfg) => props.onChange?.(newCfg[0])
    })

    return {
        data: data[0] as TPointWithCfg | undefined,
        configContent: content
    }
}