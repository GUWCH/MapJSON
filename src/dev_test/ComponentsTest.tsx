import React, { useMemo, useState } from 'react'
import EchartsWrap from 'EchartsWrap'
import PointCurve, { combineInfos } from '../components/PointCurve'
import { DataRecord as PointCurveDataRecord, Info, TimeRange } from 'PointCurve/type'
import moment, { Moment } from 'moment'
import { randomColor, randomHslColor } from './util'
import { Config as PointCurveConfig } from 'PointCurve/Configurator'
import { POINT_FIELD, POINT_TABLE } from '@/common/constants'
import Selector, { SelectorProps } from 'PointSelector/Selector'
import { combinePointKey } from '@/common/utils/model'
import { ConfigModal } from 'Modal'
import StyledAntSelect, { SelectWithTitle } from 'Select/StyledAntSelect'
import DatePicker, { QuickRangeSelectEnum, QuickSelectEnum } from 'DatePicker'
import AssetAndPointPicker, { PickerValue as AssetAndPointPickerValue } from 'AssetAndPointPicker'
import { AssetTree } from 'AssetPicker/tree'
import { AssetTreeSelector } from 'AssetPicker/AssetTree'
import { PointTree } from 'PointSelector/Tree'
import StyledCollapse, { StyledCollapsePanel } from 'Collapse'
import ButtonRadio from 'Radio/ButtonRadioGroup'
import StatisticsTable from '@/trend_analysis/StatisticsTable'
import { generateRandomColor } from '@/common/utils/color'
import { InputNumber } from 'antd'
import { SingleIconSelector } from 'IconSelector'
import { IconKey } from 'Icon/iconsMap'
import ComponentWrapper from './ComponentWrapper'
import HighlightText from 'HighlightText'
import { Tree } from 'Tree/Tree'
import { Node } from 'Tree/treeObj'

export type EchartsTestProps = {}

const pointTools = () => {
    const genStandardRelaProps = (i: number) => {
        const isStandard = i < 10
        let type = ''
        if (!isStandard) {
            switch (i % 4) {
                case 0: type = 'type0'; break;
                case 1: type = 'type1'; break;
                case 2: type = 'type0,type1'; break;
                default:
            }
        }

        return {
            type, ifStandard: isStandard
        }
    }

    const genYXConst = () => Array.from({ length: 3 }, (_, i) => ({
        name: '遥信值' + i,
        name_en: 'YX' + i,
        value: i
    }))
    const genYXPoint = (i: number): TPoint => {
        const alias = "MOCK.MOCKYX" + i
        const base = {
            name: '',
            nameCn: "虚拟遥信点" + i + (i === 0 ? 'lonnnnnnnnnnnnnnnnnng' : ''),
            nameEn: "MockYXPoint" + i,
            tableNo: POINT_TABLE.YX,
            fieldNo: POINT_FIELD.VALUE,
            alias,
            unit: "",
            constNameList: genYXConst(),
            ...genStandardRelaProps(i)
        }
        return {
            ...base
        }
    }

    const genYCPoint = (i: number): TPoint => {
        const base = {
            name: '',
            nameCn: "虚拟遥测点" + i + (i === 0 ? 'lonnnnnnnnnnnnnnnnnng' : ''),
            nameEn: "MockYCPoint" + i,
            tableNo: POINT_TABLE.YC,
            fieldNo: POINT_FIELD.VALUE,
            alias: "MOCK.MOCKYC" + i,
            unit: "Unit",
            constNameList: [],
            ...genStandardRelaProps(i)
        }
        return {
            ...base
        }
    }

    return {
        points: Array.from({ length: 20 }, (_, i) => {
            return i % 2 === 0 ? genYXPoint(i) : genYCPoint(i)
        })
    }
}

