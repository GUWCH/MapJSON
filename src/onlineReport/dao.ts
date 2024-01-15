import { _dao, daoIsOk } from "@/common/dao"

export default {
    getReportTemplates: async (): Promise<IReportTemplateTreeNode[]> => {
        const tplRes = await _dao.getReportTemplates()
        if (daoIsOk(tplRes)) {
            const allTpls = tplRes.data
            const currentNodeAlias = window.g_field_parm ?? ''
            let nodeName = currentNodeAlias

            const infoRes = await _dao.getInfoByAlias(currentNodeAlias, 'disp_name')
            if (daoIsOk(infoRes)) {
                nodeName = (infoRes.data[0]?.disp_name ?? '').trim() || currentNodeAlias
            } else {
                console.error('fetch node name error, use alias instead');
            }

            const regex = new RegExp("^" + nodeName + "$|^" + nodeName + "/|/" + nodeName + "$|/" + nodeName + "/", "g")
            const filteredTpls = allTpls.filter(n => {
                const ifMatchCurrentNode = n.path && n.path.search(regex) > -1
                const ifMatchApp = n.type !== 'file' || !window.SysUtil?.hasApp() || window.SysUtil.hasAppPrefix(n.name)
                return ifMatchCurrentNode && ifMatchApp
            })

            const nodeHasChildrenMap: Record<string, true | undefined> = {}
            filteredTpls.forEach(n => {
                if (n.parent_id) {
                    nodeHasChildrenMap[n.parent_id] = true
                }
            })

            return filteredTpls.filter(n => n.type !== 'dir' || nodeHasChildrenMap[n.id]).map(n => {
                return Object.assign({}, n, {
                    name: n.type === 'file' && window.SysUtil ? window.SysUtil.replaceAppPrefix(n.name) : n.name
                })
            })
        }

        console.error('fetch templates error')
        return []
    }
}