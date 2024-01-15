import { DatePicker as AntdDatePicker, Select, Form, Button, Table, InputNumber, Tooltip, Modal, Upload } from "antd";
import ReactDOM from "react-dom";
import React, { useCallback, useEffect, useRef, useState } from "react"
import { SearchOutlined, QuestionCircleOutlined, EditOutlined, SaveOutlined, DownloadOutlined, InfoCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { isZh, msgTag } from "@/common/lang";
import { OptionsType } from "rc-select/lib/interface";
import { ColumnsType } from "antd/lib/table/interface";
import { _dao } from "@/common/dao";
import { daoIsOk, parseRes } from "@/common/dao/basedao";
import { notify } from "Notify";
import { IPlanPointsListData, IPlanInfoData, IRangePicker, IQueryPlanBody, IPlanInfoResponse, IEditPlanBody, IExportPlanBody } from "./interface";
import { saveAs } from 'file-saver';
import EnvLoading from "EnvLoading";
import Intl from '../common/lang';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import { RcFile, UploadFile } from "antd/lib/upload/interface";
import { RangePickerProps } from "antd/lib/date-picker";
import Empty from 'Empty';
import { AntdProvider } from "@/common/antd.provider";
import moment from "moment";
import 'dayjs/locale/zh-cn';
import './index.scss'
import '../common/css/app.scss';
import { DATE_FORMAT, DATE_CUSTOM_FORMAT } from "@/common/const-scada";


const prefixCls = 'plan-import';
const DatePicker: any = AntdDatePicker;
const RangePicker = DatePicker.RangePicker as unknown as React.FC<RangePickerProps>;
const msg = msgTag('planImport');
const mainTree = JSON.parse(sessionStorage.getItem('mainTree') || '')
const node_name_list = sessionStorage.getItem('node_name_list') || ''
let nodeId = -1, node_alias = '';
mainTree.forEach(item => {
    if (item.alias === node_name_list || item.name === node_name_list) {
        nodeId = item.id
        node_alias = item.alias
    }
})



const PlanImport = () => {
    const [planPointsList, setPlanPointsList] = useState<IPlanPointsListData[]>([])
    const [timeOptions, setTimeOptions] = useState<OptionsType>([])
    const [tableData, setTableData] = useState<IPlanInfoData[]>([])
    const [selectPoints, setSelectPoints] = useState<boolean>(false)
    const [pointsOptions, setPointsOptions] = useState<OptionsType>([])
    const [intervals, setIntervals] = useState<number>(-1)
    const [editKey, setEditKey] = useState<string>('')
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [rangePicker, setRangePicker] = useState<IRangePicker>('date')
    const [modalRangePicker, setModalRangePicker] = useState<IRangePicker>()
    const [batchEditing, setBatchEditing] = useState<boolean>(false)
    const [editedData, setEditedData] = useState<IPlanInfoData[]>([])
    const [saveModaVisible, setSaveModaVisible] = useState<boolean>(false)
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [run, setRun] = useState(false)


    const [form] = Form.useForm();
    const columns: ColumnsType<IPlanInfoData> = [
        {
            title: '',
            dataIndex: 'no',
            key: 'no',
            align: 'center',
            width: '6%',
            render: (text, record, index) => `${index + 1}`
        },
        {
            title: msg('pointName'),
            dataIndex: 'point_name',
            align: 'center',
            width: '28%',
            key: 'name',
        },
        {
            title: msg('time'),
            dataIndex: 'plan_time',
            align: 'center',
            width: '20%',
            key: 'time',
        },
        {
            title: () => (<>{msg('value')}<Tooltip title={msg('editValueTooltip')}><InfoCircleOutlined style={{ marginLeft: 10, cursor: 'pointer' }} /></Tooltip></>),
            dataIndex: 'val',
            align: 'center',
            key: 'value',
            width: '14%',
            render: (val, record) => {
                if (record.key === editKey) {
                    return <Form name="edit" form={form}>
                        <Form.Item
                            name={'editValue'}
                            rules={[
                                {
                                    validator: (_, value) =>
                                        value === Infinity ? Promise.reject(new Error(msg('infinityValue'))) : Promise.resolve(),
                                }
                            ]}
                        >
                            <InputNumber
                                onBlur={() => { handleSaveVal(record) }}
                                onPressEnter={() => { handleSaveVal(record) }}
                                autoFocus
                            />
                        </Form.Item>
                    </Form>
                } else {
                    return <Button
                        style={{ height: '100%', width: '100%', backgroundColor: editedData.findIndex(item => item.key === record.key) === -1 ? '' : '#045355' }}
                        type="link"
                        disabled={!record.edit_flag}
                        onClick={() => { setEditKey(record.key), form.setFieldsValue({ editValue: record.val }) }}>
                        {val || val === 0 ? val.toFixed(3) : '--'}
                    </Button>
                }
            }
        },
        {
            title: msg('unit'),
            dataIndex: 'unit',
            align: 'center',
            key: 'unit',
            width: '11%'
        },
        {
            title: msg('operateTime'),
            dataIndex: 'operate_time',
            align: 'center',
            width: '21%',
            key: 'operateTime',
        },
    ]
    const cycleOptions = [{
        value: 0,
        label: msg('no_cycle'),
    },
    {
        value: 1,
        label: msg('day_cycle'),
    },
    {
        value: 2,
        label: msg('week_cycle'),
    },
    {
        value: 3,
        label: msg('month_cycle'),
    }]


    const getPointsList = async (): Promise<ScadaResponse<IPlanPointsListData[]>> => {
        const res = await _dao.fetchData(`/plan/getAllPlan`, { node_id: nodeId, node_alias: node_alias }, null, 'GET');
        return parseRes(res);
    }
    const queryPlan = async (data: IQueryPlanBody): Promise<IPlanInfoResponse> => {
        const res = await _dao.fetchData(`/plan/searchPlan`, {}, JSON.stringify(data));
        return parseRes(res);
    }
    const editPlanInfo = async (data: IEditPlanBody): Promise<ScadaResponse<null>> => {
        const res = await _dao.fetchData(`/plan/editPlan`, {}, JSON.stringify(data));
        return parseRes(res);
    }
    const exportPlan = async (data: IExportPlanBody) => {
        const res = await _dao.fetchData(`/plan/exportPlan`, {}, JSON.stringify(data));
        return parseRes(res);
    }
    const importPlan = async (formData: FormData): Promise<ScadaResponse<null>> => {
        const res = await _dao.fetchData(`/plan/importPlan`, { date_format: DATE_FORMAT.DATE_TIME }, formData, 'POST', true);
        return parseRes(res);
    }

    const mergeData = (data: IPlanInfoData[]) => {
        return data.reduce<IPlanInfoData[]>((prev, current) => {
            const index = prev.findIndex(item => item.key === current.key);
            if (index === -1) {
                prev.push(current);
            } else {
                prev[index] = {
                    ...prev[index],
                    ...current
                } as IPlanInfoData;
            }
            return prev;
        }, []);
    }
    const findEditedData = (data: IPlanInfoData[]) => {
        const origData: IPlanInfoData[] = sessionStorage.getItem('orig_data') ? JSON.parse(sessionStorage.getItem('orig_data') as string) : [];
        const mergedData = mergeData(data)
        return mergedData.filter(item => {
            const original = origData.find(o => o.key === item.key);
            return original!.val !== item.val;
        });
    }
    const { confirm } = Modal;
    const showConfirm = (callback: Function) => {
        if (editedData.length) {
            confirm({
                title: msg('secondConfirm'),
                icon: <ExclamationCircleFilled />,
                okText: msg('yes'),
                cancelText: msg('no'),
                closable: true,
                keyboard: false,
                onCancel(close) {
                    if (close && close.triggerCancel) {
                        return;
                    }
                    setEditedData([])
                    setEditKey('')
                    setBatchEditing(false)
                    setSelectedRowKeys([])
                    setTableData(JSON.parse(sessionStorage.getItem('orig_data') || ''))
                    close()
                    callback()
                },
                onOk() {
                    setFileList([])
                },
            });
        } else {
            callback()
        }
    };
    const handleTimeSelect = (value) => {
        setIntervals(value)
        form.setFieldsValue({ points: [], range: moment() })
        if (value > 1) {
            setRangePicker('date')
        } else if (value === 1) {
            setRangePicker('month')
        } else {
            setRangePicker('year')
        }
        const point_list = planPointsList.flatMap(item => {
            if (item.interval_val === value) {
                return item.point_list
            } else {
                return []
            }
        }).map(item => {
            if (item) {
                return {
                    value: item.point_id,
                    label: item.point_name
                }
            }
        })
        setPointsOptions(point_list as OptionsType)
        setSelectPoints(true)
    }
    const handleQueryData = () => {
        form.setFieldsValue({ editValue: null, batch_value: null })
        setEditKey('')
        form.validateFields(['time', 'points', 'range']).then(value => {
            setIsLoading(true)
            setTableData([])
            setEditedData([])
            setBatchEditing(false)
            setSelectedRowKeys([])
            let time = rangePicker === 'year' ? value.range.format('YYYY') + '-01-01' : rangePicker === 'month' ? value.range.format('YYYY-MM') + '-01' : value.range.format('YYYY-MM-DD')
            const body: IQueryPlanBody = {
                interval_val: value.time,
                point_list: [value.points],
                start_time: time,
                end_time: time,
                date_format: DATE_FORMAT.DATE_TIME
            }
            queryPlan(body).then((res) => {
                if (daoIsOk(res)) {
                    const { data } = res
                    const newData = data.map(item => {
                        return { ...item, key: item.point_id + item.plan_time }
                    })
                    setTableData(newData)
                    sessionStorage.orig_data = JSON.stringify(newData)
                } else {
                    notify(msg('operateFailed'))
                }
                setIsLoading(false)
            })
        })
    }

    const handleSaveVal = (record: IPlanInfoData) => {
        form.validateFields(['editValue']).then(value => {
            const newTableData = tableData.filter(item => {
                if (item.key === record.key) {
                    item.val = value.editValue
                }
                return item
            })
            setTableData(newTableData)
            setEditedData(findEditedData([...editedData, ...newTableData]))
            setEditKey('')
        })
    }



    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
    }
    const handleSaveBatchEdit = () => {
        form.validateFields(['batch_value']).then(val => {
            // let editData: IPlanInfoData[] = [];
            const newTableData = tableData.map(item => {
                if (selectedRowKeys.indexOf(item.key) !== -1) {
                    // editData = [...editData, { ...item, val: val.batch_value }]
                    return { ...item, val: val.batch_value }
                } else {
                    return item
                }
            })
            setEditedData(findEditedData([...editedData, ...newTableData]))
            setTableData(newTableData)
            setBatchEditing(false)
            setSelectedRowKeys([])
            form.setFieldsValue({ value: null })
        })
    }
    const handleSubmitVal = () => {
        form.validateFields(['time', 'points', 'range', 'cycle_method', 'cycle_time']).then(val => {
            setIsLoading(true)
            let cycleDate;
            if (val.cycle_time && val.cycle_time[0] && val.cycle_time[1]) {
                cycleDate = {
                    loop_start_time: val.cycle_method === 3 ? val.cycle_time[0].format('YYYY-MM') + '-01' : val.cycle_time[0].format('YYYY-MM-DD'),
                    loop_end_time: val.cycle_method === 3 ? val.cycle_time[1].format('YYYY-MM') + '-01' : val.cycle_time[1].format('YYYY-MM-DD')
                }
            }
            const body: IEditPlanBody = {
                interval_val: intervals,
                save_type: val.cycle_method,
                edit_point_list: editedData.map(item => {
                    return {
                        point_id: item.point_id,
                        plan_time: item.plan_time,
                        val: item.val,
                        operate_time: item.operate_time
                    }
                }),
                loop_point_list: tableData.map(item => {
                    return {
                        point_id: item.point_id,
                        plan_time: item.plan_time,
                        val: item.val,
                        fac_alias: item.fac_alias
                    }
                }),
                date_format: DATE_FORMAT.DATE_TIME
            }
            editPlanInfo({ ...body, ...cycleDate }).then(res => {
                setIsLoading(false)
                if (daoIsOk(res)) {
                    notify(msg('operateOK'));
                    setSaveModaVisible(false)
                    handleQueryData()
                    setEditedData([])
                } else if (Number(res.code) === 20001) {
                    notify(res.message);
                    setSaveModaVisible(false)
                    handleQueryData()
                    setEditedData([])
                } else {
                    notify(res.message);
                }
            })
        })
    }
    const handleExportData = () => {
        form.validateFields(['time', 'points', 'range']).then(value => {
            setIsLoading(true)
            let range = rangePicker === 'year' ? value.range.format('YYYY') + '-01-01' : rangePicker === 'month' ? value.range.format('YYYY-MM') + '-01' : value.range.format('YYYY-MM-DD')
            const body: IExportPlanBody = {
                interval_val: intervals,
                point_list: [value.points],
                start_time: range,
                end_time: range,
                language_type: isZh ? 'cn' : 'en',
                date_format: DATE_FORMAT.DATE_TIME
            }
            exportPlan(body).then(async res => {
                if (res.ok) {
                    let fileName;
                    const content = res.headers.get("content-disposition");
                    fileName = content.replace(/.*filename=(.*)/gi, '$1');
                    const blob = await res.blob();
                    saveAs(blob, decodeURIComponent(fileName));
                }
                setIsLoading(false)
            })
        })
    }
    const handleImportPlan = (formData: FormData) => {
        setIsLoading(true)
        importPlan(formData).then(res => {
            if (daoIsOk(res)) {
                notify(msg('operateOK'))
            } else {
                notify(res.message || msg('operateFailed'))
            }
            setIsLoading(false)
        }).finally(() => {
            setFileList([])
        })
    }
    const handleUpload = () => {
        const formData = new FormData();
        let sumSize = 0;
        fileList.forEach(file => {
            formData.append('file', file as RcFile);
            sumSize += Number(file.size)
        });
        setRun(false)
        if (sumSize > 2 * 1024 * 1024) {
            notify(msg('uploadFileError'))
            setFileList([])
        } else {
            handleImportPlan(formData)
        }
    }

    const beforeUnloadListener = useCallback((e) => {
        e.preventDefault();
        e.returnValue = "close";
        return "close";
    }, []);

    const addUnloadHint = () => {
        window.addEventListener("beforeunload", beforeUnloadListener);
    };

    const removeUnloadHint = () => {
        window.removeEventListener("beforeunload", beforeUnloadListener);
    };

    if (editedData.length) {
        addUnloadHint();
    } else {
        removeUnloadHint();
    }
    useEffect(() => {
        setIsLoading(true)
        getPointsList().then((res) => {
            if (daoIsOk(res)) {
                setPlanPointsList(res.data)
                const options = res.data.map(item => {
                    return {
                        value: item.interval_val,
                        label: item.interval_type
                    }
                })
                setTimeOptions(options)
            }
            setIsLoading(false)
        })

    }, [])

    useEffect(() => {
        if (run && fileList.length > 0) {
            handleUpload()
        }
    }, [run])

    return <AntdProvider locale={isZh ? zhCN : enUS} renderEmpty={() => <Empty />}>
        <div className={prefixCls} ref={containerRef}>
            <Form form={form} name="planExport" style={{ display: 'flex' }}>
                <Form.Item name='time'
                    rules={[{
                        required: true, message: msg('pleaseSelect')
                    }]}>
                    <Select
                        style={{ width: 'fit-content', minWidth: 150, marginRight: 10 }}
                        placeholder={msg('selectTime')}
                        options={timeOptions}
                        onSelect={(value) => handleTimeSelect(value)}
                    />
                </Form.Item>
                <Form.Item name='points'
                    rules={[{
                        required: true, message: msg('pleaseSelect')
                    }]}
                >
                    <Select
                        style={{ width: 'fit-content', minWidth: 240, marginRight: 10 }}
                        placeholder={selectPoints ? msg('selectPoints') : msg('selectTimeFirst')}
                        disabled={intervals < 0}
                        maxTagCount={1}
                        showSearch
                        optionFilterProp="label"
                        options={pointsOptions}
                    />
                </Form.Item>
                <Form.Item
                    style={{ marginRight: 10 }}
                    name='range'
                    rules={[{
                        required: true, message: msg('pleaseSelect')
                    }]}
                >
                    <DatePicker
                        allowClear={false}
                        showToday={false}
                        placeholder={msg('selectDate')}
                        disabled={intervals < 0}
                        picker={rangePicker}
                        format={rangePicker === 'year' ? 'YYYY' : rangePicker === 'month' ? DATE_CUSTOM_FORMAT.YEAR_MONTH : DATE_CUSTOM_FORMAT.DATE}
                    />
                </Form.Item>
                <Form.Item name='query'>
                    <Button
                        icon={<SearchOutlined />}
                        style={{ backgroundColor: '#075760', borderColor: 'rgba(1,204,255,.6)' }}
                        onClick={() => showConfirm(handleQueryData)}
                    >
                        {msg('query')}</Button>
                </Form.Item>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    disabled={!selectedRowKeys.length}
                    style={{ marginRight: 10, marginLeft: 10 }}
                    onClick={() => { form.validateFields(['time', 'points', 'range']).then(() => setBatchEditing(true)) }}
                >
                    {msg('batchEdit')}
                </Button>
                <Button
                    style={{ backgroundColor: '#075760', borderColor: 'rgba(1,204,255,.6)' }}
                    icon={<SaveOutlined />}
                    disabled={!tableData.length}
                    onClick={() => { form.validateFields(['time', 'points', 'range', 'editValue']).then(() => setSaveModaVisible(true)) }}
                >
                    {msg('save')}
                </Button>
                <Form.Item style={{ marginLeft: 'auto', marginRight: 10 }} name='download'>
                    <Tooltip title={msg('downloadTooltip')}>
                        <Button type="link" icon={<QuestionCircleOutlined />} onClick={() => showConfirm(handleExportData)}>{msg('downloadData')}</Button>
                    </Tooltip>
                </Form.Item>
                <Upload
                    multiple
                    showUploadList={false}
                    beforeUpload={file => {
                        setFileList((list) => [...list, file]);
                        return false;
                    }}
                    onChange={info => {
                        showConfirm(() => {
                            if (info.file.uid === fileList[fileList.length - 1].uid) {
                                setRun(true)
                            }
                        })
                    }}
                >
                    <Button style={{ backgroundColor: '#075760', borderColor: 'rgba(1,204,255,.6)' }} icon={<DownloadOutlined />}>{msg('importData')}</Button>
                </Upload>
            </Form>
            <Table
                style={{ marginTop: 20 }}
                scroll={{ y: '80vh' }}
                size="small"
                columns={columns}
                dataSource={tableData}
                rowKey={record => record.key}
                pagination={false}
                rowSelection={{
                    selectedRowKeys,
                    onChange: onSelectChange,
                    getCheckboxProps: (record) => ({
                        disabled: !record.edit_flag
                    }),
                }}
            />
            <Modal
                title={msg('batchEdit')}
                visible={batchEditing}
                okText={msg('confirm')}
                cancelText={msg('cancel')}
                onOk={handleSaveBatchEdit}
                onCancel={() => { setBatchEditing(false), form.setFieldsValue({ value: null, batch_value: null }) }}
            >
                <Form name="batchedit" form={form}>
                    <Form.Item
                        label={msg('value')}
                        name='batch_value'
                        rules={[
                            {
                                validator: (_, value) =>
                                    value === Infinity ? Promise.reject(new Error(msg('infinityValue'))) : Promise.resolve(),
                            }
                        ]}>
                        <InputNumber />
                    </Form.Item>
                </Form>
            </Modal>
            <Modal title={msg('modalSaveMethod')} visible={saveModaVisible}
                okText={msg('confirm')}
                cancelText={msg('cancel')}
                onOk={handleSubmitVal}
                onCancel={() => { setSaveModaVisible(false), setModalRangePicker(undefined), form.setFieldsValue({ cycle_method: 0 }) }}
            >
                <Form form={form} name='saveModal'>
                    <div style={{ color: '#849EB3' }}>
                        {msg('modalAlert1')}
                    </div>
                    <div style={{ color: '#849EB3', marginBottom: 4 }}>
                        {msg('modalAlert2')}
                    </div>
                    <Form.Item label={msg('modalCycleMethod')} name='cycle_method' initialValue={0}
                        rules={[{
                            required: true, message: msg('pleaseSelect')
                        }]}>
                        <Select
                            options={cycleOptions}
                            style={{ width: '70%' }}
                            onSelect={(value) => {
                                form.setFieldsValue({ cycle_time: [] })
                                if (value === 0) {
                                    setModalRangePicker(undefined)
                                }
                                else if (value === 1) {
                                    setModalRangePicker('date')
                                } else if (value === 2) {
                                    setModalRangePicker('week')
                                } else {
                                    setModalRangePicker('month')
                                }
                            }} />
                    </Form.Item>
                    {!!modalRangePicker &&
                        <Form.Item name='cycle_time' label={msg('modalCycleRange')} style={{ marginTop: 20 }}
                            rules={[{
                                required: true, message: msg('pleaseSelect')
                            }]}>
                            <RangePicker
                                placeholder={[msg('startTime'), msg('endTime')]}
                                picker={modalRangePicker} style={{ width: '70%' }}
                                format={modalRangePicker === 'date' ? DATE_CUSTOM_FORMAT.DATE : modalRangePicker === 'week' ? DATE_CUSTOM_FORMAT.YEAR_WEEK : DATE_CUSTOM_FORMAT.YEAR_MONTH}
                            />
                        </Form.Item>}
                </Form>
            </Modal>
            <EnvLoading container={containerRef} isLoading={isLoading} />
        </div>
    </AntdProvider>
}


ReactDOM.render(<PlanImport />, document.getElementById(process.env.NODE_ENV === 'development' ? 'center' : 'container'));
