import { _dao } from '@/common/dao';
import { msgTag } from '@/common/lang';
import { isZh } from '@/common/util-scada';
import { PrimaryButton } from 'Button';
import Empty from 'Empty';
import { notify } from 'Notify';
import ParamsGenerator, { RuntimeChangeTrigger } from 'ParamsGenerator';
import { ProtoKeys } from 'ParamsGenerator/constant';
import { Template } from 'ParamsGenerator/types';
import { getDataExportParams } from 'ParamsGenerator/utils';
import SystemInfoProvider, { SystemInfoContext } from 'SystemInfoProvider';
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import React, { useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import '../common/css/app.scss';
import DataExportTable from './DataExportTable';
import styles from './index.module.scss';

const i18n = msgTag('dataExport')

const Page = () => {
    const [refreshTrigger, setTrigger] = useState(0)
    const [runtimeTpl, setRuntimeTpl] = useState<Omit<Template, 'key'>>()
    const domainInfos = useContext(SystemInfoContext)?.domainInfos ?? []

    useEffect(() => {
        window.g_web_cfg && (window.g_web_cfg.globalHeartBeat = false) //该页面无需心跳
    }, [])

    const handleExport = async (tpl: Omit<Template, 'key'>) => {
        const params = getDataExportParams(tpl, domainInfos)
        if (params) {
            const res = await _dao.runMultiDataExport(params)
            if (res && String(res.code) === '10000') {
                notify(i18n('triggerSuc'))
            } else if (res && String(res.code) === '21000') {
                notify(i18n('reachLimit'))
            } else {
                notify(res.message)
            }
            setTrigger(old => old + 1)
        }
    }

    return <div className={styles.page}>
        <ParamsGenerator
            tplType={'data_export'}
            enabledProtoKeys={[ProtoKeys.points, ProtoKeys.SOE, ProtoKeys.warn]}
            runtimeTpl={runtimeTpl}
            onRuntimeTplChange={(tpl, trigger) => {
                setRuntimeTpl(tpl)
                if (!tpl) return
                if (trigger === RuntimeChangeTrigger.CREATE_TEMP || trigger === RuntimeChangeTrigger.CREATE_TPL) {
                    handleExport(tpl)
                }
            }}
            textContext={{
                templateEditor: {
                    save: i18n('paramsGenerator.templateEditor.save'),
                    add: i18n('paramsGenerator.templateEditor.add'),
                    ruleGroup: i18n('paramsGenerator.templateEditor.ruleGroup'),
                },
                templateProtoRender: {
                    rules: i18n('paramsGenerator.templateProtoRender.rules'),
                }
            }}
            actionRender={() => {
                return <div style={{ width: 'max-content' }}>
                    <PrimaryButton onClick={() => runtimeTpl && handleExport(runtimeTpl)}>
                        {i18n('runExport')}
                    </PrimaryButton>
                </div>
            }}
        />
        <DataExportTable outerRefreshTrigger={refreshTrigger} containerCls={styles.table} />
    </div>
}

const App = () => {
    return <ConfigProvider locale={isZh ? zhCN : enUS} renderEmpty={() => <Empty />}>
        <SystemInfoProvider withDomainInfo withWarnLevel withHisWarnType>
            <Page />
        </SystemInfoProvider>
    </ConfigProvider>
}

if (process.env.NODE_ENV === 'development') {
    import('./dev.css')
    ReactDOM.render(<App />, document.getElementById('center'))
} else {
    ReactDOM.render(<App />, document.getElementById('container'))
}