import React, {useEffect, useRef, useState} from "react";
import { Select, DatePicker } from "antd";
import {PICKER, DATE_TYPE, getDefaultCustomizeRange, defaultRangeNum, granularityUnits} from './constant';
import moment from "moment";
import type { Moment } from 'moment';

const { Option } = Select;

const { RangePicker } = DatePicker;

type RangeValue = [Moment | null, Moment | null] | null;

const TimeSelect = (props) => {

    const {granularOptions = [], onChange, contentData = []} = props;

    const [value, setValue] = useState(granularOptions[0]?.value || '');
    const [date, setDate] = useState(moment());
    const {tplRangeNum = defaultRangeNum, tplRangeUnit = granularityUnits[0].value} 
        = contentData.find(d => d.tplTimeGran === DATE_TYPE.CUSTOMIZE) || {};
    const [dates, setDates] = useState<RangeValue>(getDefaultCustomizeRange(tplRangeNum, tplRangeUnit));

    let time = useRef(moment());

    useEffect(() => {
        if(!value && granularOptions.length > 0){
            setValue(granularOptions[0].value)
        }
    }, [granularOptions])


    useEffect(() => {
        if(value === DATE_TYPE.CUSTOMIZE){
            onChange(value, getDefaultCustomizeRange(tplRangeNum, tplRangeUnit));
        }else{
            onChange(value, moment());
        }
        
    }, [value])

    const handleGranularChange = (v) => {
        setValue(v);
        setDate(moment());
    }

    const handleRangeChange = (date, dateString) => {
        time.current = date;
        onChange(value, date);
        setDate(date);
    }

    const disabledDate = (current: Moment) => {
        if (!dates) {
          return false;
        }

        const tooLate = dates[0] && current.diff(dates[0], tplRangeUnit) >= tplRangeNum;
        const tooEarly = dates[1] && dates[1].diff(current, tplRangeUnit) >= tplRangeNum;
        return !!tooEarly || !!tooLate;
    };

    return (
        <>
            <Select
                value={value}
                onChange = {handleGranularChange}
                style = {{width: '120px'}}
            >
                {
                   granularOptions.map((option, index) => {
                       return <Option key={index} value={option.value}>{option.name}</Option>
                   })
                }
            </Select>
            {value === DATE_TYPE.CUSTOMIZE ?
            <RangePicker 
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                defaultValue = {getDefaultCustomizeRange(tplRangeNum, tplRangeUnit)}
                onChange = {(dates, dateStrings) => {onChange(DATE_TYPE.CUSTOMIZE, dates?.map(date => date?.clone()))}}
                onCalendarChange={val => setDates(val)}
                {...(tplRangeNum ? {disabledDate: disabledDate} : {})}
            />
            : <DatePicker 
                allowClear = {false}
                defaultValue = {moment()}
                value={date}
                picker = {PICKER[value] || ''}
                disabled = {PICKER[value] ? false : true}
                onChange = {handleRangeChange}
            />}
        </>
    )
}

export default TimeSelect;