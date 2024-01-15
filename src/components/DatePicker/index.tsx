import ButtonRadio from 'Radio/ButtonRadioGroup'
import { DatePicker as OriginPicker } from 'antd'
import { RangePickerProps as OriginRangeProps, DatePickerProps as OriginDatePickerProps } from 'antd/lib/date-picker'
import moment, { Moment } from 'moment'
import React from 'react'
import styles from './index.module.scss'
import { DATE_CUSTOM_FORMAT } from '@/common/const-scada'
import StyledAntSelect from 'Select/StyledAntSelect'
import { msgTag } from '@/common/lang'

const i18n = msgTag('datePicker')
export enum QuickSelectEnum {
    NOW = 'date.NOW', // 当前时刻
    TODAY_START = 'date.TODAY_START', // 当日开始
    THIS_WEEK_START = 'date.THIS_WEEK_START',
    THIS_MONTH_START = 'date.THIS_MONTH_START',
    THIS_YEAR_START = 'date.THIS_YEAR_START',
    LAST_WEEK_START = 'date.LAST_WEEK_START',
    LAST_MONTH_START = 'date.LAST_MONTH_START',
    LAST_YEAR_START = 'date.LAST_YEAR_START',
    YESTODAY_START = 'date.YESTODAY',

    COMPARE_LAST_DAY = 'date.COMPARE_LAST_DAY', // 对比时间，相较于基准时间的上日
    COMPARE_LAST_WEEK = 'date.COMPARE_LAST_WEEK', // 对比时间，相较于基准时间的上周
    COMPARE_LAST_MONTH = 'date.COMPARE_LAST_MONTH', // 对比时间，相较于基准时间的上月
    COMPARE_LAST_YEAR = 'date.COMPARE_LAST_YEAR', // 对比时间，相较于基准时间的上年
    COMPARE_DAY_OF_LAST_MONTH = 'date.COMPARE_DAY_OF_LAST_MONTH', // 对比时间，相较于基准时间上月的此日
    COMPARE_DAY_OF_LAST_YEAR = 'date.COMPARE_DAY_OF_LAST_YEAR', // 对比时间，相较于基准时间上年的此日
    COMPARE_WEEK_OF_LAST_YEAR = 'date.COMPARE_WEEK_OF_LAST_YEAR', // 对比时间，相较于基准时间上年的此周
    COMPARE_MONTH_OF_LAST_YEAR = 'date.COMPARE_MONTH_OF_LAST_YEAR', // 对比时间，相较于基准时间上年的此月
}
export enum QuickRangeSelectEnum {
    TODAY = 'range.TODAY', // 当日
    YESTODAY = 'range.YESTODAY', // 昨日
    LAST_SEVEN_DAY = 'range.LAST_SEVEN_DAY', // 最近7天
    LAST_THIRTY_DAY = 'range.LAST_THIRTY_DAY', // 最近30天
    CURRENT_MONTH = 'range.CURRENT_MONTH', // 当月
    LAST_MONTH = 'range.LAST_MONTH', // 上月
    LAST_THREE_MONTH = 'range.LAST_THREE_MONTH', // 最近3月
    CURRENT_YEAR = 'range.CURRENT_YEAR' // 当年
}

export const getQuickSelectName = (v: QuickSelectEnum | QuickRangeSelectEnum) => {
    return i18n('quickSelect.' + v) as string
}

export const getQuickSelectOptions = (enumArr: (QuickSelectEnum | QuickRangeSelectEnum)[]) => enumArr.map(item => ({
    key: item,
    value: item,
    label: getQuickSelectName(item)
}))

