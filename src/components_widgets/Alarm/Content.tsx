import React, { useEffect, useState, useRef, useMemo } from "react"
import { Select, Row, Col, Table, Button, Checkbox, Space } from 'antd'
import { useRecursiveTimeoutEffect } from "ReactHooks";
import styles from './style.mscss'
import { _dao, daoIsOk } from "@/common/dao"
import scadaUtil, { CommonTimerInterval, CommonHisTimerInterval } from '@/common/const-scada'
import {
    msg,
    isZh,
    TableState,
    AlarmReq,
    AlarmLevel,
    AlarmConditionProps,
    AlarmTableProps,
    ContentProps,
    PureTableData,
    tableColMinWidth,
    TYPE_LIST,
    ContentOptions,
    AlarmType,
} from './constant'
import moment from "moment";
import { useWidgetContext } from "../common/hooks";
import { RightOutlined } from '@ant-design/icons';
import { redirectTo } from "@/common/util-scada";
import { FilterConfirmProps, FilterDropdownProps } from "antd/lib/table/interface";

/* 表格列信息 */
type FilterOption = {
    text: string
    value: string
}
const sorter = (propName: string) => (a: any, b: any) => {
    const aP = a[propName]
    const bP = b[propName]
    if (aP === undefined && bP === undefined) {
        return 0
    } else if (aP === undefined) {
        return -1
    } else if (bP === undefined) {
        return 1
    } else {
        return aP > bP ? 1 : -1
    }
}
const addCommonProps = (cols: any[], render: (text, record) => React.ReactElement) => cols.map(c => ({
    ...c,
    title: isZh ? c.name_zh : c.name_en,
    align: 'left',
    textWrap: 'word-break',
    sorter: sorter(c.dataIndex),
    render: render
}))

const FilterDropdown = (params: FilterDropdownProps) => {
    return <div className={styles.filter}>
        <Checkbox.Group value={params.selectedKeys} options={params.filters?.map(f => ({ label: f.text, value: f.value }))} onChange={(v) => {
            params.setSelectedKeys(v.map(o => o.toString()))
        }} />
        <div className={styles.btn}>
            <Space size={'large'}>
                <Button size='small' type='ghost' onClick={() => {
                    params.setSelectedKeys([])
                }}>{isZh ? '清空' : 'Clear'}</Button>
                <Button size='small' type='primary' onClick={() => {
                    params.confirm()
                }}>{isZh ? '确定' : 'Confirm'}</Button>
            </Space>
        </div>
    </div>
}

const COL_KEY_TYPE = 'type'
const COL_KEY_LEVEL = 'level'
const COLS_ALARM = (options?: {
    level?: FilterOption[]
    selectedLevels?: string[]
    type?: FilterOption[]
    selectedTypes?: string[]
}) => addCommonProps([
    {
        name_zh: "时间",
        name_en: "Time",
        dataIndex: "time",
        width: 270,
        sorter: sorter('time')
    },
    {
        key: COL_KEY_TYPE,
        name_zh: "类型",
        name_en: "Type",
        dataIndex: "atype_name",
        width: isZh ? 100 : 125,
        filters: options?.type,
        filteredValue: options?.selectedTypes,
        filterDropdown: (params: FilterDropdownProps) => {
            return <FilterDropdown {...params} />
        }
    },
    {
        key: COL_KEY_LEVEL,
        name_zh: "等级",
        name_en: "Level",
        dataIndex: "level_name",
        width: 100,
        filters: options?.level,
        filteredValue: options?.selectedLevels,
        filterDropdown: (params: FilterDropdownProps) => {
            return <FilterDropdown {...params} />
        }
    },
    {
        name_zh: "内容",
        name_en: "Content",
        dataIndex: "content"
    }
], (text, record) => {
    return <span style={{ color: record.level_color }}>{text}</span>;
})

export const COLS_ACTIVE_SC = addCommonProps([
    {
        name_zh: "SC名称",
        name_en: "SC Name",
        dataIndex: "sc_name",
        width: 180
    },
    {
        name_zh: "刹车等级",
        name_en: "BP Level",
        dataIndex: "bp_level",
        width: 150
    },
    {
        name_zh: "SC描述",
        name_en: "SC Content",
        dataIndex: "sc_desc"
    }
], (text, record) => {
    return <span style={{ color: record.sc_color }}>{text}</span>;
})

