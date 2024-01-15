import { POINT_FIELD, POINT_TABLE } from '@/common/constants';
import { isZh } from '@/common/util-scada';
import { getQuery } from '@/common/utils/browser';
import { combinePointKey, combineToFullAlias, parseDynKey } from '@/common/utils/model';
import { PrimaryButton } from 'Button';
import { QuickRangeSelectEnum, QuickSelectEnum, getDateFromQuick, getQuickSelectName, getRangeFromQuick } from 'DatePicker';
import { FontIcon } from 'Icon';
import iconsMap from 'Icon/iconsMap';
import { notify } from 'Notify';
import ParamsGenerator, { RuntimeChangeTrigger } from 'ParamsGenerator';
import { ProtoKeys, SamplingSizeEnum } from 'ParamsGenerator/constant';
import { Template } from 'ParamsGenerator/types';
import { ConfigProvider, Space } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import zhCN from 'antd/lib/locale/zh_CN';
import * as echarts from 'echarts';
import moment, { Moment, unitOfTime } from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import '../common/css/app.scss';
import TabsContainer, { TabsContainerProps } from './TabsContainer';
import dao from './dao';
import styles from './index.module.scss';
import { getGranularity, i18n } from './utils';
import { Info, TimeRange } from 'PointCurve/type';
import Empty from 'Empty';
import { BaseProtoValues, CompareSpan, TrendAnalysisProtoValues, TrendAnalysisRuleValues } from 'ParamsGenerator/TemplateProtoRender/types';
import { parseMoment } from 'ParamsGenerator/utils';
import { combineInfos } from 'PointCurve';
import { getPropertyIfExist } from '@/common/utils/object';
import SystemInfoProvider from 'SystemInfoProvider';
import { DATE_CUSTOM_FORMAT } from '@/common/const-scada';

type Params = Omit<TabsContainerProps, 'curveId' | 'onDatazoom'>

// 从启停记录跳转进页面的参数解析
const getParamsFromDown = async (): Promise<Params | undefined> => {
    const query = getQuery()
    const assetName = query['name']
    const assetAlias = query['alias']
    const st = query['st'] ? moment(query['st']) : undefined
    const et = query['et'] ? moment(query['et']) : undefined
    const optionStr = query['options']

    if (
        !assetName ||
        !assetAlias ||
        !st || !et ||
        !optionStr
    ) {
        return
    }

    let option: {
        id: string
        tag_alias: string // "WGEN.GenActivePW"
        trend_group: string // "1"
        trend_type: string // "1"
        y_axis_pos: string // "1"
        line_color: string // "{0}FF0000"}[]
    }[]

    try {
        option = JSON.parse(optionStr) as typeof option
    } catch (error) {
        console.error('parse option failed', optionStr)
        return
    }

    const nameMap = await dao.getPointsName(option.map(o => combineToFullAlias(assetAlias, o.tag_alias)))
    const unitMap = await dao.getPointsUnit(
        option.filter(o => o.trend_type === '1')
            .map(o => ({
                fullAlias: combineToFullAlias(assetAlias, o.tag_alias),
                tableNo: POINT_TABLE.YC
            }))
    )
    const constMap = await dao.getPointsConst(option.filter(o => o.trend_type === '3').map(o => combineToFullAlias(assetAlias, o.tag_alias)))
    const pointGroups: TrendAnalysisRuleValues['pointGroups'] = {}

    option.forEach(o => {
        const fullAlias = combineToFullAlias(assetAlias, o.tag_alias)
        const nameFromMap = nameMap?.[fullAlias]?.replace(new RegExp(`^${assetName}`), '') ?? ''
        const unitFromMap = unitMap?.[fullAlias]
        const constFromMap = constMap?.[fullAlias]
        switch (o.trend_type) {
            // 遥测
            case '1': {
                pointGroups.YC = (pointGroups.YC ?? []).concat({
                    alias: o.tag_alias,
                    name: nameFromMap,
                    nameCn: nameFromMap,
                    nameEn: nameFromMap,
                    tableNo: POINT_TABLE.YC,
                    fieldNo: POINT_FIELD.VALUE,
                    unit: unitFromMap
                })
                break
            }
            // 电量
            case '2': {
                console.error('data from downtime page contain PROD point:', o.tag_alias)
                break
            }
            // 遥信
            case '3': {
                pointGroups.YX = (pointGroups.YX ?? []).concat({
                    alias: o.tag_alias,
                    name: nameFromMap,
                    nameCn: nameFromMap,
                    nameEn: nameFromMap,
                    tableNo: POINT_TABLE.YX,
                    fieldNo: POINT_FIELD.VALUE,
                    constNameList: constFromMap?.map(item => ({
                        name: item.name,
                        name_en: item.name,
                        value: item.value
                    }))
                })
                break
            }
            // 事件
            case '4': {
                pointGroups.EVENT = (pointGroups.EVENT ?? []).concat({
                    alias: '',
                    name: (isZh ? '' : ' ') + i18n('event'),
                    nameCn: (isZh ? '' : ' ') + i18n('event'),
                    nameEn: (isZh ? '' : ' ') + i18n('event'),
                    tableNo: POINT_TABLE.EVENT,
                    fieldNo: ''
                })
                break
            }
            // 5 状态字
            default: {
                pointGroups.STATUS = (pointGroups.STATUS ?? []).concat({
                    alias: '',
                    name: (isZh ? '' : ' ') + i18n('status'),
                    nameCn: (isZh ? '' : ' ') + i18n('status'),
                    nameEn: (isZh ? '' : ' ') + i18n('status'),
                    tableNo: POINT_TABLE.STATUS,
                    fieldNo: ''
                })
                break
            }
        }
    })

    const value: TrendAnalysisRuleValues = {
        pointGroups: pointGroups,
        assets: [{
            name: assetName,
            key: assetAlias
        }]
    }
    const ranges = [{
        key: 'base', name: '',
        st, et
    }]

    return {
        statisticCols: [],
        statisticRangeFmt: 'time',
        originRanges: ranges,
        zoomedRanges: ranges,
        allInfos: getInfosFromValue(value, ranges)
    }
}

