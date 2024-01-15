import React, { useCallback, useEffect, useState, useMemo, useRef, useContext } from "react";
import { Select, DatePicker as AntdDatePicker, Button, TableColumnType, Input, InputNumber, TreeSelect, Tooltip } from "antd";
import { RangePickerProps } from "antd/lib/date-picker";
import { SearchOutlined, EditOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import { AntTable, FontIcon, IconType, StyledModal } from '@/components';
import { notify } from 'Notify';
import { saveAs } from 'file-saver';
import ScadaCfg, { DATE_CUSTOM_FORMAT, DATE_FORMAT } from '@/common/const-scada';
import { DATE_MOMENT_FORMAT, TREE_NODE_TYPE } from '@/common/constants';
import { msgTag, isZh } from "@/common/lang";
import { _dao, daoIsOk } from "@/common/dao";
import { DateUtil, NumberUtil } from "@/common/utils";
import ExportSelect from '@/components_utils/ExportSelect'
import { getDateRange, defaultTableParameter, TableParameter } from "../constants";
import { GlobalContext } from "./context";
import styles from './style.mscss';

const DatePicker: any = AntdDatePicker;
const RangePicker = DatePicker.RangePicker as unknown as React.FC<RangePickerProps>;
const localText = msgTag('storage');
let warnOptions: IResWarnOption;

const CURRENT_NODE = ScadaCfg.getCurNodeAlias();
const defaultDateRange = getDateRange();

const recordKey = (record: IResStorageDowntime) => record.startTime + record.cessAlias;

const getColumns = (page, pageSize, sorter, sorterOrder, total, ...methods): TableColumnType<IResStorageDowntime>[] => {
    const cols: (TableColumnType<IResStorageDowntime>)[] = [{
        title: '',
        dataIndex: '',
        width: 70,
        fixed: false,
        render: (value: any, record: IResStorageDowntime, index: number) => {
            return <div style={{ textAlign: 'center' }}>{(page - 1) * pageSize + index + 1}</div>;
        }
    }, {
        title: localText('columnS.st'),
        dataIndex: 'startTime',
        width: 160,
        fixed: false
    }, {
        title: localText('columnS.et'),
        dataIndex: 'endTime',
        width: 185,
        fixed: false,
        render: (value: any, record: IResStorageDowntime, index: number) => {
            if (!value) return value;
            return <div style={{ whiteSpace: 'nowrap' }}>
                <span>{value}</span>
                <FontIcon
                    type={IconType.STATISTIC}
                    style={{
                        margin: '0 10px',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        methods[0] && methods[0](record);
                    }}
                />
            </div>
        }
    }, {
        title: localText('columnS.subName'),
        dataIndex: 'cessName',
        width: 200,
        fixed: false,
        render: (value: any, record: IResStorageDowntime, index: number) => {
            return <Tooltip
                key={recordKey(record)}
                title={() => {
                    return <Warn {...record} />;
                }}
                overlayStyle={{ maxWidth: 800 }}
                destroyTooltipOnHide={{ keepParent: false }}
            >
                <span style={{ cursor: 'pointer' }}>{value}</span>
            </Tooltip>
        }
    }, {
        title: localText('columnS.sub'),
        dataIndex: 'cessValue',
        width: 120,
        render: (value: any, record: IResStorageDowntime, index: number) => {
            return <div>
                <span>{value}</span>
                {
                    record.endTime && <FontIcon
                        type={IconType.EDITOR}
                        style={{
                            margin: '0 10px',
                            cursor: 'pointer'
                        }}
                        onClick={() => {
                            methods[1] && methods[1](record);
                        }}
                    />
                }
            </div>
        }
    }, {
        title: localText('columnS.converter'),
        dataIndex: 'pcsValue',
        width: 120,
    }, {
        title: localText('columnS.cluster'),
        dataIndex: 'rbValue',
        width: 120,
    }, {
        title: localText('columnS.box'),
        dataIndex: 'tmmValue',
        width: isZh ? 120 : 320,
    }, {
        title: localText('columnS.eco'),
        dataIndex: 'ecoReason',
        width: 300
    }, {
        title: localText('columnS.operater'),
        dataIndex: 'operator',
        width: 120
    }, {
        title: localText('columnS.operateTime'),
        dataIndex: 'operateTime',
        width: 160
    }, {
        title: localText('columnS.remark'),
        dataIndex: 'remark',
        width: 450
    }];
    return cols.map((ele) => {
        return Object.assign({}, ele, {
            key: ele.dataIndex,
            fixed: !!ele.fixed,
            align: 'left',
            ellipsis: false,
            sorter: !!ele.dataIndex && !!total,
            sortOrder: sorter === ele.dataIndex ? sorterOrder + 'end' : null,
        });
    });
};

type Extreme = { min?: string | number, max?: string | number };

export const Downtime = (props) => {
    const { dispatch, state } = useContext(GlobalContext);
    const [dataSource, setDataSource] = useState<IResStorageDowntime[]>([]);
    const [cess, setCess] = useState<Partial<ITree>[]>([]);
    const [date, setDate] = useState({
        startTime: defaultDateRange[0],
        endTime: defaultDateRange[1]
    });
    const [tableParameter, setTableParameter] = useState<TableParameter>(defaultTableParameter);
    const tableWrapper = useRef<HTMLDivElement | null>(null);
    const [reqJson, setReqJson] = useState<IReqStorageDowntime>();
    const [splitRecord, setSplitRecord] = useState<IResStorageDowntime>();
    const [editRecord, setEditRecord] = useState<IResStorageDowntime | IResStorageDowntime[]>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedCessId, setSelectedCessId] = useState<string[]>([]);
    const [extreme, setExtreme] = useState<Extreme>({ min: 0, max: 2 });

    /** 获取CESS列表, 告警获取时的等级和类型 */
    useEffect(() => {
        (async () => {
            const res = await _dao.getTreeList(TREE_NODE_TYPE.STORAGE_SUB_SYSTEM, CURRENT_NODE);
            if (daoIsOk(res)) {
                setCess(res.data.map(d => ({
                    id: d.id,
                    pId: d.pid,
                    value: d.id,
                    title: d.display_name,
                    alias: d.alias
                })));
            }
        })();
        (async () => {
            const res = await _dao.getWarnOptionList();
            if (daoIsOk(res)) {
                warnOptions = res.data;
            }
        })();
    }, []);

    const columns = useMemo(() => {
        return getColumns(tableParameter.page, tableParameter.pageSize, tableParameter.sorter, tableParameter.sortOrder, tableParameter.total, setSplitRecord, setEditRecord);
    }, [tableParameter.page, tableParameter.pageSize, tableParameter.sorter, tableParameter.sortOrder, tableParameter.total, setSplitRecord, setEditRecord]);

    const defaultDate: [moment.Moment, moment.Moment] = useMemo(() => {
        return [
            moment(date.startTime, DATE_MOMENT_FORMAT.DATE_TIME),
            moment(date.endTime, DATE_MOMENT_FORMAT.DATE_TIME)
        ]
    }, [date.startTime, date.endTime]);

    const changeDate = useCallback((dates, dateStrings) => {
        setDate({
            startTime: dates[0].format(DATE_MOMENT_FORMAT.DATE_TIME),
            endTime: dates[1].format(DATE_MOMENT_FORMAT.DATE_TIME),
            //momentStartTime: dates[0],
            //momentEndTime: dates[1]
        });
    }, [setDate]);

    const query = useCallback((newParameter?: Partial<TableParameter>) => {

        let req: IReqStorageDowntime;
        // from table page, sort, number 
        if (newParameter && reqJson) {
            let temp = Object.assign({}, tableParameter, newParameter);
            req = Object.assign({}, reqJson, {
                limit: {
                    page: temp.page,
                    size: temp.pageSize
                }
            }, temp.sorter ? {
                orders: [{
                    orderField: temp.sorter,
                    order: temp.sortOrder
                }]
            } : {
                orders: undefined
            });
        } else {
            req = {
                cessAlias: cess.filter(f => selectedCessId.indexOf(f.id as string) > -1).map(f => f.alias as string),
                startTime: date.startTime,
                endTime: date.endTime,
                limit: {
                    page: 1,
                    size: tableParameter.pageSize
                },
                dateFormat: DATE_FORMAT.DATE_TIME,
                lanType: isZh ? 'cn' : 'en'
            }

            if (!Array.isArray(req.cessAlias) || req.cessAlias.length === 0) {
                notify(localText('nocess'));
                return;
            }

            setTableParameter(o => Object.assign({}, defaultTableParameter, { pageSize: o.pageSize }));
        }

        setDataSource([]);
        setSelectedRowKeys([]);
        setTableParameter(o => Object.assign({}, o, { total: 0 }));
        dispatch({ type: 'loading' });
        (async () => {
            const res = await _dao.storageGetDowntime(req);
            if (daoIsOk(res)) {
                // debug
                /* setDataSource(Array.from(Array(100)).map((ele, ind) => {
                    return {
                        cessAlias: `SXCN.ESS0${ind}.CESS`,
                        cessAlias2: `SXCN.ESS0${ind}`,
                        startTime: '2012-03-09 00:00:00' + ind,
                        endTime: '2012-03-09 00:00:00',
                        cessName: 'ESS01',
                        cessValue: '123' + ind,
                        pcsValue: '3443' + ind,
                        tmmValue: '433' + ind,
                        rbValue: '556' + ind,
                        ecoReason: 'eco' + ind,
                        ecoId: ind,
                        operator: 'demo',
                        operateTime: '2012-03-09 00:00:00',
                        remark: 'remark'
                    }
                })); */

                setDataSource(res.data || []);
                if (res.businessConfig && res.businessConfig.valid && res.businessConfig.valid.cessValue) {
                    let ext = res.businessConfig.valid.cessValue;
                    ext = ext.replace(/[^\d]*(\d(\,\d+)*)[^\d]*/, '$1').split(',');
                    setExtreme({ min: ext[0], max: ext[1] });
                }

                setTableParameter(o => Object.assign({}, o, { total: res.total }));
            } else {
                notify(localText('failed'));
            }

            setReqJson(req);
            dispatch({ type: 'unLoading' });
        })();
    }, [reqJson, setReqJson, date.startTime, date.endTime, selectedCessId, tableParameter, setDataSource, setSelectedRowKeys]);

    const batchEdit = useCallback(() => {
        setEditRecord(dataSource.filter(d => selectedRowKeys.indexOf(recordKey(d)) > -1));
    }, [selectedRowKeys, dataSource, setEditRecord]);

    const changeTableParameter = useCallback((pagination, filters, sorter, extra) => {
        switch (extra.action) {
            case 'paginate': {
                const temp = {
                    pageSize: pagination.pageSize,
                    page: pagination.current
                };
                setTableParameter(o => Object.assign({}, o, temp));
                query(temp);
                break;
            }
            case 'sort': {
                const temp = {
                    sorter: sorter.order ? sorter.field : '',
                    sortOrder: (sorter.order || '').replace('end', '')
                };
                setTableParameter(o => Object.assign({}, o, temp));
                query(temp);
                break;
            }

        }
    }, [setTableParameter, query]);

    const splitRecordCb = useCallback((splitTime?: string) => {
        if (splitTime) {
            (async () => {
                const req = {
                    cessAlias: splitRecord?.cessAlias,
                    startTime: DateUtil.stdFormat(splitRecord?.startTime as string, DATE_FORMAT.DATE_TIME),
                    breakTime: splitTime,
                    optUser: ScadaCfg.getUser()
                };
                const res = await _dao.storageSplitRecord(req);
                if (daoIsOk(res)) {
                    notify(localText('operateOK'));
                    query({});
                } else {
                    notify(localText('operateFailed'));
                }
            })();
        }
        setSplitRecord(undefined);
    }, [splitRecord, setSplitRecord]);

    const editRecordCb = useCallback((o?) => {
        if (o) {
            (async () => {
                const selectRecords = !Array.isArray(editRecord) ? [editRecord] : editRecord;
                const req = {
                    items: selectRecords.map(r => Object.assign(
                        {},
                        o,
                        {
                            cessAlias: r?.cessAlias,
                            startTime: DateUtil.stdFormat(r?.startTime as string, DATE_FORMAT.DATE_TIME)
                        })
                    ),
                    optUser: ScadaCfg.getUser()
                };
                const res = await _dao.storageEditRecord(req);
                if (daoIsOk(res)) {
                    notify(localText('operateOK'));
                    query({});
                } else {
                    notify(localText('operateFailed'));
                }
            })();
        }
        setEditRecord(undefined);
    }, [editRecord, setEditRecord, query]);

    const onSelectChange = useCallback((newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    }, [setSelectedRowKeys]);

    const selectCess = useCallback((cessIds, value, label) => {
        setSelectedCessId(cessIds);
    }, [setSelectedCessId]);

    const exportData = useCallback((fileType) => {
        if (fileType && reqJson) {
            dispatch({ type: 'loading' });

            let temp: IReqStorageDowntime = JSON.parse(JSON.stringify(reqJson));
            delete temp.limit;
            temp.exportType = fileType;

            _dao.storageExportDowntime(temp)
                .then(async (res) => {
                    if (res.ok) {
                        let fileName;
                        const content = res.headers.get("content-disposition");
                        fileName = content.replace(/.*filename=(.*)/gi, '$1');

                        const blob = await res.blob();
                        saveAs(blob, fileName);
                    } else {
                        notify(res.message || localText('downloadFailed'));
                    }
                })
                .finally(() => {
                    dispatch({ type: 'unLoading' });
                });
        }
    }, [reqJson]);

    return <>
        <div className={styles.content}>
            <div className={styles.header}>
                <div>
                    <RangePicker
                        defaultValue={defaultDate}
                        showTime={true}
                        format={DATE_CUSTOM_FORMAT.DATE_TIME}
                        allowClear={false}
                        onChange={changeDate}
                    />
                    <TreeSelect
                        allowClear={true}
                        treeData={cess}
                        value={selectedCessId}
                        onChange={selectCess}
                        maxTagCount={1}
                        treeCheckable={true}
                        showCheckedStrategy={TreeSelect.SHOW_CHILD}
                        placeholder={localText('selectSubsys')}
                        style={{ minWidth: 300 }}
                        treeDataSimpleMode={true}
                        showArrow={true}
                        treeNodeFilterProp='title'
                        dropdownMatchSelectWidth={false}
                        listHeight={500}
                    />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => { query() }}
                    >
                        {localText('search')}
                    </Button>
                </div>
                <div>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        disabled={selectedRowKeys.length === 0}
                        style={{ marginRight: 10 }}
                        onClick={batchEdit}
                    >
                        {localText('batchedit')}
                    </Button>
                    <ExportSelect
                        exportText={localText('export')}
                        exportButtonProps={{
                            disabled: dataSource.length === 0
                        }}
                        onChange={exportData}
                    />
                </div>
            </div>
            <div className={styles.table} ref={tableWrapper}>
                <AntTable
                    observeElement={tableWrapper.current}
                    paginationHeight={40}
                    size='small'
                    dataSource={dataSource}
                    columns={columns}
                    scroll={{
                        // @ts-ignore
                        x: columns.reduce((a, b) => { return parseInt((a && a.width) || '0') + parseInt(b.width || '0') })
                    }}
                    rowKey={recordKey}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: onSelectChange,
                        getCheckboxProps: (record) => ({
                            disabled: !record.endTime
                        }),
                    }}
                    pagination={{
                        current: tableParameter.page,
                        pageSize: tableParameter.pageSize,
                        total: tableParameter.total,
                        showSizeChanger: true,
                    }}
                    onChange={changeTableParameter}
                />
            </div>
        </div>
        {splitRecord && <SplitRecord onChange={splitRecordCb} {...splitRecord} />}
        {(Array.isArray(editRecord) && editRecord.length > 0 || editRecord) && <EditRecord onChange={editRecordCb} record={editRecord} extreme={extreme} />}
    </>;
}