const getQuickRangeDateMap = (): Record<QuickRangeSelectEnum, [Moment, Moment]> => {
    const now = moment()
    const nowDate = now.clone().hours(0).minute(0).second(0)
    return ({
        [QuickRangeSelectEnum.CURRENT_MONTH]: [nowDate.clone().date(1), now.clone()],
        [QuickRangeSelectEnum.CURRENT_YEAR]: [nowDate.clone().month(0), now.clone()],
        [QuickRangeSelectEnum.LAST_MONTH]: [
            nowDate.clone().subtract(1, 'month').startOf('month'),
            nowDate.clone().subtract(1, 'month').endOf('month')
        ],
        [QuickRangeSelectEnum.LAST_SEVEN_DAY]: [
            nowDate.clone().subtract(6, 'days'),
            now.clone()
        ],
        [QuickRangeSelectEnum.LAST_THIRTY_DAY]: [
            nowDate.clone().subtract(29, 'days'),
            now.clone()
        ],
        [QuickRangeSelectEnum.LAST_THREE_MONTH]: [
            nowDate.clone().subtract(2, 'months'),
            now.clone()
        ],
        [QuickRangeSelectEnum.TODAY]: [
            now.clone().startOf('day'),
            now.clone()
        ],
        [QuickRangeSelectEnum.YESTODAY]: [
            nowDate.clone().subtract(1, 'day').startOf('day'),
            nowDate.clone().subtract(1, 'day').endOf('day')
        ]
    })
}

export const getRangeFromQuick = (q: QuickRangeSelectEnum) => {
    const map = getQuickRangeDateMap()
    return map[q]
}

const getQuickDateMap = (baseMoment?: Moment): Record<QuickSelectEnum, Moment> => {
    const now = moment()
    const nowDate = now.clone().hours(0).minute(0).second(0)

    const base = baseMoment ?? now
    const baseDate = base.clone().hours(0).minute(0).second(0)
    const baseWeekNum = baseDate.isoWeek()

    return ({
        [QuickSelectEnum.NOW]: now.clone(),
        [QuickSelectEnum.TODAY_START]: nowDate.clone(),
        [QuickSelectEnum.THIS_WEEK_START]: nowDate.clone().startOf('isoWeek'),
        [QuickSelectEnum.THIS_MONTH_START]: nowDate.clone().startOf('month'),
        [QuickSelectEnum.THIS_YEAR_START]: nowDate.clone().startOf('year'),
        [QuickSelectEnum.LAST_WEEK_START]: nowDate.clone().startOf('isoWeek').subtract(1, 'week'),
        [QuickSelectEnum.LAST_MONTH_START]: nowDate.clone().startOf('month').subtract(1, 'month'),
        [QuickSelectEnum.LAST_YEAR_START]: nowDate.clone().startOf('year').subtract(1, 'year'),
        [QuickSelectEnum.YESTODAY_START]: nowDate.clone().subtract(1, 'day'),

        [QuickSelectEnum.COMPARE_LAST_DAY]: base.clone().subtract(1, 'day'),
        [QuickSelectEnum.COMPARE_LAST_WEEK]: baseDate.clone().startOf('isoWeek').subtract(1, 'week'),
        [QuickSelectEnum.COMPARE_LAST_MONTH]: baseDate.clone().startOf('month').subtract(1, 'month'),
        [QuickSelectEnum.COMPARE_LAST_YEAR]: baseDate.clone().startOf('year').subtract(1, 'year'),
        [QuickSelectEnum.COMPARE_DAY_OF_LAST_MONTH]: base.clone().subtract(1, 'month'),
        [QuickSelectEnum.COMPARE_DAY_OF_LAST_YEAR]: base.clone().subtract(1, 'year'),
        [QuickSelectEnum.COMPARE_WEEK_OF_LAST_YEAR]: baseDate.clone().subtract(1, 'year').isoWeek(baseWeekNum).startOf('isoWeek'),
        [QuickSelectEnum.COMPARE_MONTH_OF_LAST_YEAR]: baseDate.clone().startOf('month').subtract(1, 'year'),
    })
}

export const getDateFromQuick = (q: QuickSelectEnum, baseMoment?: Moment) => {
    const map = getQuickDateMap(baseMoment)
    return map[q]
}

