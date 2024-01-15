import { usePrivatePoints } from '@/common/utils/model'
import PointSelect from 'PointSelector'
import StyledAntSelect from 'Select/StyledAntSelect'
import _ from 'lodash'
import React, { useMemo } from 'react'
import styles from './ValueBar.module.scss'
import { isZh } from '@/common/util-scada'
import { ModelWithDomainAndPoint } from '../type'

export type BarProps = {
    containerCls?: string
    currentModelId?: string
    currentPoints?: TPoint[]
    models: ModelWithDomainAndPoint[]
    onModelChange: (id: string) => void
    onPointsChange: (p: TPoint[]) => void
}

const Bar: React.FC<BarProps> = ({
    containerCls, currentModelId, currentPoints, models, onModelChange, onPointsChange
}) => {
    const current = models.find(m => m.model_id === currentModelId)
    const { options, map } = useMemo(() => {
        const options = Object.entries(_.groupBy(models, 'domainId')).map(([k, m]) => {
            return {
                label: isZh ? m[0].domainNameCn : m[0].domainName,
                options: m.map(model => ({
                    key: model.model_id,
                    value: model.model_id,
                    label: isZh ? model.model_name_cn : model.model_name
                }))
            }
        })
        const map = _.keyBy(models, 'model_id')
        return { options, map }
    }, [models])

    // const privatePoints = usePrivatePoints(current?.domainId, current?.model_id)
    const candidates = useMemo(() => {
        if (!current) return []
        const publicPoints = map[current.model_id].points
        // return [...publicPoints, ...privatePoints]
        return [...publicPoints]
    // }, [map, privatePoints])
    }, [map, current])

    return <div className={`${styles.container} ${containerCls ?? ''}`}>
        {models.length > 1 && <StyledAntSelect
            containerCls={styles.select}
            options={options}
            value={current?.model_id}
            onChange={onModelChange}
        />}
        {current && <PointSelect
            containerCls={styles.select}
            multiple
            candidates={candidates}
            selected={currentPoints}
            groupMode='pointType'
            showList={false}
            onChange={onPointsChange}
        />}
    </div>
}

export default Bar