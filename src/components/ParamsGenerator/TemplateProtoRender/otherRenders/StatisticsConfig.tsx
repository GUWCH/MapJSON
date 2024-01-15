import React, { useContext } from 'react'
import styles from './index.module.scss'
import { Checkbox } from 'antd'
import { ComponentContext } from 'ParamsGenerator/utils'

export type StatisticsConfigProps = {
    displayColumns: string[]
    onChange: (cols: string[]) => void
}

const StatisticsConfig: React.FC<StatisticsConfigProps> = ({
    displayColumns, onChange
}) => {
    const { locale: { templateProtoRender: locale } } = useContext(ComponentContext)

    return <div>
        <div className={styles.name}>{locale.statisticsCols}</div>
        <Checkbox.Group options={[
            { label: locale.statisticsEnum.max, value: 'max' },
            { label: locale.statisticsEnum.maxOccur, value: 'maxOccur' },
            { label: locale.statisticsEnum.min, value: 'min' },
            { label: locale.statisticsEnum.minOccur, value: 'minOccur' },
            { label: locale.statisticsEnum.avg, value: 'avg' },
            { label: locale.statisticsEnum.granularity, value: 'granularity' },
        ]} value={displayColumns} onChange={v => {
            onChange(v as string[])
        }} />
    </div>
}

export default StatisticsConfig