import { BaseDAO } from "../common/dao"

const HTTP_METHOD = {
    GET: 'GET',
    DELETE: 'DELETE',
    POST: 'POST',
    PUT: 'PUT'
}

const RES_CONTENT = {
    JSON: 'application/json',
    FILE: ['multipart/form-data', 'application/force-download']
}

class IMADao extends BaseDAO {
    constructor(domain) {
        super('scada.IMA', domain)
    }

    extractData(res) {
        if (!res || res.code !== 10000) {
            throw new Error('res code error:' + res?.code)
        }
        return res.data
    }

    fetch(path, param, method, defaultRes) {
        const res = method === HTTP_METHOD.PUT || method === HTTP_METHOD.POST ?
            this.fetchData(path, null, param, method) :
            this.fetchData(path, param, null, method)

        return res.then(r => {
            const contentType = r.headers.get('Content-Type')
            if (RES_CONTENT.FILE.find(v => contentType.search(new RegExp(v, 'i')) >= 0)) {
                const header = r.headers.get('Content-Disposition')
                const filename = header && header.slice(header.indexOf("fileName=")).replace("fileName=", "")

                r.blob().then(b => {
                    const url = window.URL.createObjectURL(b)
                    const a = document.createElement('a')
                    a.style.display = 'none'
                    a.href = url
                    // the filename you want
                    a.download = filename
                    document.body.appendChild(a)
                    a.click()
                    window.URL.revokeObjectURL(url)
                })

                return null
            } else {
                return r.json().then(this.extractData)
            }
        }).catch(e => {
            console.error('api error', e)
            return defaultRes
        })
    }


    async getWarningDetail(id) {
        return this.fetch('/ima-web/checkAlarm', { machineCheckId: id }, 'GET', { app: [] })
    }
    async exportLog(id) {
        return this.fetch('/ima-web/logExport', { jobId: id }, 'GET', null, false)
    }
    async exportList(id) {
        return this.fetch('/ima-web/checkExport', { machineCheckId: id }, 'GET', null, false)
    }

}

const IMADomain = window.g_web_cfg?.IMAApiDomain
if (!IMADomain) {
    throw new Error('IMA domain not configured')
}
console.debug("IMADomain", IMADomain)
const _daoIns = new IMADao(IMADomain)
export default _daoIns