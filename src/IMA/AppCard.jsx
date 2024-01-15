import React from 'react'
import PropTypes from 'prop-types';
import styles from './AppCard.module.less'
import { Table, Tag, Space } from 'antd';
import dao from './dao'

const AppCard = ({ appName, logName, id, errorList, disableDownload }) => {

    const columns = [
        {
            title: '错误说明',
            dataIndex: 'errDeclare',
            key: 'errDeclare',
        },
        // {
        //     title: '错误类型',
        //     dataIndex: 'errType',
        //     key: 'errType',
        // },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
        },
        {
            title: '结束时间',
            dataIndex: 'finishTime',
            key: 'finishTime',
        },
        {
            title: '错误信息',
            dataIndex: 'errInfo',
            key: 'errInfo',
        },
        {
            title: '修复建议',
            dataIndex: 'repairSug',
            key: 'repairSug',
        }
    ];

    const download = () => {
        if(!disableDownload){
            dao.exportLog(id)
        }
    }

    return <div className={styles.container}>
        <div className={styles.header}>
            <span>应用名称： {appName}</span>
            {logName && id && <span>log日志： <span className={disableDownload? undefined:styles.link} onClick={download}>{logName}</span></span>}
        </div>

        <Table columns={columns} dataSource={errorList} pagination={{
            showSizeChanger: true,
            defaultPageSize: 5,
            pageSizeOptions: [5,10,20,50]
        }} />
    </div>
}

AppCard.propsType = {
    appName: PropTypes.string,
    logName: PropTypes.string,
    id: PropTypes.number,
    errorList: PropTypes.array
}

export default AppCard