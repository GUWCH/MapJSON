import { DefaultButton, PrimaryButton } from 'Button'
import { FontIcon, IconType } from 'Icon'
import { StyledModal, confirm } from 'Modal'
import List from 'PointSelector/List'
import { InputNumber } from 'antd'
import React, { useEffect, useState, useMemo } from 'react'
import styles from './Configurator.module.scss'
import { Info } from './type'
import { msgTag } from '@/common/lang'
import { combinePointKey } from '@/common/utils/model'

const i18n = msgTag('PointCurve')

export type Config = {
    infos: Info[]
    common?: {
        left?: {
            max?: number
            min?: number
        }
        right?: {
            max?: number
            min?: number
        }
    }
}
export type ConfiguratorProps = {
    config?: Config
    onSave: (cfg: Config) => void
    onCancel: () => void
}

const Configurator: React.FC<ConfiguratorProps> = ({
    config, onSave, onCancel
}) => {
    const [temp, setTemp] = useState<Config>()
    const pointsWithConf = useMemo(() => temp?.infos.map(info => ({
        ...info.originPointInfo,
        key: info.key,
        nameCn: info.nameCn,
        nameEn: info.nameEn
    })), [temp])
    const originPointNameMap = useMemo(() => config?.infos.reduce((pre, cur) => ({
        ...pre,
        [cur.key]: {
            nameCn: cur.originPointInfo.nameCn,
            nameEn: cur.originPointInfo.nameEn
        }
    }), {} as Record<string, { nameCn: string, nameEn: string } | undefined>) ?? {}, [config])

    useEffect(() => {
        if (config) {
            setTemp(config)
        }
    }, [config])

    return <StyledModal visible closable={false} onCancel={onCancel}
        width={300}
        title={<div className={styles.header}>
            <div>{i18n('config')}</div>
            <div className={styles.reset} onClick={() => {
                confirm({
                    title: i18n('resetConfirmTitle'),
                    content: i18n('resetConfirmContent'),
                    onOk: () => { setTemp(config) }
                })
            }}>
                <FontIcon type={IconType.RESET} style={{ marginRight: 5 }} />
                {i18n('reset')}
            </div>
        </div>}
        footer={<div className={styles.footer}>
            <DefaultButton
                onClick={onCancel}
            >{i18n('cancel')}</DefaultButton>
            <PrimaryButton
                disabled={temp === config}
                onClick={() => {
                    if (temp) {
                        onSave(temp)
                    }
                }}
            >{i18n('save')}</PrimaryButton>
        </div>}>
        <div className={styles.list}>
            {temp && <List
                enableConfigs={['showTitle', 'yxCondition', 'convert', 'colorSet', 'axis', 'isAccumulate', 'lineChart']}
                data={pointsWithConf ?? []}
                onChange={v => setTemp(pre => {
                    const newInfos: Info[] = []
                    v.forEach(p => {
                        const preInfo = pre?.infos.find(i => i.key === p.key)
                        if (preInfo) {
                            const originNames = originPointNameMap[p.key]
                            newInfos.push({
                                ...preInfo,
                                originPointInfo: {
                                    ...p,
                                    key: combinePointKey(p),
                                    nameCn: originNames?.nameCn ?? '',
                                    nameEn: originNames?.nameEn ?? ''
                                }
                            })
                        }
                    })
                    return { ...pre, infos: newInfos }
                })}
            />}
        </div>
        <div className={styles.common}>
            <div>
                <span>{i18n('commonAxisL')}</span>
                <span>
                    <InputNumber
                        type='number'
                        className={styles.input}
                        value={temp?.common?.left?.min}
                        onChange={v => setTemp(pre => ({
                            infos: pre?.infos ?? [],
                            common: {
                                right: pre?.common?.right,
                                left: {
                                    min: v, max: pre?.common?.left?.max
                                }
                            }
                        }))} />
                    <InputNumber
                        type='number'
                        className={styles.input}
                        value={temp?.common?.left?.max}
                        onChange={v => setTemp(pre => ({
                            infos: pre?.infos ?? [],
                            common: {
                                right: pre?.common?.right,
                                left: {
                                    max: v, min: pre?.common?.left?.min
                                }
                            }
                        }))}
                    />
                </span>
            </div>
            <div>
                <span>{i18n('commonAxisR')}</span>
                <span>
                    <InputNumber
                        type='number'
                        className={styles.input}
                        value={temp?.common?.right?.min}
                        onChange={v => setTemp(pre => ({
                            infos: pre?.infos ?? [],
                            common: {
                                left: pre?.common?.left,
                                right: {
                                    min: v, max: pre?.common?.right?.max
                                }
                            }
                        }))}
                    />
                    <InputNumber
                        type='number'
                        className={styles.input}
                        value={temp?.common?.right?.max}
                        onChange={v => setTemp(pre => ({
                            infos: pre?.infos ?? [],
                            common: {
                                left: pre?.common?.left,
                                right: {
                                    max: v, min: pre?.common?.right?.min
                                }
                            }
                        }))}
                    />
                </span>
            </div>
        </div>
    </StyledModal>
}

export default Configurator