export const COLS_SUBHEALTH_SC = addCommonProps([
    {
        name_zh: "时间",
        name_en: "Time",
        dataIndex: "subhealth_begin_time",
        width: 180
    },
    {
        name_zh: "SC名称",
        name_en: "SC Name",
        dataIndex: "subhealth_code",
        width: 150
    },
    {
        name_zh: "类型",
        name_en: "Type",
        dataIndex: "subHealth_type",
        width: 120
    },
    {
        name_zh: "描述",
        name_en: "Content",
        dataIndex: "subhealth_description"
    }
], (text, record) => {
    return <span>{text}</span>;
})

const AlarmCondition = (props: AlarmConditionProps) => {
    const { alarmTypes, alarmLevels, typeChange, levelChange, selectedTypes, selectedLevels } = props

    const handleTypeChange = (values: Array<string>) => {
        typeChange(values);
    }

    const handleLevelChange = (values: Array<string>) => {
        levelChange(values);
    }

    return (
        <Row align="middle" className={styles.condition}>
            <Col style={{ width: 200, marginRight: 10 }}>
                <Select
                    mode="multiple"
                    showArrow
                    showSearch={false}
                    placeholder={msg('ALARM.alarmType')}
                    maxTagCount={0}
                    maxTagPlaceholder={`${msg('ALARM.typeSelected')} (${selectedTypes.length})`}
                    value={selectedTypes}
                    style={{ width: '100%', maxWidth: 200 }}
                    options={alarmTypes.map(f => ({
                        label: (isZh ? f.name_zh : f.name_en) || f.label || '',
                        value: String(f.value)
                    }))}
                    onChange={handleTypeChange}
                />
            </Col>
            <Col style={{ width: 200, marginRight: 10 }}>
                <Select
                    mode="multiple"
                    showArrow
                    showSearch={false}
                    placeholder={msg('ALARM.alarmLevel')}
                    maxTagCount={0}
                    maxTagPlaceholder={`${msg('ALARM.levelSelected')} (${selectedLevels.length})`}
                    value={selectedLevels}
                    style={{ width: '100%', maxWidth: 200 }}
                    options={alarmLevels.map(f => ({ label: f.name, value: String(f.value) }))}
                    onChange={handleLevelChange}
                />
            </Col>
        </Row>
    );
}

const PureTable = (props: PureTableData) => {
    const { cols, tableData, pageSize, onRedirect } = props;

    const tableRef = useRef<HTMLDivElement | null>(null);
    const [tableState, setTableState] = useState(JSON.parse(JSON.stringify(tableData)));

    useEffect(() => {
        setTableState((s) => ({ ...JSON.parse(JSON.stringify(tableData)), ...{ height: s.height } }));
    }, [tableData])

    useEffect(() => {
        if (!tableRef.current) return;
        if (tableState.data.length === 0) {
            $(tableRef.current).find('table').addClass('nodata');
        } else {
            $(tableRef.current).find('table').removeClass('nodata');
        }
    }, [tableState.data.length]);

    useEffect(() => {
        let resize = () => {
            if (!tableRef.current) return;
            let height = tableRef.current.clientHeight - 78;
            if (height < 0) height = 0;
            setTableState((s) => ({ ...s, height }));
        }
        resize();
        window.addEventListener('resize', resize);

        return () => {
            window.removeEventListener('resize', resize);
        }
    }, [])

    return <div className={styles.tableDiv} ref={tableRef}>
        <Table
            locale={{ emptyText: msg('COMMON.TXT_NO_DATA') }}
            showSorterTooltip={false}
            columns={cols}
            dataSource={tableState.data.map((ele, index) => Object.assign({}, ele, { key: index }))}
            size="small"
            scroll={{
                y: tableState.height,
                x: cols.length * tableColMinWidth - 8,
            }}
            pagination={{
                defaultPageSize: pageSize,
                total: tableState.total ? tableState.total : 1,   //确保无数据时依然显示分页器
                position: ["bottomCenter"],
                showSizeChanger: true,
                itemRender: onRedirect ? (page, type, originEle) => {
                    if (type === 'next') {
                        const btnText = isZh ? '查看更多' : 'More'
                        return <div className={styles.pagination__container}>
                            <div className={styles.next}>
                                <RightOutlined />
                            </div>
                            <div className={styles.redirect} title={btnText} onClick={e => {
                                e.stopPropagation()
                                onRedirect()
                            }}>
                                {btnText}
                            </div>
                        </div>
                    }

                    return originEle
                } : undefined,
                showTotal: () => msg('ALARM.totalRecords') + tableState.total.toString()
            }}
            onChange={props.onChange}
        />
    </div>
}

