import React, { useContext, useMemo, useState } from 'react'
import styles from './index.module.scss'
import { ComponentContext, convertMoment } from 'ParamsGenerator/utils'
import { SelectWithTitle } from 'Select/StyledAntSelect'
import { CompareSpan } from '../types'
import { DatePickerProps, QuickRangeSelectEnum, RangePicker, DatePicker, QuickSelectEnum, getQuickSelectOptions } from 'DatePicker'
import { RangeValue } from 'rc-picker/lib/interface'
import { Moment } from 'moment'
import { Checkbox, Space } from 'antd'

export const allSpan: CompareSpan[] = ['day', 'week', 'month', 'year', 'custom']
export const convertSpanToPicker = (span?: CompareSpan): DatePickerProps['picker'] => {
    if (!span) return undefined
    switch (span) {
        case "day": return undefined
        case "week": return 'week'
        case "month": return 'month'
        case "year": return 'year'
        default: return 'time'
    }
}

type CompareValue = {
    base?: {
        quick?: QuickSelectEnum
        date?: Moment | null
    }
    compare?: {
        quick?: QuickSelectEnum[]
        date?: Moment | null
    }
}
type CustomValue = {
    dateValue?: RangeValue<Moment>
    quickValue?: QuickRangeSelectEnum
}
export type CompareRangePickerProps = {
    hideTitle?: boolean
    span?: CompareSpan
    customRangeValue?: CustomValue
    value?: CompareValue
    onChange: (span: CompareSpan, value?: CompareValue, customValue?: CustomValue) => void
}

const CompareRangePicker: React.FC<CompareRangePickerProps> = ({
    hideTitle, span = 'day', customRangeValue, value, onChange
}) => {
    const { locale: { templateProtoRender: locale } } = useContext(ComponentContext)
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(!!value?.compare?.date)
    const [customDatePickerOpen, setCustomDatePickerOpen] = useState<boolean | undefined>()
    const [compareOpen, setCompareOpen] = useState(false)
    const customCompareKey = 'custom-compare'
    const options = useMemo(() => {
        if (span === 'day') {
            return {
                quickOptions: [
                    QuickSelectEnum.TODAY_START, QuickSelectEnum.YESTODAY_START
                ],
                compareOptions: getQuickSelectOptions([
                    QuickSelectEnum.COMPARE_LAST_DAY, QuickSelectEnum.COMPARE_DAY_OF_LAST_MONTH, QuickSelectEnum.COMPARE_DAY_OF_LAST_YEAR
                ])
            }
        }
        if (span === 'week') {
            return {
                quickOptions: [
                    QuickSelectEnum.THIS_WEEK_START, QuickSelectEnum.LAST_WEEK_START
                ],
                compareOptions: getQuickSelectOptions([
                    QuickSelectEnum.COMPARE_LAST_WEEK, QuickSelectEnum.COMPARE_WEEK_OF_LAST_YEAR
                ])
            }
        }
        if (span === 'month') {
            return {
                quickOptions: [
                    QuickSelectEnum.THIS_MONTH_START, QuickSelectEnum.LAST_MONTH_START
                ],
                compareOptions: getQuickSelectOptions([
                    QuickSelectEnum.COMPARE_LAST_MONTH, QuickSelectEnum.COMPARE_MONTH_OF_LAST_YEAR
                ])
            }
        }
        if (span === 'year') {
            return {
                quickOptions: [
                    QuickSelectEnum.THIS_YEAR_START, QuickSelectEnum.LAST_YEAR_START
                ],
                compareOptions: getQuickSelectOptions([
                    QuickSelectEnum.COMPARE_LAST_YEAR
                ])
            }
        }
    }, [span])

    const convertDateBySpan = (date: Moment | null) => {
        if(!date) return date
        switch (span) {
            case 'week': return date.startOf('isoWeek')
            case 'month': return date.startOf('month')
            case 'year': return date.startOf('year')
            default: return date
        }
    }

    return <div>
        {!hideTitle && <div className={styles.name + ' ' + styles.require}>{locale.time}</div>}
        <div className={styles.compare}>
            <SelectWithTitle innerName={{
                text: locale.ruleName.span,
            }} options={allSpan.map(s => ({
                label: locale.spanEnum[s],
                value: s
            }))} value={span} onChange={v => {
                onChange(v, undefined, undefined)
            }} />
            {span === 'custom' ? <RangePicker
                showTime
                quickSelect={{
                    mode: 'select',
                    value: customRangeValue?.quickValue,
                }}
                value={customRangeValue?.dateValue}
                onChange={(dates, quick) => {
                    onChange(span, undefined, {
                        dateValue: dates,
                        quickValue: quick
                    })
                }} /> : <>
                <DatePicker
                    showTime={span === 'day'}
                    quickSelect={{
                        mode: 'select',
                        options: options?.quickOptions,
                        value: value?.base?.quick,
                    }}
                    value={value?.base?.date}
                    picker={convertSpanToPicker(span)}
                    onChange={(date, quick) => {
                        onChange(span, {
                            base: {
                                date: convertDateBySpan(date), quick
                            },
                            compare: value?.compare
                        })
                    }}
                />
                <SelectWithTitle
                    mode='multiple'
                    open={compareOpen}
                    onDropdownVisibleChange={v => {
                        setCompareOpen(v || !!customDatePickerOpen)
                    }}
                    innerName={{
                        text: locale.compareTime
                    }}
                    value={(value?.compare?.date ? [''] : []).concat(value?.compare?.quick ?? [])}
                    dropdownMatchSelectWidth={false}
                    dropdownRender={(node) => {
                        const ops = options?.compareOptions ?? [] as {
                            key: string,
                            label: string,
                            value: string
                        }[]
                        return <div className={styles.compare__custom}>
                            {ops.concat({
                                key: customCompareKey,
                                label: locale.custom,
                                value: customCompareKey
                            }).map(o => {
                                const checked = value?.compare?.quick?.includes(o.value as QuickSelectEnum)
                                    || (o.key === customCompareKey && showCustomDatePicker)
                                return <Checkbox key={o.key} checked={checked}
                                    value={o.value}
                                    onChange={v => {
                                        if (o.key === customCompareKey) {
                                            setShowCustomDatePicker(v.target.checked)
                                            if (!v.target.checked) {
                                                setCustomDatePickerOpen(false)
                                                onChange(span, {
                                                    base: value?.base,
                                                    compare: {
                                                        quick: value?.compare?.quick,
                                                        date: null
                                                    }
                                                })
                                            }
                                        } else {
                                            onChange(span, {
                                                base: value?.base,
                                                compare: {
                                                    quick: v.target.checked ?
                                                        (value?.compare?.quick ?? []).concat(o.value as QuickSelectEnum) :
                                                        value?.compare?.quick?.filter(q => q !== o.value),
                                                    date: value?.compare?.date
                                                }
                                            })
                                        }
                                    }}
                                >
                                    {o.label}
                                </Checkbox>
                            })}
                            {showCustomDatePicker && <DatePicker
                                showTime={span === 'day'}
                                value={value?.compare?.date}
                                picker={convertSpanToPicker(span)}
                                onOpenChange={o => setCustomDatePickerOpen(o)}
                                onChange={(date) => {
                                    onChange(span, {
                                        base: value?.base,
                                        compare: {
                                            quick: value?.compare?.quick,
                                            date: convertDateBySpan(date) 
                                        }
                                    })
                                }}
                            />}
                        </div>
                    }}
                />
            </>}
        </div>
    </div>
}

export default CompareRangePicker