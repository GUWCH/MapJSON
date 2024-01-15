export default {
    paramsGenerator: {
        templateEditor: {
            save: 'Save',
            add: 'Export',
            ruleGroup: 'Condition',
        },
        templateProtoRender: {
            rules: 'Condition'
        }
    },
    runExport: 'Export',
    title: 'Export Records',
    batchDelete: 'Delete',
    batchDeleteTips: 'Please select data in table first',
    noData: 'No data',
    cols: {
        conditions: 'Condition', 
        st: 'Start Time', 
        et: 'End Time',
        type: 'Type'
    },
    download: 'Download', 
    delete: 'Delete', 
    deleteFail: 'Delete Fail',
    deleteSuc: 'Delete Success',
    exportFail: 'Failure',
    exporting: 'Processing...',
    validteError: {
        st: 'Please select start time',
        et: 'Please select end time',
        asset: 'Please select a device'
    },
    deleteModal: {
        title: 'Confirm the deletion?',
        content: 'After a record is deleted, it cannot be recovered. Please confirm the deletion.'
    },
    samplingSize: {
        one_min: '1 minute sampling',
        five_min: '5 minute sampling',
        ten_min: '10 minute sampling',
        ten_min_st: '10 minute statistics',
        ten_min_avg: '10 minute average',
        fifteen_min: '15 minute sampling',
        thirty_min: '30 minute sampling',
        one_hour: '1 hour sampling',
        one_day: '1 day sampling',
    },
    DItitle: 'DI point data',
    triggerSuc: 'The export is being processed. After it is complete, please view the records on the data export page.',
    reachLimit: 'There are unfinished or undownloaded tasks, please delete the record and export!',
    empty: 'Empty'
}