const range = (start: number, end: number) => {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
};

const disabledDateTime = () => ({
    disabledSeconds: () => range(1, 60)
});

type SplitRecordProps = IResStorageDowntime & {
    onChange?: (value?: string) => void;
}

const SplitRecord = (props: SplitRecordProps) => {
    const { startTime, endTime, cessAlias, onChange, ...rest } = props;
    const [value, setValue] = useState<Moment>();

    const onOk = useCallback(() => {
        if (typeof value === 'undefined') {
            notify(localText('noSplitTime'));
            return;
        }

        const dateStr = value.format(DATE_CUSTOM_FORMAT.DATE_TIME);
        if (dateStr >= endTime || dateStr <= startTime) {
            notify(localText('alertDateRange'));
            return;
        }

        const stdDate = value.format(DATE_MOMENT_FORMAT.DATE_TIME);
        onChange && onChange(stdDate);
    }, [value, onChange]);

    const onCancel = useCallback(() => {
        onChange && onChange();
    }, [onChange]);

    const onChangeDate = useCallback((momentDate) => {
        setValue(momentDate);
    }, [setValue]);

    return <>
        <StyledModal
            title={localText('insertTime')}
            centered
            visible={!!(cessAlias && startTime && endTime)}
            onOk={onOk}
            onCancel={onCancel}
            width={450}
            destroyOnClose={true}
            headerBorder={true}
            footerBorder={true}
            {...rest}
        >
            <div className={styles.splitRecord}>
                <div>
                    <div>{localText('columnS.st')}</div>
                    <div>{startTime}</div>
                </div>
                <div>
                    <div>{localText('insertTime')}</div>
                    <DatePicker
                        onChange={onChangeDate}
                        showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                        value={value}
                        showNow={false}
                        format={DATE_CUSTOM_FORMAT.DATE_TIME}
                        disabledTime={disabledDateTime}
                        inputReadOnly={true}
                    />
                </div>
                <div>
                    <div>{localText('columnS.et')}</div>
                    <div>{endTime}</div>
                </div>
            </div>
        </StyledModal>
    </>;
};

