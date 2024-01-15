import React, { ReactNode, useCallback, useEffect, useState, useMemo, useRef, useContext } from "react";
import { Select, DatePicker, Button, TableColumnType } from "antd";
import { AntTable } from '@/components';
import { RangePickerProps } from "antd/lib/date-picker";
import { SearchOutlined } from '@ant-design/icons';
import moment from 'moment';
import { notify } from 'Notify';
import { saveAs } from 'file-saver';
import { DATE_CUSTOM_FORMAT, DATE_FORMAT } from '@/common/const-scada';
import { DATE_MOMENT_FORMAT } from '@/common/constants';
import { msgTag, isZh } from "@/common/lang";
import { _dao, daoIsOk } from "@/common/dao";
import ExportSelect from '@/components_utils/ExportSelect'
import { getDateRange, defaultTableParameter, TableParameter } from "../constants";
import { GlobalContext } from "./context";
import styles from './style.mscss';

const RangePicker = DatePicker.RangePicker as unknown as React.FC<RangePickerProps>;
const localText = msgTag('storage');

const defaultDateRange = getDateRange(-1, -2);

const QueryType = {
    SITE: 'fac',
    SUB: 'cess'
} as const;

const DateAggrType = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year'
} as const;

const recordKey = (record: IResStorageAvailability) => record.datatime + record.facName + record.subSysNo;

const getColumns = (type: typeof QueryType[keyof typeof QueryType], page, pageSize, sorter, sorterOrder, total): TableColumnType<any>[] => {
    const cols: (TableColumnType<any> & {isSub?: boolean})[] = [{
        title: '',
        dataIndex: '',
        render: (value: any, record: IResStorageAvailability, index: number) => {;
            return <div style={{textAlign: 'center'}}>{(page - 1) * pageSize + index + 1}</div>;
        }
    },{
        title: localText('column.date'),
        dataIndex: 'datatime',
        render: (value: string, record: IResStorageAvailability, index: number) => {
            return value;
        }
    },{
        title: localText('column.siteName'),
        dataIndex: 'facName',
    },{
        title: localText('column.subNO'),
        dataIndex: 'subSysNo',
        isSub: true
    },{
        title: localText('column.availability'),
        dataIndex: 'tba',
    }];
    return cols.filter(ele => type === QueryType.SUB || !ele.isSub).map((ele) => {
        return Object.assign({}, ele, {
            key: ele.dataIndex,
            fixed: false,
            align: 'left',            
            ellipsis: true,
            sorter: !!ele.dataIndex && !!total,
            sortOrder: sorter === ele.dataIndex ? sorterOrder+'end' : null,
        });
    });
};

const defaultTypeOptions = [{
    label: localText('site'),
    value: QueryType.SITE
},{
    label: localText('subsystem'),
    value: QueryType.SUB
}];

const defaultDateOptions = [{
    label: localText('day'),
    value: DateAggrType.DAY
},{
    label: localText('week'),
    value: DateAggrType.WEEK
},{
    label: localText('month'),
    value: DateAggrType.MONTH
},{
    label: localText('year'),
    value: DateAggrType.YEAR
}];