const pointCurveTools = (({ yxNum, otherNum, assetNum, ranges }: {
    yxNum: number
    otherNum: number
    assetNum: number
    ranges: TimeRange[]
}) => {
    const points: TPointWithCfg[] = []
    const assets: { name: string, alias: string }[] = []

    const standaloneAxisDataIndex = [5, 6]
    const differentUnitAxisDataIndex = [4, 6]
    const differentPositionAxisDataIndex = [1]

    Array.from({ length: assetNum }, (_, i) => {
        assets.push({
            name: '资产' + i,
            alias: 'assetAlias' + i
        })
    })

    Array.from({ length: yxNum }, (_, i) => {
        points.push({
            alias: 'yxAlias' + i,
            name: '',
            nameCn: '遥信点' + i,
            nameEn: 'yxPoint' + i,
            fieldNo: POINT_FIELD.VALUE,
            tableNo: POINT_TABLE.YX,
            constNameList: [
                {
                    value: 0,
                    name: '值1',
                    name_en: 'value1'
                },
                {
                    value: 3,
                    name: '值2',
                    name_en: 'value2'
                }
            ],
            conf: {
                // valueMap: {
                //     [0]: { color: ['#ffffff'] },
                //     [1]: { color: [''] },
                // }
            }
        })
    })

    Array.from({ length: otherNum }, (_, i) => {
        points.push({
            alias: 'ohterAlias' + i,
            name: '',
            nameCn: '其他点' + i,
            nameEn: 'ohterPoint' + i,
            unit: differentUnitAxisDataIndex.includes(i) ? 'h' : 'kw',
            fieldNo: POINT_FIELD.VALUE,
            tableNo: POINT_TABLE.YC,
            conf: {
                axis: {
                    axisType: standaloneAxisDataIndex.includes(i) ? 'special' : 'public',
                    position: differentPositionAxisDataIndex.includes(i) ? 'right' : 'left',
                }
            }
        })
    })

    const infos = combineInfos(points, assets).flatMap(info => ranges.map(r => ({
        ...info,
        key: info.key + r.key,
        nameCn: info.nameCn + r.name,
        nameEn: info.nameEn + r.name,
        relatedTimeKey: r.key
    })))
    const infoMapByInfoKey: Record<string, Info | undefined> = infos.reduce((p, c) => ({ ...p, [c.key]: c }), {})
    const rangeMapByInfoKey: Record<string, TimeRange> = infos.reduce((p, c) => {
        return {
            ...p,
            [c.key]: ranges.find(r => r.key === c.relatedTimeKey)
        }
    }, {})

    const records = infos.flatMap((info) => {
        const r: PointCurveDataRecord[] = []

        const range = rangeMapByInfoKey[info.key]

        const { st, et } = range
        let currentTime = st.clone()
        let v = 10
        while (currentTime.isBefore(et)) {
            v += 10
            r.push({
                infoKey: info.key,
                // value: info.originPointInfo.tableNo === POINT_TABLE.YX ? Math.random() > 0.5 ? 4 : 0 : v,
                value: info.originPointInfo.tableNo === POINT_TABLE.YX ? Math.random() > 0.5 ? 1 : 0 : Math.floor(Math.random() * 10000) / 100,
                time: currentTime.format('YYYY-MM-DD HH:mm:ss'),
                granularity: 1
            })
            if (info.originPointInfo.tableNo === POINT_TABLE.YX) {
                currentTime = currentTime.add(Math.floor(Math.random() * 10), 'minutes').add(10, 'seconds')
            } else {
                currentTime = currentTime.add(10, 'minutes')
            }
        }

        return r
    })

    return {
        infos, infoMapByInfoKey, records, ranges
    }


})({
    yxNum: 1,
    otherNum: 1,
    assetNum: 1,
    ranges: [
        {
            key: 'base',
            name: '',
            st: moment('2020-02-01 00:00:00'),
            et: moment('2020-02-01 00:20:00'),
        },
        {
            key: 'last-month',
            name: '上月',
            st: moment('2020-01-01 00:00:00'),
            et: moment('2020-01-01 00:20:00'),
        },
    ]
})

const mockDomains = Array.from({ length: 3 }, (_, dInx) => {
    return {
        domain_id: 'domain' + dInx,
        domain_name: 'domain' + dInx,
        domain_name_cn: '领域' + dInx,
        model_id_vec: Array.from({ length: 5 }, (_, mInx) => {
            return {
                model_id: 'model' + dInx + '_' + mInx,
                model_name: 'model' + dInx + '_' + mInx,
                model_name_cn: '模型1' + dInx + '_' + mInx,
                table_no: 1,
                type: 1,
                device_model_list: [
                    'model-1', 'model-2'
                ]
            }
        })
    } as IDomainInfo
})