type EditRecordParameter = {
    cessValue?: string | number;
    ecoId?: string | number;
    remark: string;
}
type EditRecordProps = {
    record: IResStorageDowntime | IResStorageDowntime[]
    onChange?: (value?: EditRecordParameter) => void;
    extreme?: Extreme
}

let ECO_LIST;
const EditRecord = (props: EditRecordProps) => {
    const { record, onChange, extreme = {}, ...rest } = props;
    const [value, setValue] = useState<EditRecordParameter>({
        cessValue: undefined,
        ecoId: undefined,
        remark: ''
    });
    const [, updateState] = React.useState<any>();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    useEffect(() => {
        let cessValue, ecoId, remark = '';
        if (!Array.isArray(record)) {
            cessValue = record.cessValue;
            ecoId = record.ecoId;
            remark = record.remark;
        } else {
            ecoId = record[0]?.ecoId;
        }
        setValue({
            cessValue: cessValue,
            ecoId: ecoId,
            remark: remark
        });
    }, [record]);

    useEffect(() => {
        if (ECO_LIST) return;
        (async () => {
            const res = await _dao.storageECO();
            if (daoIsOk(res)) {
                ECO_LIST = (res.data || []).map((d: IResStorageECO) => ({ label: d.codeDesc, value: d.code }));
                forceUpdate();
            }
        })();
    }, []);

    const onOk = useCallback(() => {
        if (typeof value.cessValue === 'undefined' || value.cessValue === null || value.cessValue === '' || !NumberUtil.isValidNumber(value.cessValue)) {
            notify(localText('noSetCess'));
            return;
        }
        if (typeof extreme.min !== 'undefined' && extreme.min !== null && extreme.min !== '') {
            if (Number(value.cessValue) < Number(extreme.min)) {
                notify(localText('minCess', extreme.min));
                return;
            }

        }
        if (typeof extreme.max !== 'undefined' && extreme.max !== null && extreme.max !== '') {
            if (Number(value.cessValue) > Number(extreme.max)) {
                notify(localText('maxCess', extreme.max));
                return;
            }
        }
        if (typeof value.ecoId === 'undefined' || value.ecoId === null || value.ecoId === '') {
            notify(localText('noEco'));
            return;
        }
        onChange && onChange(value);
    }, [value, onChange, extreme]);

    const onCancel = useCallback(() => {
        onChange && onChange();
    }, [onChange]);

    const onChangeData = useCallback((e: any, options?) => {
        if (typeof e === 'object' && e !== null) {
            const target = e.target as HTMLTextAreaElement;
            setValue(o => Object.assign({}, o, { remark: target.value }))
        } else if (options) {
            setValue(o => Object.assign({}, o, { ecoId: e }))
        } else {
            setValue(o => Object.assign({}, o, { cessValue: e }))
        }
    }, [setValue]);

    return <>
        <StyledModal
            title={localText('edit')}
            centered
            visible={!!(Array.isArray(record) && record.length > 0 || record)}
            onOk={onOk}
            onCancel={onCancel}
            width={550}
            destroyOnClose={true}
            headerBorder={true}
            footerBorder={true}
            {...rest}
        >
            <div className={styles.edit}>
                <div>
                    <div>{localText('columnS.sub2')}</div>
                    <div><InputNumber value={value.cessValue} style={{ width: '100%' }} step={1} onChange={onChangeData} min={extreme.min} max={extreme.max} /></div>
                </div>
                <div>
                    <div>{localText('columnS.eco')}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <Select
                            size={'middle'}
                            style={{ width: '100%' }}
                            placeholder={localText('columnS.eco')}
                            value={value.ecoId}
                            options={ECO_LIST || []}
                            onChange={onChangeData}
                            dropdownMatchSelectWidth={false}
                        />
                    </div>
                </div>
                <div>
                    <div>{localText('columnS.remark')}</div>
                    <div>
                        <Input.TextArea
                            rows={4}
                            value={value.remark}
                            maxLength={200}
                            showCount={true}
                            style={{ width: '100%' }}
                            onChange={onChangeData}
                            placeholder={localText('ecoPlaceholder')}
                        />
                    </div>
                </div>
            </div>
        </StyledModal>
    </>;
};

