import React, { useEffect, useState } from 'react'
import { getAssetAlias } from '@/common/utils'
import PageCard, { PageCardConfig } from '../../components_utils/Card'
import WidgetContext from '../common/context'
import { PADPointAliasMapCfg } from '../PADWiringDiagram'
import TopologyContainer from './Topology'
import { FontIcon, IconType } from 'Icon'
import Configurator, { FactoryTopologyCfg } from './Configurator'
import msg, { msgTag } from '@/common/lang'
import styles from './index.module.scss'
import FactoryTopologyDiagramForm from './form'
import { DOMAIN_ENUM } from '@/common/constants'
import { useLocation } from 'react-router'
import { useWidgetMemory } from '../common/hooks'
import { notify } from 'Notify'

export type Candidates = {
    barrowRelatePointCandidates?: TPoint[]
    barrowRelatePointDomainId?: string
    barrowRelatePointModelId?: string
    barrowFieldsCandidates?: TPoint[]
    barrowFieldsDomainId?: string
    barrowFieldsModelId?: string
    padFieldsCandidates?: TPoint[]
    padFieldsDomainId?: string
    padFieldsModelId?: string
    subRelatePointCandidates?: TPoint[]
    subRelatePointDomainId?: string
    subRelatePointModelId?: string
    subFieldsCandidates?: TPoint[]
    subFieldsDomainId?: string
    subFieldsModelId?: string
}
/**
 * cfg 直接定义本组件接受属性，在面板组件里完成option到cfg的转化
 */
export type IFactoryTopologyDiagramFormCfg = {
    customAssetAlias?: string
    domain?: DOMAIN_ENUM
} & PADPointAliasMapCfg & PageCardConfig & Candidates

export const FactoryTopologyDiagramFormDefaultCfg: IFactoryTopologyDiagramFormCfg = {
    bg_enable: false,
    title: '场站电气拓扑图',
    title_en: 'Factory topology'
};

/**
 * option 影响右侧面板组件接受属性, 暂时没看出来有什么用
 */
export type IFactoryTopologyDiagramOptions = IFactoryTopologyDiagramFormCfg

export const FactoryTopologyDiagramDefaultOptions: IFactoryTopologyDiagramOptions = FactoryTopologyDiagramFormDefaultCfg

export type FactoryTopologyDiagramProps = {}
export { FactoryTopologyDiagramForm }

const defaultCfg: FactoryTopologyCfg = {
    barrow: [{ fields: [] }, { fields: [] }],
    pad: [],
    sub: { fields: [] }
}

const isSamePoint = (p1?: TPoint, p2?: TPoint) => {
    if (p1 === undefined || p2 === undefined) {
        return p1 === p2
    }
    return p1.alias === p2.alias && p1.tableNo === p2.tableNo && p1.fieldNo == p2.fieldNo
}

