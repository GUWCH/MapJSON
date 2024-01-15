import { TPointType } from '@/common/constants'
import { _dao, daoIsOk } from '@/common/dao'
import { msgTag } from '@/common/lang'
import { isZh } from '@/common/util-scada'
import { combinePointKey, convertModelPointToPoint, getPointTypeNameByType } from '@/common/utils/model'
import { SearchOutlined } from '@ant-design/icons'
import { AssetTreeSelectorWithReq } from 'AssetPicker/AssetTree'
import Empty from 'Empty'
import { FontIcon } from 'Icon'
import iconsMap from 'Icon/iconsMap'
import { PointTree, PointTreeProps } from 'PointSelector/Tree'
import ButtonRadio from 'Radio/ButtonRadioGroup'
import { SelectWithTitle } from 'Select/StyledAntSelect'
import { Input, Space, Tooltip } from 'antd'
import _ from 'lodash'
import React, { useContext, useEffect, useState, useMemo } from 'react'
import styles from './index.module.scss'
import { TAsset } from 'AssetPicker/type'
import SystemInfoProvider, { SystemInfoContext } from 'SystemInfoProvider'

const i18n = msgTag('AssetAndPointPicker')

export const defaultTextContext: TextContext = {
    stepName: {
        1: i18n('stepName.1'),
        2: i18n('stepName.2'),
        3: i18n('stepName.3'),
    },
    warn: {
        lackDomainData: i18n('warn.lackDomainData'),
        lackAssetData: i18n('warn.lackAssetData'),
    }
}

export type TextContext = {
    stepName?: {
        1?: string
        2?: string
        3?: string
    },
    warn?: {
        lackDomainData?: string
        lackAssetData?: string
    }
}

export const AssetAndPointPickerTextContext = React.createContext(defaultTextContext)

export type PickerValue = {
    domainValues?: {
        domainId?: string
        modelId?: string
        deviceModel?: string
    }
    assets?: TAsset[]
    points?: Partial<Record<TPointType, TPoint[] | undefined>>
}
export type AssetAndPointPickerProps = {
    withPoint?: boolean
    withAsset?: boolean
    value?: PickerValue
    pointTypes?: TPointType[]
    forceMultiAsset?: boolean // true 资产强制多选   false 资产强制单选   undefined 根据型号判断
    onValueChange?: (v: PickerValue) => void
}

