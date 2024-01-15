import { _dao, daoIsOk } from '@/common/dao'
import { convertModelPointToPoint } from '@/common/utils/model'
import React, { useEffect, useState, useContext } from 'react'

export type SystemInfos = {
    domainInfos?: IDomainInfo[]
    publicPoints?: Record<string, TPoint[] | undefined>
    warnTypes?: IWarnType[]
    hisWarnTypes?: IHisWarnType[]
    warnLevels?: IWarnLevel[]
}

export const defaultSystemInfos: SystemInfos = {
    domainInfos: [],
    warnTypes: [],
    warnLevels: []
}

export const SystemInfoContext = React.createContext<SystemInfos | null>(null)

export const SystemInfoProvider: React.FC<{
    withDomainInfo?: boolean
    withAllPublicPoints?: boolean
    withWarnLevel?: boolean
    withWarnType?: boolean
    withHisWarnType?: boolean
}> = ({
    withDomainInfo, withAllPublicPoints, withWarnLevel, withWarnType, withHisWarnType, children
}) => {
        const ctx = useContext(SystemInfoContext)
        const [_infos, _setInfos] = useState<SystemInfos>(defaultSystemInfos)
        const [infos, setInfos] = useState<SystemInfos>(defaultSystemInfos)

        useEffect(() => {
            const allPromise: Promise<unknown>[] = []

            if ((withDomainInfo || withAllPublicPoints) && !ctx?.domainInfos) {
                allPromise.push(_dao.getObjects().then(res => {
                    if (daoIsOk(res)) {
                        return {
                            domainInfos: res.data
                        }
                    } else {
                        console.error('fetch domain info error, res not ok');
                        return {
                            domainInfos: []
                        }
                    }
                }))
            }

            if (withWarnLevel && !ctx?.warnLevels) {
                allPromise.push(_dao.getAlarmLevel().then(res => {
                    if (daoIsOk(res)) {
                        return {
                            warnLevels: res.data
                        }
                    } else {
                        console.error('fetch warn level error, res not ok')
                        return {
                            warnLevels: []
                        }
                    }
                }))
            }

            if (withWarnType && !ctx?.warnTypes) {
                allPromise.push(_dao.getAlarmType().then(res => {
                    if (daoIsOk(res)) {
                        return {
                            warnTypes: res.data
                        }
                    } else {
                        console.error('fetch warn type error, res not ok')
                        return {
                            warnTypes: []
                        }
                    }
                }))
            }
            if (withHisWarnType && !ctx?.hisWarnTypes) {
                allPromise.push(_dao.getWarnOptionList().then(res => {
                    if (daoIsOk(res)) {
                        return {
                            hisWarnTypes: res.data[1].table_data
                        }
                    } else {
                        console.error('fetch hisWarnTypes error, res not ok')
                        return {
                            hisWarnTypes: []
                        }
                    }
                }))
            }

            Promise.all(allPromise)
                .then((results) => (results as SystemInfos[]).reduce((p, c) => {
                    return {
                        ...p,
                        ...c
                    }
                }, {} as SystemInfos))
                .then(infos => {
                    const domains = infos.domainInfos
                    if (domains?.length && withAllPublicPoints) {
                        return Promise.all(domains.flatMap(d => d.model_id_vec.map(m =>
                            _dao.getModelsById({ domain_id: d.domain_id, model_id: m.model_id, if_public: true })
                                .then(res => {
                                    if (daoIsOk(res)) {
                                        return { [m.model_id]: res.data.map(convertModelPointToPoint) }
                                    } else {
                                        console.error(`fetch point for model ${m.model_id},domain ${d.domain_id} failed`)
                                        return { [m.model_id]: [] }
                                    }
                                })
                        ))).then(ps => {
                            return {
                                ...infos,
                                publicPoints: ps.reduce((pre, cur) => ({ ...pre, ...cur }), {} as Record<string, TPoint[]>)
                            }
                        })
                    }
                    return infos
                })
                .then(infos => _setInfos(infos))
        }, [
            ctx,
            withDomainInfo,
            withWarnLevel,
            withWarnType,
            withAllPublicPoints
        ])

        useEffect(() => {
            setInfos({
                ...ctx,
                ..._infos
            })
        }, [_infos, ctx])

        return <SystemInfoContext.Provider value={infos}>
            {children}
        </SystemInfoContext.Provider>
    }

export default SystemInfoProvider