import { QuickRangeSelectEnum, RangePicker } from 'DatePicker'
import { ComponentContext } from 'ParamsGenerator/utils'
import { Moment } from 'moment'
import { RangeValue } from 'rc-picker/lib/interface'
import React, { useContext } from 'react'
import styles from './index.module.scss'

export type TimerPickerProps = {
    hideTitle?: boolean
    quickValue?: QuickRangeSelectEnum
    dateValue?: RangeValue<Moment>
    showTime?: boolean
    onChange: (data: RangeValue<Moment>, quick?: QuickRangeSelectEnum) => void
}

const TimeRangePicker: React.FC<TimerPickerProps> = ({
    hideTitle, quickValue, dateValue, showTime, onChange
}) => {
    const { locale: { templateProtoRender: locale } } = useContext(ComponentContext)
    return <div>
        {!hideTitle && <div className={styles.name + ' ' + styles.require}>{locale.time}</div>}
        <RangePicker
            showTime={showTime}
            quickSelect={{
                mode: 'button',
                value: quickValue,
            }}
            value={dateValue}
            onChange={(dates, quick) => {
                onChange(dates, quick)
            }} />
    </div>
}

export default TimeRangePicker