const AssetAndPointPicker: React.FC<AssetAndPointPickerProps> = ({
    withPoint, withAsset, value, pointTypes = ['YX', 'YC', 'PROD'], forceMultiAsset, onValueChange
}) => {
    const domainInfos = useContext(SystemInfoContext)?.domainInfos ?? []
    const i18nContext = useContext(AssetAndPointPickerTextContext)
    const [currentPointType, setPointType] = useState<TPointType>(pointTypes[0])

    const handleValueChange = (v: PickerValue) => {
        onValueChange && onValueChange({
            domainValues: Object.assign({}, value?.domainValues, v.domainValues),
            assets: v.assets ?? value?.assets,
            points: v.points ?? value?.points
        })
    }

    const currentDomain = domainInfos.find(d => d.domain_id === value?.domainValues?.domainId)
    const currentModel = currentDomain?.model_id_vec?.find(m => m.model_id === value?.domainValues?.modelId)
    const ifMultiAsset = forceMultiAsset === undefined ? !!value?.domainValues?.deviceModel : forceMultiAsset

    const lackStep1 = value?.domainValues?.domainId && value.domainValues.modelId ? undefined :
        <div><Empty text={i18nContext.warn?.lackDomainData} /></div>

    const lackStep2 = value?.assets && value.assets.length > 0 ? undefined :
        <div><Empty text={i18nContext.warn?.lackAssetData} /></div>

    return <div className={styles.container}>
        <div className={styles.domain}>
            <div className={styles.title}>
                <div className={styles.name}>
                    1.{i18nContext.stepName?.[1]}
                </div>
            </div>
            <Space className={styles.content} size={'small'} direction='vertical'>
                <SelectWithTitle customCls={{ select: styles.select_long }}
                    value={value?.domainValues?.domainId}
                    innerName={{
                        text: i18n('domain'),
                        required: true
                    }}
                    options={domainInfos.map(info => ({
                        key: info.domain_id,
                        value: info.domain_id,
                        label: isZh ? info.domain_name_cn : info.domain_name
                    }))}
                    onChange={v => {
                        handleValueChange({
                            domainValues: { domainId: v, modelId: undefined, deviceModel: undefined },
                            assets: [],
                            points: {}
                        })
                    }} />
                <SelectWithTitle customCls={{ select: styles.select_long }}
                    value={value?.domainValues?.modelId}
                    innerName={{
                        text: i18n('model'),
                        required: true
                    }}
                    options={currentDomain?.model_id_vec.map(m => {
                        return {
                            key: m.model_id,
                            value: m.model_id,
                            label: isZh ? m.model_name_cn : m.model_name
                        }
                    })}
                    onChange={v => {
                        handleValueChange({
                            domainValues: { modelId: v, deviceModel: undefined },
                            assets: [],
                            points: {}
                        })
                    }} />
                <div className={styles['device-model']}>
                    <SelectWithTitle customCls={{ select: styles.select_short }}
                        value={value?.domainValues?.deviceModel}
                        innerName={{
                            text: i18n('deviceModel')
                        }}
                        allowClear
                        options={currentModel?.device_model_list?.map(t => ({ key: t, value: t, label: t }))
                            .concat({ key: '', value: '', label: i18n('other') })}
                        onChange={v => {
                            handleValueChange({
                                domainValues: { deviceModel: v },
                                assets: [],
                                points: {}
                            })
                        }}
                    />
                    {forceMultiAsset === undefined && <Tooltip overlayClassName={styles.help} title={i18n('deviceModelHelp')}>
                        <FontIcon type={iconsMap.INFO_CIRCLE} />
                    </Tooltip>}
                </div>
            </Space>
        </div>
        {withAsset && <div className={styles.asset}>
            <div className={styles.title}>
                <div className={styles.name}>
                    2.{i18nContext.stepName?.[2]}
                </div>
                <div className={styles.selected}>
                    <div>
                        {i18n('selected')}
                        <div className={styles.count}>
                            {(value?.assets ?? []).length}
                        </div>
                    </div>
                </div>
            </div>
            {lackStep1 ? lackStep1 : <AssetTreeSelectorWithReq
                key={value?.domainValues?.modelId + '_' + value?.domainValues?.deviceModel}
                modelId={value?.domainValues?.modelId}
                multiple={ifMultiAsset}
                deviceModel={value?.domainValues?.deviceModel}
                selectedKeys={value?.assets?.map(a => a.key)}
                onChange={(items) => handleValueChange(Object.assign({ assets: items }, ifMultiAsset ? undefined : { points: {} }))}
                customCls={{
                    search: styles.asset_search
                }}
            />}
        </div>}
        {withPoint && <div className={styles.point}>
            <div className={styles.title}>
                <div className={styles.name}>
                    3.{i18nContext.stepName?.[3]}
                </div>
                <div className={styles.selected}>
                    <ButtonRadio noWrap containerCls={styles.type} value={currentPointType} options={pointTypes.map(t => ({
                        label: <div className={styles.label}>
                            {getPointTypeNameByType(t)}
                            <div className={styles.count}>
                                {(value?.points?.[t] ?? []).length}
                            </div>
                        </div>,
                        value: t
                    }))} onChange={t => setPointType(t as TPointType)} />
                </div>
            </div>
            {lackStep1 ? lackStep1 : (lackStep2 ? lackStep2 : <PointsContent key={currentPointType}
                type={currentPointType} assetAlias={value?.assets?.[0].key ?? ''}
                selectedKeys={value?.points?.[currentPointType]?.map(p => combinePointKey(p))}
                onChange={ps => {
                    handleValueChange({
                        points: {
                            ...value?.points,
                            [currentPointType ?? 'OTHER']: ps
                        }
                    })
                }} />)}
        </div>}
    </div>
}

