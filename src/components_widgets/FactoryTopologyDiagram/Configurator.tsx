import { DOMAIN_ENUM } from '@/common/constants'
import { msgTag } from '@/common/lang'
import { Collapse, Modal, Space } from 'antd'
import { DefaultButton, PrimaryButton } from 'Button'
import { notify } from 'Notify'
import React, { useEffect } from 'react'
import { useMultiplePointConfiguration, useSinglePointConfiguration } from '../common/components/PointConfiguration'
import { useWidgetMemory } from '../common/hooks'
import styles from './Configurator.module.scss'
const { Panel } = Collapse
const msg = msgTag('pagetpl')

const i18n = {
    config: {
        assetStatus: msg('FACTORY_TOPOLOGY.config.assetStatus'),
        relatedPoint: msg('FACTORY_TOPOLOGY.config.relatedPoint'),
        field: msg('FACTORY_TOPOLOGY.config.field'),
        save: msg('FACTORY_TOPOLOGY.config.save'),
        cancel: msg('FACTORY_TOPOLOGY.config.cancel'),
        saveSuccess: msg('FACTORY_TOPOLOGY.config.saveSuccess'),
        saveFailed: msg('FACTORY_TOPOLOGY.config.saveFailed'),
        barrow: msg('FACTORY_TOPOLOGY.config.barrow'),
        pad: msg('FACTORY_TOPOLOGY.config.pad'),
        turbine: msg('FACTORY_TOPOLOGY.config.sub.turbine'),
        matrix: msg('FACTORY_TOPOLOGY.config.sub.matrix'),
        sys: msg('FACTORY_TOPOLOGY.config.sub.sys'),
    }
}

export type FactoryTopologyCfg = {
    barrow: {
        relatePoint?: TPointWithCfg,
        fields: TPointWithCfg[]
    }[],
    pad: TPointWithCfg[],
    sub: {
        relatePoint?: TPointWithCfg,
        fields: TPointWithCfg[]
    }
}
export type ConfiguratorProps = {
    domain: DOMAIN_ENUM,
    cfgInMemory?: FactoryTopologyCfg
    candidates?: {
        barrow?: {
            relatePoint?: TPoint[]
            fields?: TPoint[]
        }
        pad?: TPoint[]
        sub?: {
            relatePoint?: TPoint[]
            fields?: TPoint[]
        }
    }
    onSave: (cfg: FactoryTopologyCfg) => void,
    onClose: () => void
}

