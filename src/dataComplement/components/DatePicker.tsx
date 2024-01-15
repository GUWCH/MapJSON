import React from 'react'
import {DatePicker, DatePickerProp,Row,Col} from 'antd'
import moment from 'moment'

function DatePickerComponent(props) {
    const {showTime = {}} = props
    const dateChange: DatePickerProps['onChange'] = (date, dateString) => {
        console.log(date, dateString);
    };
  return (
    
        <Col span={10} >
            <div className='dateLabel'>选择日期</div>
            <DatePicker.RangePicker 
                format={"YYYY-MM-DD HH:mm:ss"}
                className="datePickerDom" 
                size={'large'} 
                placeholder={['start Time','end TIme']}
                showTime={{
                    defaultValue: [
                        moment("00:00:00", "HH:mm:ss"),
                        moment("23:59:59", "HH:mm:ss"),
                    ],
                    ...showTime
                }}
                onChange={dateChange}/>
        </Col>
  )
}

export default DatePickerComponent