const filterPointFn = (p: TPoint, search?: string, subType?: string) => {
    const name = (isZh ? p.nameCn : p.nameEn) ?? ''
    return (!search || name.includes(search)) && (!subType || p.buildInType === subType)
}

const PointsContent = ({
    assetAlias, selectedKeys, type, onChange
}: Omit<PointTreeProps, 'candidates'> & {
    type: TPointType,
    assetAlias: string
}) => {
    const [search, setSearch] = useState<string | undefined>()
    const [originCandidates, setOriginCandidates] = useState<TPoint[]>([])
    const [candidates, setCandidates] = useState<TPoint[]>([])
    const [hiddenSelected, setHiddenSelected] = useState<TPoint[]>([])
    const [subType, setSubType] = useState<string | undefined>()

    const subTypeOptions = useMemo(() => {
        const optSet = new Set<string>(originCandidates.map(p => p.buildInType ?? ''))
        return Array.from(optSet, (v, i) => {
            return {
                key: v,
                label: v || i18n('other'),
                value: v
            }
        })
    }, [originCandidates])

    useEffect(() => {
        let typeParam = ''
        switch (type) {
            case 'YX': typeParam = 'yx'; break;
            case 'YC': typeParam = 'yc'; break;
            case 'PROD': typeParam = 'dd'; break;
            default: typeParam = 'props'
        }

        _dao.getModelByObjectAlias({ object_alias: assetAlias, type: typeParam, if_public: false })
            .then(res => {
                if (daoIsOk(res)) {
                    setOriginCandidates(res.data.map(rawPoint => convertModelPointToPoint(rawPoint)))
                } else {
                    console.error(`fetch point for asset{alias:${assetAlias}} failed, res is not ok`);
                    setOriginCandidates([])
                }
            })
    }, [type, assetAlias])

    useEffect(() => {
        setCandidates(originCandidates.filter(p => filterPointFn(p, search, subType)))
    }, [search, subType])

    useEffect(() => {
        if ((search || subType !== undefined) && selectedKeys && selectedKeys.length > 0) {
            setHiddenSelected(originCandidates.filter(p => {
                return !filterPointFn(p, search, subType) && selectedKeys?.includes(combinePointKey(p))
            }))
        }
    }, [search, subType, selectedKeys])

    useEffect(() => {
        setSearch(undefined)
        setSubType(undefined)
        setCandidates(originCandidates)
    }, [originCandidates])

    return <>
        <SelectWithTitle innerName={{ text: getPointTypeNameByType(type) + i18n('type') }}
            options={subTypeOptions}
            value={subType}
            onChange={v => setSubType(v)}
            allowClear
            customCls={{
                container: styles.type_selector_container,
                select: styles.type_selector_select
            }} />
        <Input className={styles.point_search} prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} />
        <PointTree customCls={{ container: styles.point_tree }} selectedKeys={selectedKeys} candidates={candidates}
            onChange={(ps) => {
                onChange(hiddenSelected.concat(ps))
            }} />
    </>
}

const AssetAndPointPickerContextWrapper: React.FC<AssetAndPointPickerProps & { textContext?: TextContext }> =
    ({ textContext, ...rest }) => {
        return <SystemInfoProvider withDomainInfo>
            <AssetAndPointPickerTextContext.Provider value={_.assignIn({}, defaultTextContext, textContext)}>
                <AssetAndPointPicker {...rest} />
            </AssetAndPointPickerTextContext.Provider>
        </SystemInfoProvider>
    }

export default AssetAndPointPickerContextWrapper