export const FactoryTopologyDiagramWidget: WidgetElement<IFactoryTopologyDiagramFormCfg> = (props) => {
    const { pageId, id } = props
    const alias = !!props.isDemo ? 'demo' : getAssetAlias(props.assetAlias, props.configure.customAssetAlias)
    if (!alias) {
        console.error('empty asset alias');
        return <div></div>
    }

    const location = useLocation()

    const getDefaultLineAlias = (search: string) => {
        if (!search) {
            return
        }
        const searchMap = search.slice(1).split('&').reduce((p, kv) => {

            const [k, v] = kv.split('=')
            if (k && v) {
                return {
                    ...p,
                    [k]: v
                }
            } else {
                return p
            }
        }, {} as { [key: string]: string })

        return searchMap['line']
    }
    const lineAliasFromSearch = getDefaultLineAlias(location.search || window.location.search)
    const lineAliasFromState = (location.state as { lineAlias?: string } | undefined)?.lineAlias

    const defaultLineAlias: string | undefined = lineAliasFromSearch || lineAliasFromState

    const [showCfg, setShowCfg] = useState(false)
    const [config, setConfig] = useState<FactoryTopologyCfg | undefined>()
    const { content: memoryContent, save: saveToMemory } = useWidgetMemory<FactoryTopologyCfg>(defaultCfg, {
        pageId: pageId, componentId: id, isDemo: props.isDemo
    })

    useEffect(() => {
        const {
            barrowFieldsCandidates,
            barrowRelatePointCandidates,
            padFieldsCandidates,
            subFieldsCandidates,
            subRelatePointCandidates
        } = props.configure
        if (memoryContent) {
            const padFields: TPointWithCfg[] = []
            memoryContent?.pad.forEach(pFromMemo => {
                const pFromCandidates = padFieldsCandidates?.find(c => isSamePoint(c, pFromMemo))
                if (pFromCandidates) {
                    padFields.push(Object.assign({}, pFromCandidates, { conf: pFromMemo.conf }))
                }
            })

            let subRelatePoint: TPointWithCfg | undefined = undefined
            const subRelatePointFromMemo = memoryContent?.sub.relatePoint
            if (subRelatePointFromMemo) {
                const pFromCandidates = subRelatePointCandidates?.find(c => isSamePoint(c, subRelatePointFromMemo))
                if (pFromCandidates) {
                    subRelatePoint = Object.assign({}, pFromCandidates, { conf: subRelatePointFromMemo.conf })
                }
            }

            const subFields: TPointWithCfg[] = []
            memoryContent?.sub.fields.forEach(pFromMemo => {
                const pFromCandidates = subFieldsCandidates?.find(c => isSamePoint(c, pFromMemo))
                if(pFromCandidates){
                    subFields.push(Object.assign({}, pFromCandidates, {conf: pFromMemo.conf}))
                }
            })

            setConfig({
                barrow: memoryContent?.barrow.map(b => {
                    let relatePoint: TPointWithCfg | undefined = undefined
                    const relatePointFromCfg = b.relatePoint
                    if (relatePointFromCfg) {
                        relatePoint = Object.assign({},
                            barrowRelatePointCandidates?.find(c => isSamePoint(c, relatePointFromCfg)),
                            { conf: relatePointFromCfg.conf }
                        )
                    }
                    const fields: TPointWithCfg[] = []
                    b.fields.forEach(p => {
                        const pFromCandidates = barrowFieldsCandidates?.find(c => isSamePoint(c, p))
                        if (pFromCandidates) {
                            fields.push(Object.assign({}, pFromCandidates, { conf: p.conf }))
                        }
                    })
                    return {
                        relatePoint: relatePoint,
                        fields: fields
                    }
                }) ?? [{ fields: [] }, { fields: [] }],
                pad: padFields,
                sub: {
                    relatePoint: subRelatePoint,
                    fields: subFields
                }
            })
        }
    }, [memoryContent, props.configure])

    return <WidgetContext.Provider value={{ pageId: props.pageId, componentId: props.id!, pageSign: props.pageSign, isDemo: !!props.isDemo }}>
        <PageCard {...props.configure} headerClassName={styles.card_header}
            extra={<div className={styles.config} onClick={e => setShowCfg(true)} >
                <FontIcon type={IconType.CONFIG} color={'#6a8ca3'} />
            </div>} >
            <div className={styles.container}>
                <TopologyContainer alias={alias} defaultLineAlias={defaultLineAlias} padAliasMap={props.configure.padPointMap} domain={props.configure.domain ?? DOMAIN_ENUM.WIND} config={config} />
                {showCfg && <Configurator
                    domain={props.configure.domain ?? DOMAIN_ENUM.WIND}
                    cfgInMemory={config}
                    candidates={{
                        barrow: {
                            relatePoint: props.configure.barrowRelatePointCandidates,
                            fields: props.configure.barrowFieldsCandidates
                        },
                        pad: props.configure.padFieldsCandidates,
                        sub: {
                            relatePoint: props.configure.subRelatePointCandidates,
                            fields: props.configure.subFieldsCandidates
                        }
                    }}
                    onSave={(cfg) => {
                        saveToMemory(cfg)
                            .then(() => {
                                setShowCfg(false)
                                notify(msgTag('pagetpl')('FACTORY_TOPOLOGY.config.saveSuccess'))
                            })
                            .catch(e => {
                                console.error('save to memory error', e);
                                notify(msgTag('pagetpl')('FACTORY_TOPOLOGY.config.saveFailed'))
                            })
                    }}
                    onClose={() => setShowCfg(false)} />}
            </div>
        </PageCard>
    </WidgetContext.Provider>
}