const Configurator: React.FC<ConfiguratorProps> = ({
    domain, cfgInMemory, candidates, onSave, onClose
}) => {


    // const { data: startBarrowRelatePoint, configContent: startBarrowRelateCfgContent } = useSinglePointConfiguration({
    //     name: i18n.config.relatedPoint,
    //     initialCandidates: candidates?.barrow?.relatePoint,
    //     pointWithConf: memoryContent?.barrow?.[0]?.relatePoint,
    //     enableConfig: {
    //         colorSet: true,
    //     }
    // })

    // const { data: startBarrowFields, configContent: startBarrowFieldsCfgContent } = useMultiplePointConfiguration({
    //     initialCandidates: candidates?.barrow?.fields,
    //     pointWithConfArr: memoryContent?.barrow?.[0]?.fields,
    //     removeable: true,
    //     enableConfig: {
    //         showTitle: true,
    //         condition: true,
    //         convert: true,
    //         colorSet: true,
    //     }
    // })

    // const { data: endBarrowRelatePoint, configContent: endBarrowRelateCfgContent } = useSinglePointConfiguration({
    //     name: i18n.config.relatedPoint,
    //     initialCandidates: candidates?.barrow?.relatePoint,
    //     pointWithConf: memoryContent?.barrow?.[1]?.relatePoint,
    //     enableConfig: {
    //         colorSet: true,
    //     }
    // })

    // const { data: endBarrowFields, configContent: endBarrowFieldsCfgContent } = useMultiplePointConfiguration({
    //     initialCandidates: candidates?.barrow?.fields,
    //     pointWithConfArr: memoryContent?.barrow?.[1]?.fields,
    //     removeable: true,
    //     enableConfig: {
    //         showTitle: true,
    //         condition: true,
    //         convert: true,
    //         colorSet: true,
    //     }
    // })

    const { data: padFields, configContent: padCfgContent } = useMultiplePointConfiguration({
        initialCandidates: candidates?.pad,
        pointWithConfArr: cfgInMemory?.pad,
        removeable: true,
        enableConfigs: ['showTitle', 'condition', 'convert', 'colorSet']

    })

    const { data: subRelatePoint, configContent: subRelateCfgContent } = useSinglePointConfiguration({
        name: i18n.config.relatedPoint,
        initialCandidates: candidates?.sub?.relatePoint,
        pointWithConf: cfgInMemory?.sub.relatePoint,
        enableConfigs: ['colorSet']
    })

    const { data: subFields, configContent: subFieldsCfgContent } = useMultiplePointConfiguration({
        initialCandidates: candidates?.sub?.fields,
        pointWithConfArr: cfgInMemory?.sub.fields,
        removeable: true,
        enableConfigs: ['showTitle', 'condition', 'convert', 'colorSet']
    })

    const handleSave = () => {
        const newCfg: FactoryTopologyCfg = {
            barrow: [
                // {
                //     relatePoint: startBarrowRelatePoint,
                //     fields: startBarrowFields
                // },
                // {
                //     relatePoint: endBarrowRelatePoint,
                //     fields: endBarrowFields
                // },
            ],
            pad: padFields,
            sub: {
                relatePoint: subRelatePoint,
                fields: subFields
            }
        }

        onSave(newCfg)
    }

    let subCfgName: string
    switch (domain) {
        case DOMAIN_ENUM.WIND: {
            subCfgName = i18n.config.turbine
            break
        }
        case DOMAIN_ENUM.SOLAR: {
            subCfgName = i18n.config.matrix
            break
        }
        default: {
            subCfgName = i18n.config.sys
        }
    }

    return <Modal
        destroyOnClose={true}
        centered={true}
        visible={true}
        width={300}
        closable={false}
        onCancel={onClose}
        footer={<Space size={'small'} direction={'horizontal'}>
            <DefaultButton
                onClick={onClose}
            >{i18n.config.cancel}</DefaultButton>
            <PrimaryButton
                onClick={() => handleSave()}
            >{i18n.config.save}</PrimaryButton>
        </Space>}
    >
        <div className={styles.content}>
            {/* <Collapse className={styles.collapse}>
                    <Panel key={'barrow'} className={styles.panel} header={i18n.config.barrow + '1'}>
                        <Collapse className={styles.collapse} defaultActiveKey={['assetStatus', 'field']}>
                            <Panel key={'assetStatus'} className={styles.panel_inner} header={i18n.config.assetStatus}>
                                {startBarrowRelateCfgContent}
                            </Panel>
                            <Panel key={'field'} className={styles.panel_inner} header={i18n.config.field}>
                                {startBarrowFieldsCfgContent}
                            </Panel>
                        </Collapse>
                    </Panel>
                </Collapse>
                <Collapse className={styles.collapse}>
                    <Panel key={'barrow'} className={styles.panel} header={i18n.config.barrow + '2'}>
                        <Collapse className={styles.collapse} defaultActiveKey={['assetStatus', 'field']}>
                            <Panel key={'assetStatus'} className={styles.panel_inner} header={i18n.config.assetStatus}>
                                {endBarrowRelateCfgContent}
                            </Panel>
                            <Panel key={'field'} className={styles.panel_inner} header={i18n.config.field}>
                                {endBarrowFieldsCfgContent}
                            </Panel>
                        </Collapse>
                    </Panel>
                </Collapse> */}
            <Collapse className={styles.collapse}>
                <Panel key={'pad'} className={styles.panel} header={i18n.config.pad}>
                    {padCfgContent}
                </Panel>
            </Collapse>
            <Collapse className={styles.collapse}>
                <Panel key={'sub'} className={styles.panel} header={subCfgName}>
                    <Collapse className={styles.collapse} defaultActiveKey={['assetStatus', 'field']}>
                        <Panel key={'assetStatus'} className={styles.panel_inner} header={i18n.config.assetStatus}>
                            {subRelateCfgContent}
                        </Panel>
                        <Panel key={'field'} className={styles.panel_inner} header={i18n.config.field}>
                            {subFieldsCfgContent}
                        </Panel>
                    </Collapse>
                </Panel>
            </Collapse>
        </div>
    </Modal>
}

export default Configurator