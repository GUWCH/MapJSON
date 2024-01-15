import React from 'react'
import { DataRecord } from 'PointCurve/type'
import { i18n } from './utils'
import { AutoFitTable } from 'AntTable'
import moment from 'moment'
import { DATE_CUSTOM_FORMAT } from '@/common/const-scada'

export type DataTableProps = {
    records: DataRecord[]
}

const DataTable: React.FC<DataTableProps> = ({
    records
}) => {
    return <AutoFitTable dataSource={records} columns={[
        {
            title: '',
            key: 'index',
            render(value, record, index) {
                return index + 1
            },
        }, {
            title: i18n('table.time'),
            dataIndex: 'time',
            render(value, record, index) {
                try{
                    const m = moment(value)
                    return m.format(DATE_CUSTOM_FORMAT.DATE_TIME)
                }catch(e){
                    console.error('convert time error',e)
                    return value
                }
            },
        }, {
            title: i18n('table.value'),
            dataIndex: 'value'
        }, {
            title: i18n('table.status'),
            dataIndex: 'status'
        }
    ]} />
}

export default DataTable