// 每日曲线
const getParamsFromDaily = async (): Promise<Params | undefined> => {
    const item = sessionStorage.getItem('cur_sel_points')
    if (!item) return

    const pointArr = JSON.parse(item) as {
        dyn_param: string // "1:62:QYAW.Farm.Statistics.WNAC.WindSpeed:9",
        disp_name: string // "山东庆云全场统计平均风速",
        trend_type: string // "1"
    }[]
    sessionStorage.removeItem('cur_sel_points')

    const nowM = moment()
    const constMap = await dao.getPointsConst(
        pointArr.filter(o => o.trend_type === '3')
            .map(o => parseDynKey(o.dyn_param).alias)
    )
    const unitMap = await dao.getPointsUnit(
        pointArr.filter(o => o.trend_type === '1' || o.trend_type === '2')
            .map(o => {
                const { alias, tableNo } = parseDynKey(o.dyn_param)
                return {
                    fullAlias: alias,
                    tableNo: parseInt(tableNo)
                }
            })
    )

    const params: Params = {
        statisticRangeFmt: 'time',
        statisticCols: [],
        originRanges: [{
            key: 'base',
            st: nowM.clone().hour(0).minute(0).second(0),
            et: nowM
        }],
        zoomedRanges: [{
            key: 'base',
            st: nowM.clone().hour(0).minute(0).second(0),
            et: nowM
        }],
        allInfos: pointArr.map(p => {
            const { alias: fullAlias, fieldNo, tableNo } = parseDynKey(p.dyn_param)
            const infoKey = combinePointKey({ alias: fullAlias, fieldNo, tableNo })
            return {
                key: infoKey,
                nameCn: p.disp_name,
                nameEn: p.disp_name,
                relatedTimeKey: 'base',
                assetInfo: {
                    alias: '',
                    name: '',
                },
                originPointInfo: {
                    key: infoKey,
                    fieldNo,
                    tableNo,
                    alias: fullAlias,
                    nameCn: p.disp_name,
                    nameEn: p.disp_name,
                    name: '',
                    constNameList: constMap[fullAlias]?.map(item => ({
                        name: item.name,
                        name_en: item.name,
                        value: item.value
                    })),
                    unit: unitMap?.[fullAlias]
                }
            }
        })
    }
    return params
}

const getRangeFromStAndSpan = (st: Moment | QuickSelectEnum | null, span: Exclude<CompareSpan, 'custom'>, baseMoment?: Moment | QuickSelectEnum | null): [Moment, Moment] | undefined => {
    if (!st) return
    // const now = moment()
    if (moment.isMoment(st)) {
        const et = st.clone()
        et.add(1, span)
        return [st.clone(), et]
    } else {
        const _base = baseMoment ? (moment.isMoment(baseMoment) ? baseMoment : getDateFromQuick(baseMoment)) : undefined
        const _st = getDateFromQuick(st, _base)
        const et = _st.clone()
        et.add(1, span)
        return [_st.clone(), et]
    }
}

