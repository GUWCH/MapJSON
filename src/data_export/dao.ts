import { _dao, daoIsOk } from "@/common/dao"
import { msgTag } from "@/common/lang"
const i18n = msgTag('dataExport')

export default {
    list: async () => {
        const res = await _dao.memo('get', {
            type: '8',
            is_desc: '1',
            domain_id: '-1'
        }) as ScadaResponse<IUserPreference[]>

        if (!daoIsOk(res)) {
            console.error('get data export record res is not ok')
            return []
        }

        const data = res.data as IDataExportRecord[]

        return data.map(d => {
            let content: IDataExportRecordContent | undefined = undefined
            const conditions: IExportConditionDTO[] = []
            let type: string = ''

            try {
                content = JSON.parse(d.content) as IDataExportRecordContent
                const cds = JSON.parse(decodeURIComponent(d.condition_plain ?? '{}')) as {
                    type?: string
                    conditions?: IExportConditionDTO[]
                }
                conditions.push(...(cds.conditions ?? []))
                conditions.push({
                    name: i18n('noData') + ':',
                    value: content.errmsg,
                    showInAbstract: true,
                })
                type = cds.type ?? ''
            } catch (error) {
                console.error('parse json content error', d.content, error);
            }

            let status: 'downloaded' | 'success' | 'fail' | 'in-progress';
            switch (d.description) {
                case '-2': status = 'fail'; break;
                case '-1': status = 'in-progress'; break;
                case '1': status = 'downloaded'; break;
                default: status = 'success'
            }

            return {
                id: d.id,
                domain_id: d.domain_id,
                conditions,
                type,
                content,
                status
            }
        })
    },
    updateRecordStatus: async (id: string, downloaded: boolean = true) => {
        const res = await _dao.memo('update', {
            id,
            type: '8',
            is_desc: '1',
            description: downloaded ? '1' : '0',
        })
        if (daoIsOk(res)) {
            return true
        }
        return false
    }
}