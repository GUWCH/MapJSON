import { TPointTypes } from "@/common/constants";
import { daoIsOk, _dao } from "@/common/dao";
import { convertRawPointToPoint } from "./utils";

const extractOkData = (res: any) => {
    if (daoIsOk(res)) {
        return res.data
    }
    throw new Error('res code error:' + res.code)
}

const dao = {
    getObjects: () => _dao.getObjects().then(extractOkData),
    getModelsById: (domainId: string, modalId: string, isPublic: boolean = true) => _dao.getModelsById({
        domain_id: domainId,
        model_id: modalId,
        if_public: isPublic
    }).then(extractOkData),
    getPoints: (object_alias: string, options?: {
        publicTypes?: TPointTypes,
        modelLevels?: number[]
    }) => _dao.getModelByObjectAlias({ object_alias, type: '', is_sample: false })
        .then(res => {
            if (daoIsOk(res)) {
                return res.data
            }
            return [];
        })
        .then((data: IModelPoint[]) => {
            return data.filter(p => {
                if (!options) {
                    return true
                }
                const types = options.publicTypes
                const typeFilterRes = !Array.isArray(types) ||
                    types.length === 0 ||
                    types.map(p => String(p)).indexOf(String(p.table_no)) > -1

                const modelLevels = options.modelLevels

                const modelLevelRes = !Array.isArray(modelLevels) ||
                    (modelLevels.length > 0 &&
                        modelLevels.findIndex(l => l === p.model_level) >= 0)
                return typeFilterRes && modelLevelRes
            }).map(p => convertRawPointToPoint(p))
        }),
    // getPointsValue: (assetAlias: string | { alias: string; name: string; showName: string }[], points: (Point & { decimal?: number })[]) => {
    //     const req: any[] = [];
    //     points.map(p => {
    //         if (Array.isArray(assetAlias)) {
    //             assetAlias.map(s => {
    //                 const finalAlias = combineToFullAlias(s.alias, p.alias)
    //                 req.push({
    //                     id: "",
    //                     key: `1:${p.tableNo}:${finalAlias}:${p.fieldNo}`,
    //                     decimal: p.decimal || DECIMAL.COMMON
    //                 });
    //             });
    //         } else {
    //             const finalAlias = combineToFullAlias(assetAlias, p.alias)
    //             req.push({
    //                 id: "",
    //                 key: `1:${p.tableNo}:${finalAlias}:${p.fieldNo}`,
    //                 decimal: p.decimal || DECIMAL.COMMON
    //             });
    //         }
    //     })

    //     return _dao.getDynData(req, { f: 'baseinfo' }).then(extractOkData)
    // }
}

export default dao