const getInfosFromValue = (value: TrendAnalysisRuleValues, ranges: TimeRange[]) => {
    const points = Object.entries(value.pointGroups ?? {}).flatMap(([k, v]) => v)
    const assets = value.assets ?? []
    const infos = combineInfos(points, assets.map(a => ({
        alias: a.key,
        name: a.name
    }))).flatMap(info => {
        return ranges.map(r => {
            return {
                ...info,
                key: info.key + '_' + r.key,
                nameCn: info.nameCn + ' ' + r.name,
                nameEn: info.nameEn + ' ' + r.name,
                relatedTimeKey: r.key,
            }
        })
    })
    return infos
}

const Page = () => {
    const [runtimeTpl, setRuntimeTpl] = useState<Omit<Template, 'key'>>()
    const [originTpl, setOriginTpl] = useState<Template | undefined>()
    const [params, setParams] = useState<{ data: Params, timestamp: number } | undefined>()
    const [disableDefault, setDisableDefault] = useState(true)
    const curveId = 'trend_analysis_curve'

    useEffect(() => {
        if (window.g_web_cfg?.useNewTrendAnalysis) {
            (async () => {
                const time = Date.now()
                const paramsFromDown = await getParamsFromDown()
                if (paramsFromDown) {
                    setParams({ data: paramsFromDown, timestamp: time })
                    setDisableDefault(true)
                    return
                }
                const paramsFromDaily = await getParamsFromDaily()
                if (paramsFromDaily) {
                    setParams({ data: paramsFromDaily, timestamp: time })
                    setDisableDefault(true)
                    return
                }
                setDisableDefault(false)
            })()
        } else {
            setDisableDefault(false)
        }
    }, [])

    const curveInfoRef = useRef<{ infos: Info[] } | null>(null)

    const svgString2Image = (svgData: string, width: number, height: number): Promise<string> => {
        return new Promise((res, rej) => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            const image = new Image();
            image.onload = function () {
                if (context) {
                    context.clearRect(0, 0, width, height);
                    context.drawImage(image, 0, 0, width, height);
                    const pngData = canvas.toDataURL('image/png');
                    res(pngData);
                }
            };
            image.src = svgData;
        })
    }

    const handleExport = () => {
        if (!params || !params.data.originRanges) {
            notify(i18n('export.nodata'))
            return
        }
        const eDom = document.getElementById(curveId)
        const eIns = eDom && echarts.getInstanceByDom(eDom)

        if (eIns) {
            const dataUrl = eIns?.getDataURL({
                type: 'svg'
            })
            svgString2Image(dataUrl, eIns.getWidth(), eIns.getHeight())
                .then((chartData) => {
                    window.SysExport?.init({
                        cb: function (type, cb) {
                            dao.export(
                                curveInfoRef.current?.infos ?? [],
                                params.data.zoomedRanges,
                                getGranularity(params.data.zoomedRanges, curveInfoRef.current?.infos ?? []),
                                type, chartData)
                                .then(file => {
                                    if (file) {
                                        cb('save_web/' + file, true)
                                    } else {
                                        notify(i18n('export.failed'))
                                    }
                                })
                            return true;
                        }
                    })
                })
        }
    }

    const updateParams = (tpl: typeof runtimeTpl) => {
        if (!tpl) return
        const values = tpl.values as TrendAnalysisProtoValues
        const originTplValues = originTpl?.values as TrendAnalysisProtoValues | undefined
        const tplCompareRange = getPropertyIfExist(values, 'compareRange') as BaseProtoValues['compareRange'] | undefined
        const ranges: TimeRange[] = []
        const span = tplCompareRange?.span ?? 'day'

        if (span === 'custom') {
            const customRangeValue = tplCompareRange?.customRangeValue
            const dynRange = customRangeValue?.quickValue
            const staticRange = customRangeValue?.dateValue
            const timeRange = dynRange ?
                getRangeFromQuick(dynRange) : staticRange?.map(t => parseMoment(t))
            const st = timeRange?.[0]
            const et = timeRange?.[1]

            if (st && et) {
                ranges.push({
                    key: 'base',
                    name: '',
                    st: st,
                    et: et
                })
            }
        } else {
            let formatStr = ''
            switch (span) {
                case 'day': {
                    formatStr = DATE_CUSTOM_FORMAT.DATE_TIME
                    break
                }
                case 'week': {
                    formatStr = DATE_CUSTOM_FORMAT.YEAR_WEEK.replace('Wo', isZh ? 'W周' : 'Wo')
                    break
                }
                case 'month': {
                    formatStr = DATE_CUSTOM_FORMAT.YEAR_MONTH
                    break
                }
                case 'year': {
                    formatStr = 'YYYY'
                    break
                }
            }

            const base = tplCompareRange?.value?.base
            const baseQuick = base?.quick ?? null
            const baseDate = parseMoment(base?.date)
            const baseRange = getRangeFromStAndSpan(baseDate || baseQuick, span)
            if (baseRange) {
                ranges.push({
                    key: 'base',
                    name: '',
                    st: baseRange[0],
                    et: baseRange[1]
                })
            }

            const compare = tplCompareRange?.value?.compare
            const compareDate = parseMoment(compare?.date)
            const rangeFromDate = getRangeFromStAndSpan(compareDate, span)
            if (compareDate && rangeFromDate) {
                const dateStr = compareDate.format(formatStr)
                ranges.push({
                    key: dateStr,
                    name: dateStr,
                    st: rangeFromDate[0],
                    et: rangeFromDate[1],
                })
            }

            const compareQuick = compare?.quick
            if (compareQuick && compareQuick.length > 0) {
                compareQuick.forEach(q => {
                    const rangeFromQuick = getRangeFromStAndSpan(q, span, baseDate || baseQuick)
                    if (rangeFromQuick) {
                        ranges.push({
                            key: q,
                            name: getQuickSelectName(q),
                            st: rangeFromQuick[0],
                            et: rangeFromQuick[1]
                        })
                    }
                })
            }
        }

        if (ranges.length <= 0) {
            notify(i18n('noTime'))
            return
        }

        const allInfos = values.ruleValues?.flatMap(value => getInfosFromValue(value, ranges)) ?? []
        const tplInfos = originTplValues?.ruleValues?.flatMap(value => getInfosFromValue(value, ranges)) ?? []

        if (allInfos.length === 0) {
            notify(i18n('noAsset'))
            return
        }

        setParams({
            data: {
                originRanges: ranges,
                zoomedRanges: ranges,
                allInfos, tplInfos,
                showStatistic: !!values?.statisticsCols?.length && params?.data.showStatistic,
                statisticCols: values?.statisticsCols,
                statisticRangeFmt: ['day', 'custom'].includes(span) ? 'time' : 'day',
                templateId: originTpl?.key,
            },
            timestamp: Date.now()
        })
    }

    return <div className={styles.page}>
        <ParamsGenerator
            tplType='trend_analysis'
            disableDefault={disableDefault}
            enabledProtoKeys={[ProtoKeys.points_trend]}
            runtimeTpl={runtimeTpl}
            onRuntimeTplChange={(tpl, trigger, originTpl) => {
                setRuntimeTpl(tpl)
                setOriginTpl(originTpl)
                if (trigger === RuntimeChangeTrigger.CREATE_TEMP || trigger === RuntimeChangeTrigger.CREATE_TPL) {
                    updateParams(tpl)
                }
            }}
            titleActionRender={() => {
                return <Space size={'middle'}>
                    {!!(runtimeTpl?.values as TrendAnalysisProtoValues)?.statisticsCols?.length && <FontIcon style={{ fontSize: '20px' }}
                        type={iconsMap.STATISTICS} onClick={() => {
                            params && setParams({
                                data: {
                                    ...params.data,
                                    showStatistic: !params.data.showStatistic
                                },
                                timestamp: params.timestamp
                            })
                        }} />}
                    <FontIcon style={{ fontSize: '20px' }} type={iconsMap.EXPORT} onClick={handleExport} />
                </Space>
            }}
            actionRender={() => {
                return <div style={{ width: 'max-content' }}>
                    <PrimaryButton onClick={() => {
                        updateParams(runtimeTpl)
                    }}>{i18n('query')}</PrimaryButton>
                </div>
            }}
        />
        {params && <TabsContainer ref={curveInfoRef} key={params.timestamp} {...params.data} curveId={curveId}
            showStatistic={
                params.data.showStatistic
            }
            onDatazoom={(zoomedRanges) => {
                params && setParams({
                    data: {
                        ...params.data,
                        zoomedRanges
                    },
                    timestamp: params.timestamp
                })
            }}
        />}
    </div>
}

const App = () => {
    return <ConfigProvider locale={isZh ? zhCN : enUS} renderEmpty={() => <Empty />}>
        <SystemInfoProvider withDomainInfo>
            <Page />
        </SystemInfoProvider>
    </ConfigProvider>
}

if (process.env.NODE_ENV === 'development') {
    import('./dev.css')
    ReactDOM.render(<App />, document.getElementById('center'))
} else {
    ReactDOM.render(<App />, document.getElementById('container'))
}