const Warn = (props: IResStorageDowntime) => {
    const { cessAlias2, startTime, endTime } = props;
    const [fetching, setFetching] = useState(false);
    const [data, setData] = useState<IResWarn[]>([]);

    useEffect(() => {
        (async () => {
            setFetching(true);
            const req: IReqWarn = {
                begin_time: DateUtil.stdFormat(startTime, DATE_FORMAT.DATE_TIME),
                end_time: endTime ? DateUtil.stdFormat(endTime, DATE_FORMAT.DATE_TIME) : DateUtil.getStdNowTime(),
                checked_list: cessAlias2,
                level_id: warnOptions[0].level_data.map(d => d.level_id).join(','),
                // 接口硬编码过滤,没有对应接口,使用历史告警接口特殊过滤
                type_data: warnOptions[1].table_data.filter(d => ['43'].indexOf(String(d.table_id)) > -1).map(d => {
                    return `${d.table_id}:${d.option_data.map(f => f.option_id).join(',')}`
                }).join('#')
            };
            const res = await _dao.getWarn(req);
            setFetching(false);
            let data: IResWarn[] = [];
            if (daoIsOk(res)) {
                data = res.data;
            }
            setData(data);
        })();

    }, [cessAlias2, startTime, endTime, setFetching, setData]);

    return <div className={styles.warnWrap}>
        {fetching
            ? '...'
            : data.length === 0
                ? <span>{localText('nodata')}</span>
                : data.map((d, ind) => {
                    return <div key={d.col_no} className={styles.warn}>
                        <span>{d.col_time}</span>
                        <span>{d.col_object}</span>
                        <span>{d.col_content}</span>
                    </div>
                })
        }
    </div>
}