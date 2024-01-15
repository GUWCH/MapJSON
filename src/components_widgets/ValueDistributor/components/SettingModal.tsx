import React, { useState } from 'react'
import styles from './SettingModal.module.scss'
import { ConfigModal } from 'Modal'
import { msgTag } from '@/common/lang'
import { isZh } from '@/common/util-scada'
import { POINT_TABLE } from '@/common/constants'
import StyledAntSelect from 'Select/StyledAntSelect'
import { Input } from 'antd'
import { Asset } from '../type'
import { _dao, daoIsOk } from '@/common/dao'
import { combinePointKey, combineToFullAlias, parsePointKey } from '@/common/utils/model'
import { notify } from 'Notify'
const i18n = msgTag('ValueDistributor')

export type SettingModalProps = {
    assets: Asset[]
    points: TPoint[]
    originPointValueMap?: Record<string, string | undefined>
    onClose: () => void
}

const SettingModal: React.FC<SettingModalProps> = ({
    assets, originPointValueMap, points, onClose
}) => {
    const [map, setMap] = useState<Record<string, string | undefined> | undefined>(originPointValueMap)

    const handleSet = () => {
        if (!map) return

        const params: { alias: string, value: string }[] = []
        assets.forEach(a => {
            Object.entries(map).forEach(([pk, pv]) => {
                const pInfo = parsePointKey(pk)
                const fullAlias = combineToFullAlias(a.alias, pInfo.alias)
                if (pv) {
                    params.push({
                        alias: fullAlias,
                        value: pv
                    })
                }
            })
        })

        _dao.setPointValue(params).then(res => {
            if (daoIsOk(res)) {
                notify(i18n('setSuc'))
                onClose()
            } else {
                notify(i18n('setFail'))
            }
        })
    }


    return <ConfigModal width={400}
        title={assets.length > 1 ? i18n('batchSetting') : i18n('setting')}
        onOk={handleSet}
        onCancel={() => {
            onClose()
        }}>
        <div className={styles.assets}>
            {assets.map(r => r.name).join(',')}
        </div>
        <div className={styles.setting}>
            {points.map(p => {
                const key = combinePointKey(p)
                const value = map?.[key]
                return <React.Fragment key={key}>
                    <span>{isZh ? p.nameCn : p.nameEn}</span>
                    <div>
                        {
                            p.tableNo === POINT_TABLE.YX ?
                                <StyledAntSelect
                                    value={value ? parseInt(value) : undefined}
                                    options={p.constNameList?.map(c => ({ label: isZh ? c.name : c.name_en, value: c.value }))}
                                    onChange={v => {
                                        setMap(pre => ({ ...pre, [key]: String(v) }))
                                    }}
                                /> :
                                <Input value={value} onChange={v => {
                                    const newV = v.target.value
                                    setMap(pre => ({ ...pre, [key]: newV }))
                                }} />
                        }
                    </div>
                </React.Fragment>
            })}
        </div>
    </ConfigModal>
}

export default SettingModal