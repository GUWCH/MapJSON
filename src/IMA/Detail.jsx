import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import styles from './Detail.module.less'
import { useSearchParams } from './utils';
import IMADao from './dao'
import AppCard from './AppCard';

const Detail = (props) => {

    const [data, setData] = useState({
        app: []
    })
    const idStr = useSearchParams().get('id')
    const taskId = idStr? parseInt(idStr): null;

    useEffect(() => {
        if (taskId) {
            IMADao.getWarningDetail(taskId).then(r => setData(r))
        } else {
            console.error('this page require a url param named "id"')
        }
    }, [taskId])


    const exportDetail = () => {
        IMADao.exportList(taskId)
    }

    return <div className={styles.container}>
        <div className={styles.header}>
            <div>机器IP： {data.hostIp}</div>
            <div>最近执行时间： {data.lastExecTime}</div>
            <div>子系统编号： {data.systemNo}</div>
            <div>角色： {data.scadaRole}</div>
            <div className={styles.download} onClick={exportDetail} />
        </div>
        <div className={styles.main}>
            {data && data.app.map(v => 
            <AppCard key={v.appName} appName={v.appName} 
            id={v.jobId} logName={v.logFile} disableDownload={!!data.isSync}
            errorList={v.errorList} />)}
        </div>
    </div>
}

export default Detail