type DateQuickSelectProps<Q extends QuickSelectEnum | QuickRangeSelectEnum> = {
    containerCls?: string
    mode: 'button' | 'select'
    value?: Q | null
    onChange: (v: Q) => void
    quickSelectOptions: Q[]
}
const DateQuickSelect: React.FC<DateQuickSelectProps<any>> = ({
    containerCls, mode, quickSelectOptions, value, onChange
}) => {
    if (mode === 'button') {
        return <ButtonRadio containerCls={containerCls}
            value={value}
            options={getQuickSelectOptions(quickSelectOptions)}
            onChange={(v) => {
                onChange(v as QuickRangeSelectEnum)
            }} />
    }
    if (mode === 'select') {
        return <StyledAntSelect containerCls={`${styles.select} ${containerCls ?? ''}`}
            value={value || undefined}
            options={getQuickSelectOptions(quickSelectOptions)}
            onChange={(v) => {
                onChange(v as QuickRangeSelectEnum)
            }} />
    }
    return <></>
}

export type DateRangePickerProps = {
    showTime?: boolean
    quickSelect?: Omit<DateQuickSelectProps<QuickRangeSelectEnum>, 'onChange' | 'quickSelectOptions'> & { options?: QuickRangeSelectEnum[] }
    onChange: (date: [Moment | null, Moment | null], quick?: QuickRangeSelectEnum) => void
} & Omit<OriginRangeProps, 'onChange'>

export const RangePicker: React.FC<DateRangePickerProps> = ({
    showTime,
    quickSelect,
    value,
    onChange,
    ...rest
}) => {
    const optMap = getQuickRangeDateMap()
    let displayValue = value
    if (quickSelect?.value) {
        displayValue = optMap[quickSelect.value]
    }

    return <div className={styles.container}>
        {quickSelect && <DateQuickSelect {...quickSelect}
            value={quickSelect.value}
            mode={quickSelect.mode}
            quickSelectOptions={quickSelect.options ?? [
                QuickRangeSelectEnum.TODAY,
                QuickRangeSelectEnum.CURRENT_MONTH,
                QuickRangeSelectEnum.LAST_SEVEN_DAY,
                QuickRangeSelectEnum.LAST_THIRTY_DAY
            ]}
            onChange={(v) => {
                onChange([null, null], v as QuickRangeSelectEnum | undefined)
            }}
        />}
        {/* @ts-ignore */}
        <OriginPicker.RangePicker {...rest}
            showTime={showTime}
            className={styles.picker}
            value={displayValue}
            format={showTime ? DATE_CUSTOM_FORMAT.DATE_TIME : DATE_CUSTOM_FORMAT.DATE}
            onChange={(values, formatStr) => {
                onChange(values || [null, null])
            }} />
    </div>
}

export type DatePickerProps = {
    showTime?: boolean
    quickSelect?: Omit<DateQuickSelectProps<QuickSelectEnum>, 'onChange' | 'quickSelectOptions'> & { options?: QuickSelectEnum[] }
    onChange: (date: Moment | null, quick?: QuickSelectEnum) => void
} & Omit<OriginDatePickerProps, 'onChange'>
export const DatePicker: React.FC<DatePickerProps> = ({
    showTime, quickSelect, value, onChange, ...rest
}) => {
    const optMap = getQuickDateMap()

    let displayValue = value
    if (quickSelect?.value) {
        displayValue = optMap[quickSelect.value]
    }

    return <div className={styles.container}>
        {quickSelect && <DateQuickSelect {...quickSelect}
            value={quickSelect.value}
            mode={quickSelect.mode}
            quickSelectOptions={quickSelect.options ?? [
                QuickSelectEnum.TODAY_START
            ]}
            onChange={(v) => {
                onChange(null, v as QuickSelectEnum | undefined)
            }}
        />}
        {/* @ts-ignore */}
        <OriginPicker {...rest} format={showTime ? DATE_CUSTOM_FORMAT.DATE_TIME : DATE_CUSTOM_FORMAT.DATE}
            showTime={showTime} value={displayValue} onChange={(value, formatStr) => {
                onChange(value)
            }} />
    </div>
}

export default {
    RangePicker, DatePicker
}