const ComponentsTest: React.FC<EchartsTestProps> = (props) => {
    const eleProps: SelectorProps = useMemo(() => ({
        limit: 2,
        candidates: pointTools().points,
        groupMode: 'standardType',
        onChange: (ps) => console.log(ps)
    }), [])

    console.log('eleProps', eleProps)
    console.log('pointCurveTools', pointCurveTools)

    /**
     */
    return <AssetAndPointPicker withAsset withPoint />
    // <SelectWithTitle showArrow={true} innerName={{ text: '测试', required: true }}
    //     //  mode='multiple'
    //     options={[
    //         {
    //             value: 1,
    //             label: 'opt1'
    //         },
    //         {
    //             value: 2,
    //             label: 'opt2'
    //         },
    //         {
    //             value: 3,
    //             label: 'opt333333333333333333333333333333333333333333'
    //         },
    //     ]} />
    // <PointCurve
    //     config={{infos: pointCurveTools.infos}}
    //     records={pointCurveTools.records}
    //     st={pointCurveTools.st} et={pointCurveTools.et} />
    // return <Configurator config={cfg} onSave={(cfg) => console.log('save cfg', cfg)} onCancel={() => { console.log('close') }} />
    // return <div style={{
    //     width: '800px',
    //     height: '50px'
    // }}>
    //     {/* <Selector  {...eleProps} /> */}
    //     <DatePicker.RangePicker onChange={(date) => console.log(date)} />
    // </div>
}

export const DatePickerDemo = () => {
    // const [values, setValues] = useState<{
    //     date: [Moment | null, Moment | null]
    //     quick?: QuickRangeSelectEnum
    // }>({
    //     date: [null, null]
    // })

    // return <DatePicker.RangePicker
    //     showTime
    //     quickSelect={{
    //         mode: 'button',
    //         value: values.quick
    //     }}
    //     value={values.date}
    //     onChange={(date, quick) =>
    //         setValues({
    //             date, quick
    //         })
    //     }
    // />

    const [values, setValues] = useState<{
        date: Moment | null
        quick?: QuickSelectEnum
    }>({
        date: null
    })

    return <DatePicker.DatePicker
        quickSelect={{
            // mode: 'button',
            mode: 'select',
            value: values.quick
        }}
        value={values.date}
        onChange={(date, quick) =>
            setValues({
                date, quick
            })
        }
    />
}

export const PointCurveDemo = () => {
    const [config, setConfig] = useState<PointCurveConfig>({ infos: pointCurveTools.infos })
    const [records, setRecords] = useState<PointCurveDataRecord[]>(pointCurveTools.records)
    console.log('records', records)

    return <PointCurve
        config={config}
        onConfigChange={(c) => setConfig(c)}
        records={records}
        timeRanges={pointCurveTools.ranges}
        originTimeRanges={pointCurveTools.ranges}
        onDatazoom={(ranges) => {
            console.log('newRanges', ranges)
            setRecords(old => {
                return old.filter((r, i) => {
                    r.infoKey
                    const info = pointCurveTools.infoMapByInfoKey[r.infoKey]
                    const range = ranges.find(r => r.key === info?.relatedTimeKey)
                    const t = moment(r.time)
                    return range && t.isBetween(range.st, range.et, 'second') && i < 40
                })
            })
        }}
    />
}

export const AssetAndPointPickerDemo = () => {
    const [value, setValue] = useState<AssetAndPointPickerValue>({
        domainValues: {
            domainId: mockDomains[0].domain_id,
            modelId: mockDomains[0].model_id_vec[0].model_id
        }
    })

    return <AssetAndPointPicker value={value} onValueChange={setValue} withAsset withPoint />
}

const getAssetTree = (modelId: string) => new AssetTree(
    Array.from({ length: 2 }, (_, facInx) => {
        return [{
            key: 'fac' + facInx,
            name: '场站' + facInx
        }].concat(Array.from({ length: 5 }, (_, devInx) => {
            return [{
                key: 'alias_' + facInx + '_' + devInx,
                name: '设备' + facInx + '_' + devInx + (devInx === 0 ? 'longgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg' : ''),
                modelId: modelId,
                model: '型号',
                facAlias: 'fac' + facInx,
                parentKey: 'fac' + facInx
            }].concat(Array.from({ length: 2 }, (_, subDevInx) => {
                return {
                    key: 'alias_' + facInx + '_' + devInx + '_' + subDevInx,
                    name: '子设备' + facInx + '_' + devInx + '_' + subDevInx,
                    modelId: modelId,
                    model: '子型号',
                    facAlias: 'fac' + facInx,
                    parentKey: 'fac' + facInx
                }
            }))
        }).flat())
    }).flat().concat({ key: 'fac_empty', name: '空场站' })
)
export const AssetTreeSelectorDemo = () => {
    const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>([])
    const [params, setParams] = useState<Record<string, string | undefined>>({})

    return <ComponentWrapper params={params} onParamsChange={p => setParams(p)} paramsInfo={{
        multiple: '多选(Y,N)',
        limit: '限制(数字)'
    }}>
        <AssetTreeSelector multiple={params['multiple'] === 'Y'}
            limit={params['limit'] !== undefined ? parseInt(params['limit']) : undefined}
            assetTree={getAssetTree('WTG')}
            selectedKeys={selectedKeys}
            onChange={(items) => {
                console.log('items', items)
                setSelectedKeys(items.map(o => o.key))
            }} />
    </ComponentWrapper>
}