const getInitTableState = (pageSize: number) => ({
    height: 200,
    data: [],
    total: 0,
    page: 1,
    pageSize: pageSize,
})

const AlarmTable = (props: AlarmTableProps) => {
    const { devAlias, alarmReqParams, cols, maxRecords, historySc, pageSize, allowRedirect, onRedirect } = props;

    const { isDemo } = useWidgetContext();
    const [tableState, setTableState] = useState<TableState>(getInitTableState(pageSize));
    const lastAlarmId = useRef<number>(alarmReqParams.start_id);
    const lastAlarmNo = useRef<number>(alarmReqParams.start_no);

    if (!isDemo) {
        useRecursiveTimeoutEffect(
            () => {
                let isNewReq = true;
                return [
                    () => {
                        return (() => {
                            let curHistorySc = 0;
                            if (isNewReq) {
                                setTableState(s => ({ ...s, data: [], total: 0, page: 1 }));
                                lastAlarmId.current = 0;
                                lastAlarmNo.current = 0;
                                curHistorySc = historySc;
                                isNewReq = false;
                            }

                            return _dao.getAlarm(Object.assign({}, alarmReqParams, {
                                history_sc: curHistorySc,
                                seq_type: (!lastAlarmId.current && !lastAlarmNo.current) ? 1 : 0,
                                start_id: lastAlarmId.current,
                                start_no: lastAlarmNo.current,
                                alias_list: (curHistorySc === 0 ? '' : devAlias),
                                node_name_list: (curHistorySc === 0 ? devAlias : ''),
                                app_list: ''
                            }));
                        })();
                    },
                    (res) => {
                        if (daoIsOk(res)) {
                            lastAlarmId.current = res.last_time_id;
                            lastAlarmNo.current = res.last_no;

                            setTableState(s => {
                                let newData: Array<any>;
                                newData = scadaUtil.handleAlarm(s.data, res.data, maxRecords);
                                return { ...s, data: newData, total: newData.length };
                            });
                        }
                    }
                ];
            },
            CommonTimerInterval,
            [alarmReqParams]
        );
    }

    const handleRedirect = () => {
        const data = tableState.data ?? []
        const firstRecord = data[0]
        const lastRecord = data[Math.max(data.length - 1, 0)]

        const timeFormat = 'YYYY-MM-DD hh:mm:ss'
        const firstRecordMoment = firstRecord?.standard_time ? moment(firstRecord.standard_time, timeFormat) : moment()
        const defaultSt = firstRecordMoment.clone().subtract(30, 'day')
        const lastRecordMoment = lastRecord?.standard_time ? moment(lastRecord.standard_time, timeFormat) : defaultSt

        onRedirect && onRedirect({
            et: firstRecordMoment.format(timeFormat),
            st: (lastRecordMoment.isBefore(defaultSt) ? lastRecordMoment : defaultSt).format(timeFormat)
        })
    }

    return (
        <PureTable cols={cols} tableData={tableState} pageSize={pageSize} onChange={props.onChange}
            onRedirect={allowRedirect ? handleRedirect : undefined}
        />
    );
}

