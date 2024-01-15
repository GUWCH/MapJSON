import { msgTag } from "@/common/lang"

const i18n = msgTag('paramsGenerator')

export type TemplateProtoRenderI18n = {
    rules: string
    time: string
    statisticsCols: string
    compareTime: string
    addRule: string
    removeAllRule: string
    ruleGroupTitle: string
    removeConfirm: {
        title: string
        content: string
        allTitle: string
        allContent: string
    }
    emptyRules: string
    ruleName: {
        time: string
        domain: string
        model: string
        staticPoint: string
        samplingSize: string
        aggregation: string
        warnLevel: string
        warnType: string
        point: string
        asset: string
        span: string
    },
    spanEnum: {
        day: string
        week: string
        month: string
        year: string
        custom: string
    },
    statisticsEnum: {
        max: string
        maxOccur: string
        min: string
        minOccur: string
        avg: string
        granularity: string
    },
    custom: string
}

export const templateProtoRenderI18nDefault: TemplateProtoRenderI18n = {
    rules: i18n('templateProtoRender.rules'),
    time: i18n('templateProtoRender.time'),
    statisticsCols: i18n('templateProtoRender.statisticsCols'),
    compareTime: i18n('templateProtoRender.compareTime'),
    addRule: i18n('templateProtoRender.addRule'),
    removeAllRule: i18n('templateProtoRender.removeAllRule'),
    ruleGroupTitle: i18n('templateProtoRender.ruleGroupTitle'),
    removeConfirm: {
        title: i18n('templateProtoRender.removeConfirm.title'),
        content: i18n('templateProtoRender.removeConfirm.content'),
        allTitle: i18n('templateProtoRender.removeConfirm.allTitle'),
        allContent: i18n('templateProtoRender.removeConfirm.allContent'),
    },
    emptyRules: i18n('templateProtoRender.emptyRules'),
    ruleName: {
        domain: i18n('templateProtoRender.ruleName.domain'),
        model: i18n('templateProtoRender.ruleName.model'),
        staticPoint: i18n('templateProtoRender.ruleName.staticPoint'),
        samplingSize: i18n('templateProtoRender.ruleName.samplingSize'),
        aggregation: i18n('templateProtoRender.ruleName.aggregation'),
        warnLevel: i18n('templateProtoRender.ruleName.warnLevel'),
        warnType: i18n('templateProtoRender.ruleName.warnType'),
        point: i18n('templateProtoRender.ruleName.point'),
        time: i18n('templateProtoRender.ruleName.time'),
        asset: i18n('templateProtoRender.ruleName.asset'),
        span: i18n('templateProtoRender.ruleName.span'),
    },
    spanEnum: {
        day: i18n('templateProtoRender.spanEnum.day'),
        week: i18n('templateProtoRender.spanEnum.week'),
        month: i18n('templateProtoRender.spanEnum.month'),
        year: i18n('templateProtoRender.spanEnum.year'),
        custom: i18n('templateProtoRender.spanEnum.custom'),
    },
    statisticsEnum: {
        max: i18n('templateProtoRender.statisticsEnum.max'),
        maxOccur: i18n('templateProtoRender.statisticsEnum.maxOccur'),
        min: i18n('templateProtoRender.statisticsEnum.min'),
        minOccur: i18n('templateProtoRender.statisticsEnum.minOccur'),
        avg: i18n('templateProtoRender.statisticsEnum.avg'),
        granularity: i18n('templateProtoRender.statisticsEnum.granularity'),
    },
    custom: i18n('templateProtoRender.custom'),
}