const treeNodes = (() => {
    const getNodes = (name: string, parentKey: string = ''): Node[] => {
        return Array.from({ length: 5 }, (_, i) => ({
            key: parentKey + '_' + i,
            name: name + '_' + parentKey + '_' + i,
            parentKey: parentKey
        }))
    }

    return getNodes('node1').flatMap(n1 => {
        return [n1, ...getNodes('node2', n1.key).flatMap(n2 => {
            return [n2, ...getNodes('node3', n2.key)]
        })]
    })
})()
export const TreeSelectorDemo = () => {
    const [selectedKeys, setSelectedKeys] = useState<string[] | undefined>([])
    const [params, setParams] = useState<Record<string, string | undefined>>({})

    return <ComponentWrapper params={params} onParamsChange={p => setParams(p)} paramsInfo={{
        multiple: '多选(Y,N)',
        limit: '限制(数字)',
        searchOnEnter: '回车查询(Y,N)'
    }}>
        <Tree multiple={params['multiple'] === 'Y'}
            limit={params['limit'] !== undefined ? parseInt(params['limit']) : undefined}
            nodes={treeNodes}
            selectedKeys={selectedKeys}
            searchOptions={{
                searchOnEnter: params['searchOnEnter'] === 'Y'
            }}
            onChange={(items) => {
                console.log('items', items)
                setSelectedKeys(items.map(o => o.key))
            }} />
    </ComponentWrapper>
}

export const PointTreeDemo = () => {
    const [selectedKeys, setKeys] = useState<string[]>()
    return <PointTree candidates={pointTools().points} selectedKeys={selectedKeys} onChange={(ps) => {
        setKeys(ps.map(p => combinePointKey(p)))
        console.log('ps', ps)
    }} />
}

export const CollapseDemo = () => {
    return <StyledCollapse defaultActiveKey={1} >
        <StyledCollapsePanel key={1} header={'header1'} >
            content1
        </StyledCollapsePanel>
        <StyledCollapsePanel key={2} header={'header2'}>
            content2
        </StyledCollapsePanel>
    </StyledCollapse>
}

export const ButtonGroupDemo = () => {
    const [v, setV] = useState<string | null>(null)

    return <div style={{ width: 200, background: 'grey' }}>
        <ButtonRadio noWrap value={v} options={Array.from({ length: 3 }, (_, i) => ({
            key: i,
            label: 'button' + i,
            value: i + ''
        }))} onChange={v => setV(v)} />
    </div>
}

export const TrendAnalysisStatisticTableDemo = () => {
    return <StatisticsTable rangeFormater='time'
        displayCols={['max', 'min', 'maxOccur', 'minOccur', 'avg', 'granularity']}
        infos={pointCurveTools.infos}
        timeRanges={pointCurveTools.ranges}
        records={pointCurveTools.records} />
}

export const ColorDemo = () => {
    const [num, setNum] = useState(20)
    const colors = useMemo(() => generateRandomColor(num), [num])

    return <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }}>
        <InputNumber value={num} onChange={n => setNum(n)} />
        <div style={{
            minWidth: 0,
            display: 'flex',
            flexWrap: 'wrap'
        }}>
            {colors.map(c => <div style={{
                height: '20px',
                width: '20px',
                background: c,
                border: '1px solid black'
            }} />)}
        </div>
    </div>
}

export const IconSelectorDemo = () => {
    const [icon, setIcon] = useState<IconKey | undefined>()
    const [color, setColor] = useState<string | undefined>()

    return <div style={{
        width: 200
    }}>
        <SingleIconSelector iconKey={icon} color={color} onChange={(k, c) => {
            setIcon(k)
            setColor(c)
        }} />
    </div>
}

export const HighlightTextDemo = () => {
    const [params, setParams] = useState<Record<string, string | undefined>>({})

    return <ComponentWrapper params={params} paramsInfo={{
        text: '文字',
        highlight: '强调'
    }} onParamsChange={p => setParams(p)}>
        <HighlightText highlight={params['highlight']}>
            {params['text'] ?? ''}
        </HighlightText>
    </ComponentWrapper>
}

export default ComponentsTest