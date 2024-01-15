export default {
    common: {
        name: '模板名称',
        selectPlaceholder: '请选择',
        saveSuc: '保存成功',
        saveFail: '保存失败',
        removeSuc: '删除成功',
        removeFail: '删除失败',
        tempQuery: '临时查询'
    },
    templateSelector: {
        noTpl: '暂无模板',
        title: '模板：',
        defaultAdd: '新建模板',
        deleteTitle: '确定删除模板？',
        deleteContent: '删除模板:{0}\r\n模板删除后，将不可恢复，确认删除？',
        edit: '编辑',
        delete: '删除',
        replaceTitle: '存在同名模板',
        replaceContent: '是否替换该同名模板?',
        updateDefaultFail: '更新默认模板失败'
    },
    templateEditor: {
        selectProto: '大类',
        fieldEmpty: '{0}不能为空',
        saveAsTpl: '保存为模板',
        generatorTitle: '新建模板',
        editorTitle: '编辑模板',
        saveAs: '另存为新模板',
        save: '保存',
        add: '查询',
        ruleGroup: '查询条件',
        baseGroup: '模板',
        saveAsDefault: '保存为默认模板',
    },
    templateProtoRender: {
        rules: '查询条件',
        time: '查询时间',
        statisticsCols: '统计数据',
        compareTime: '对比时间',
        addRule: '添加条件',
        removeAllRule: '清空',
        removeConfirm: {
            title: '删除条件',
            content: '确定删除该条件?',
            allTitle: '清空条件',
            allContent: '确定删除所有条件?'
        },
        ruleGroupTitle: '条件',
        emptyRules: '至少需要配置一个条件',
        ruleName: {
            domain: '领域',
            model: '类型',
            staticPoint: '数据',
            samplingSize: '采样粒度',
            aggregation: '聚合方式',
            warnLevel: '告警等级',
            warnType: '告警类型',
            point: '测点',
            time: '时间',
            asset: '资产',
            span: '时间跨度'
        },
        spanEnum: {
            day: '日',
            week: '周',
            month: '月',
            year: '年',
            custom: '自定义',
        },
        statisticsEnum: {
            max: '最大值',
            maxOccur: '最大值发生时刻',
            min: '最小值',
            minOccur: '最小值发生时刻',
            avg: '平均值',
            granularity: '数据粒度'
        },
        custom: '自定义'
    },
}