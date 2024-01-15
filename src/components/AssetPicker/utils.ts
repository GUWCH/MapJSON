import scadaCfg from "@/common/const-scada"
import { _dao, daoIsOk } from "@/common/dao"
import { useState, useRef, useEffect } from "react"
import { AssetTree } from "./tree"
import { AssetGroup, TAsset } from "./type"

export const useAssetGroup = ({
    modelIds = [], deviceModel, enabledGroups = ['FAC'], filterByNode
}: {
    modelIds?: string[] | string
    deviceModel?: string
    enabledGroups?: AssetGroup[]
    filterByNode?: boolean // 根据当前节点过滤资产
}) => {
    const [assetGroups, setAssetGroups] = useState<Record<AssetGroup, AssetTree | undefined>>()

    const lastRequestTimestampRef = useRef(Date.now())
    const [loadingAssets, setLoadingAssets] = useState(true)
    useEffect(() => {
        const currentNodeAlias = filterByNode ? scadaCfg.getCurNodeAlias() ?? '' : ''
        setLoadingAssets(true)
        const timestamp = Date.now()
        lastRequestTimestampRef.current = timestamp

        const modelIdArr = Array.isArray(modelIds) ? modelIds : [modelIds]
        Promise.all(
            enabledGroups.map(k => {
                return _dao.getDeviceTreeByObjectAlias(currentNodeAlias, modelIdArr, k)
                    .then(res => {
                        const assets: TAsset[] = []
                        if (daoIsOk(res)) {
                            res.data.forEach((g) => {
                                assets.push({
                                    key: g.group_alias,
                                    name: g.group_name,
                                })
                                g.devices.forEach((d) => {
                                    if (deviceModel !== undefined) {
                                        if (!deviceModel && d.model)
                                            return
                                        if (!(d.model ?? '').includes(deviceModel))
                                            return
                                    }

                                    assets.push({
                                        key: d.alias,
                                        name: d.name,
                                        modelId: d.model_id,
                                        facAlias: k === 'FAC' ? g.group_alias : undefined,
                                        model: d.model,
                                        parentKey: k === 'FAC' ? d.parent_alias : g.group_alias,
                                    })
                                })
                            })
                        } else {
                            console.error('getDeviceTreeByObjectAlias res is not ok');
                        }
                        return {
                            [k]: new AssetTree(assets)
                        }
                    })
            })
        ).then(groups => {
            if (timestamp === lastRequestTimestampRef.current) {
                setAssetGroups(groups.reduce((p, c) => ({ ...p, ...c }), {} as Record<AssetGroup, AssetTree | undefined>))
            }
        }).finally(() => setLoadingAssets(false))
    }, [modelIds.toString(), enabledGroups.toString(), deviceModel])

    return {
        loadingAssets, assetGroups
    }
}