export const Availability = (props) => {
    const {dispatch, state} = useContext(GlobalContext);    
    const [dataSource, setDataSource] = useState<IResStorageAvailability[]>([]);
    const [date, setDate] = useState({
        startTime: defaultDateRange[0],
        endTime: defaultDateRange[1]
    });
    const [queryType, setQueryType] = useState<typeof QueryType[keyof typeof QueryType]>(QueryType.SITE);
    const [dateGroupType, setDateGroupType] = useState<typeof DateAggrType[keyof typeof DateAggrType]>(DateAggrType.DAY);
    const [tableParameter, setTableParameter] = useState<TableParameter>(defaultTableParameter);
    const tableWrapper = useRef<HTMLDivElement | null>(null);
    const [reqJson, setReqJson] = useState<IReqStorageAvailability>();

    const columns = useMemo(() => {
        return getColumns(
            (reqJson && reqJson.classType) as typeof QueryType[keyof typeof QueryType] || queryType, 
            tableParameter.page, 
            tableParameter.pageSize, 
            tableParameter.sorter, 
            tableParameter.sortOrder,
            tableParameter.total
        );
    }, [queryType, reqJson, tableParameter]);

    const defaultDate: [moment.Moment, moment.Moment]= useMemo(() => {
        return [
            moment(date.startTime, DATE_MOMENT_FORMAT.DATE_TIME),
            moment(date.endTime, DATE_MOMENT_FORMAT.DATE_TIME)
        ]
    }, [date.startTime, date.endTime]);

    const changeQueryType = useCallback((value) => {
        setQueryType(value);
    }, [setQueryType]);

    const changeDateGroupType = useCallback((value) => {
        setDateGroupType(value);
    }, [setDateGroupType]);

    const changeDate = useCallback((dates, dateStrings) => {
        setDate({
            startTime: dates[0].format(DATE_MOMENT_FORMAT.DATE_TIME),
            endTime: dates[1].format(DATE_MOMENT_FORMAT.DATE_TIME),
            //momentStartTime: dates[0],
            //momentEndTime: dates[1]
        });
    }, [setDate]);

    const query = useCallback((newParameter?) => {
        let req: IReqStorageAvailability;
        // from table page, sort, number 
        if(newParameter && reqJson){
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
        }else{
            req = {
                startTime: date.startTime,
                endTime: date.endTime.split(/\s/)[0] + ' 23:59:59',
                classType: queryType,
                timeGroupType: dateGroupType,
                limit: {
                    page: 1,
                    size: tableParameter.pageSize
                },
                dateFormat: DATE_FORMAT.DATE,
                lanType: isZh ? 'cn' : 'en'
            }

            setTableParameter(o => Object.assign({}, defaultTableParameter, { pageSize: o.pageSize }));
        }

        setDataSource([]);
        setTableParameter(o => Object.assign({}, o, {total: 0}));
        dispatch({type: 'loading'});
        (async () => {
            const res = await _dao.storageGetAvailability(req);
            if(daoIsOk(res)){
                // debug
                /* setDataSource(Array.from(Array(100)).map(() => {
                    return {
                        datatime: '2012-03-09 00:00:00',
                        facName: 'siteName',
                        subSysNo: 'subNO',
                        tba: '3445'
                    }
                })); */

                setDataSource(res.data || []);
                setTableParameter(o => Object.assign({}, o, {total: res.total}));
            }else{
                notify(localText('failed'));
            }
            setReqJson(req);
            dispatch({type: 'unLoading'});
        })();
    }, [reqJson, setReqJson, date.startTime, date.endTime, queryType, dateGroupType, tableParameter, setDataSource, setTableParameter]);

    const changeTableParameter = useCallback((pagination, filters, sorter, extra) => {
        switch(extra.action){
            case 'paginate':{
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

    const exportData = useCallback((fileType) => {
        if(fileType && reqJson){
            dispatch({type: 'loading'});

            let temp: IReqStorageAvailability = JSON.parse(JSON.stringify(reqJson));
            delete temp.limit;
            temp.exportType = fileType;

            _dao.storageExportAvailability(temp)
            .then(async (res) => {
                if(res.ok){
                    let fileName;
                    const content = res.headers.get("content-disposition");
                    fileName = content.replace(/.*filename=(.*)/gi, '$1');
                    
                    const blob = await res.blob();
                    saveAs(blob, fileName);
                }else{
                    notify(res.message || localText('downloadFailed'));
                }
            })
            .finally(() => {
                dispatch({type: 'unLoading'});
            });
        }
    }, [reqJson]);

    return <div className={styles.content}>
        <div className={styles.header}>
            <div>
                <Select
                    size={'middle'}
                    style={{ width: 150 }}
                    value={queryType}
                    options={defaultTypeOptions}
                    onChange={changeQueryType}
                />
                <RangePicker
                    defaultValue={defaultDate}
                    showTime={false}
                    format={DATE_CUSTOM_FORMAT.DATE}
                    allowClear={false}
                    onChange={changeDate}
                />
                <Select
                    size={'middle'}
                    style={{ width: 150 }}
                    value={dateGroupType}
                    options={defaultDateOptions}
                    onChange={changeDateGroupType}
                />
                <Button 
                    type="primary" 
                    icon={<SearchOutlined />} 
                    onClick={() => {
                        query();
                    }}
                >
                    {localText('search')}
                </Button>
            </div>
            <div>
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
                    x: true
                }}
                rowKey={recordKey}
                pagination={{
                    current: tableParameter.page,
                    pageSize: tableParameter.pageSize,
                    total: tableParameter.total,
                    showSizeChanger: true,
                }}
                onChange={changeTableParameter}
            />
        </div>
    </div>;
}