const getAlarmReq = (oldReq: AlarmReq, levels: AlarmLevel[], types: AlarmType[]): AlarmReq => {
    return {
        ...oldReq,
        type_list: types.map(t => t.value).join(','),
        level_list: levels.map(l => l.value).join(',')
    }
}
const AlarmContent = (props: ContentOptions[TYPE_LIST.ALARM] & { devAlias: string }) => {
    const { devAlias, alarmTypes, maxRecords, historySc, pageSize, userSaveCfg, onSave } = props;
    const initAlarmReq: AlarmReq = {
        alias_list: (historySc === 0 ? '' : devAlias),
        type_list: '',
        level_list: '',
        max_cnt: maxRecords,
        node_name_list: (historySc === 0 ? devAlias : ''),
        seq_type: 1,             // 刚进来用1，之后用0
        history_sc: historySc,   // [0, 50]  不是第一次请求要传0
        start_id: 0,
        start_no: 0,
        app_list: ''
    };

    const [mouted, setMounted] = useState(false);
    const [cache, setCache] = useState<{
        levels: AlarmLevel[];
        selectedTypes: AlarmType[];
        selectedLevels: AlarmLevel[];
        alarmReq: AlarmReq;
    }>({ levels: [], selectedTypes: [], selectedLevels: [], alarmReq: initAlarmReq });

    useEffect(() => {
        if (userSaveCfg) {
            const selectedLevels = cache.levels
                .filter((level) => {
                    if (userSaveCfg.selectedLevels) {
                        return userSaveCfg.selectedLevels.findIndex(
                            (l: AlarmLevel) => l.value === level.value
                        ) > -1;
                    }
                    return String(level.value) !== '1';
                })
            const selectedTypes = alarmTypes
                .filter((type) => {
                    if (userSaveCfg.selectedTypes) {
                        return userSaveCfg.selectedTypes.findIndex(
                            (t: AlarmType) => t.value === type.value
                        ) > -1;
                    }
                    return true
                })

            setCache(cache => Object.assign({}, cache, {
                selectedLevels: selectedLevels,
                selectedTypes: selectedTypes,
                alarmReq: getAlarmReq(cache.alarmReq, selectedLevels, selectedTypes)
            }));
        }

    }, [userSaveCfg, cache.levels, alarmTypes])

    useEffect(() => {
        const fetchAlarmCondition = async () => {
            const res = await _dao.getAlarmLevel();
            if (daoIsOk(res)) {
                const levels = res.data as AlarmLevel[]
                const selectedLevels = levels
                    .filter((level) => {
                        return String(level.value) !== '1'; // todo 不知道是为了什么
                    })

                setCache(cache => Object.assign({}, cache, {
                    levels: levels,
                    selectedLevels: selectedLevels,
                    selectedTypes: alarmTypes,
                    alarmReq: getAlarmReq(cache.alarmReq, selectedLevels, alarmTypes)
                }));
            }
            setMounted(true);
        }

        fetchAlarmCondition();
    }, []);

    useEffect(() => {
        const selectedLevels = cache.levels
            .filter((level) => String(level.value) !== '1')

        setCache(cache => Object.assign({}, cache, {
            selectedLevels: selectedLevels,
            selectedTypes: alarmTypes,
            alarmReq: getAlarmReq(cache.alarmReq, selectedLevels, alarmTypes)
        }));
    }, [devAlias, alarmTypes])

    const cols = useMemo(() => {
        return COLS_ALARM({
            level: cache.levels.map(l => ({ text: l.name, value: String(l.value) })),
            selectedLevels: cache.selectedLevels.map(l => String(l.value)),
            type: alarmTypes.map(t => ({ text: (isZh ? t.name_zh : t.name_en) || t.label || '', value: String(t.value) })),
            selectedTypes: cache.selectedTypes.map(t => String(t.value)),
        })
    }, [cache, alarmTypes])

    const handleFilterChange = (types: string[], levels: string[]) => {
        const selectedLevels = cache.levels.filter(l => levels.includes(String(l.value)))
        const selectedTypes = alarmTypes.filter(t => types.includes(String(t.value)))
        setCache(cache => Object.assign({}, cache, {
            selectedLevels: selectedLevels,
            selectedTypes: selectedTypes,
            alarmReq: getAlarmReq(cache.alarmReq, selectedLevels, selectedTypes)
        }));

        onSave && onSave({
            selectedLevels,
            selectedTypes
        })
    }

    if (!mouted) {
        return null;
    }

    return <div className={styles.body}>
        <AlarmTable
            devAlias={devAlias}
            levels={cache.selectedLevels}
            types={cache.selectedTypes}
            alarmReqParams={cache.alarmReq}
            cols={cols}
            onChange={(_, filters, __) => {
                const levels = filters[COL_KEY_LEVEL]?.map(v => String(v)) ?? []
                const types = filters[COL_KEY_TYPE]?.map(v => String(v)) ?? []
                handleFilterChange(types, levels)
            }}
            allowRedirect={props.allowRedirect}
            maxRecords={maxRecords}
            historySc={historySc}
            pageSize={pageSize}
            onRedirect={({ st, et }) => {
                const levels = cache.selectedLevels.length > 0 ? cache.selectedLevels : cache.levels
                const types = cache.selectedTypes.length > 0 ? cache.selectedTypes : alarmTypes
                redirectTo('his_warn', {
                    params: {
                        alias: devAlias,
                        levelIds: levels.map(l => String(l.id)),
                        typeIds: types.map(t => t.id !== undefined ? String(t.id) : ''),
                        st, et
                    },
                    openNewTab: true
                })
            }}
        />
    </div>
};

const ActiveSc = (props: ContentOptions[TYPE_LIST.ACTIVE_SC] & { devAlias: string }) => {
    const { devAlias, pageSize } = props;

    const { isDemo } = useWidgetContext();
    const [activeData, setActiveData] = useState(getInitTableState(pageSize));
    const lastTime = useRef(0);

    if (!isDemo) {
        useRecursiveTimeoutEffect(
            () => {
                return [
                    () => {
                        return _dao.activeSc({
                            wtg_alias: devAlias,
                            last_time: lastTime.current
                        })
                    },
                    (res) => {
                        if (daoIsOk(res) && res.need_update) {
                            lastTime.current = res.update_time;
                            let active_sc = res.active_sc || [];
                            setActiveData(s => {
                                return { ...s, data: active_sc, total: active_sc.length }
                            });
                        }
                    }
                ];
            },
            CommonTimerInterval,
            []
        );
    }

    return (
        <div className={styles.body}>
            <PureTable cols={COLS_ACTIVE_SC} tableData={activeData} pageSize={pageSize} />
        </div>
    );
};

const SubhealthSc = (props: ContentOptions[TYPE_LIST.SUBHEALTH_SC] & { devAlias: string }) => {
    const { isDemo } = useWidgetContext();
    const { devAlias, pageSize } = props;

    const [subhealthData, setSubhealthData] = useState(getInitTableState(pageSize));

    if (!isDemo) {
        useRecursiveTimeoutEffect(
            () => {
                return [
                    () => {
                        return _dao.subhealth({
                            ids: devAlias,
                            poly_date_type: "day",
                            poly_area_type: "wtg",  // 仅风机使用
                            starttime: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                            endtime: moment().format('YYYY-MM-DD'),
                            row_count: 50, //获取最新50条记录
                            row_begin: 1,
                            order_by: "sc_starttime",
                            date_format: "yyyy-MM-dd",
                            time_format: "HH:mm:ss",
                            is_asc: false
                        })
                    },
                    (res) => {
                        if (daoIsOk(res)) {
                            setSubhealthData(s => {
                                return { ...s, data: res.data, total: res.data.length }
                            }
                            );
                        }
                    }
                ];
            },
            CommonHisTimerInterval,
            []
        );
    }

    return (
        <div className={styles.body}>
            <PureTable cols={COLS_SUBHEALTH_SC} tableData={subhealthData} pageSize={pageSize} />
        </div>
    );
};

const Content = <T extends TYPE_LIST>(props: ContentProps<T>) => {
    const { type, devAlias, options } = props;

    return (
        <div className={styles.container}>
            {type === TYPE_LIST.ALARM && <AlarmContent devAlias={devAlias} {...options as ContentOptions[TYPE_LIST.ALARM]} />}
            {type === TYPE_LIST.ACTIVE_SC && <ActiveSc devAlias={devAlias} {...options as ContentOptions[TYPE_LIST.ACTIVE_SC]} />}
            {type === TYPE_LIST.SUBHEALTH_SC && <SubhealthSc devAlias={devAlias} {...options as ContentOptions[TYPE_LIST.SUBHEALTH_SC]} />}
        </div>
    );
};

export default Content;