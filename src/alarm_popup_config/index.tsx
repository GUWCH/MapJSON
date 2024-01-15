import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Button, Radio, Switch, Table } from 'antd';
import { msgTag } from "@/common/lang";
import { BaseDAO, _dao, daoIsOk } from '../common/dao';
import Intl from '../common/lang';
import { notify } from "Notify";
import { parseRes } from "@/common/dao/basedao";
import './index.scss'
import '../common/css/app.scss';

interface ITableData {
    key: string;
    siteType: string;
    siteValue: number;
    levelName: string;
    level: number;
    setup: string
}
interface ISiteTypeData {
    id: string;
    name: string;
    actual_value: string;
    display_value: string;
    status: number;
}
interface IPopupContent {
    isDouble: boolean;
    tableData: ITableData[];
}
interface IUserPreferenceData {
    content: string;
    id?: string;
    is_desc: string;
    description: string;
    newExp?: boolean;
    type: string;
    username?: string;
}

const prefixCls = 'alarm-popup-config';
const msg = msgTag('alarmConfig');
const commonMsg = msgTag('common');


export const AlarmPopupConfig = () => {
    const [doublePop, setDoublePop] = useState<boolean>(false);
    const [tableData, setTableData] = useState<ITableData[]>([]);
    const [contentId, setContentId] = useState<string>('');

    const columns = [
        {
            title: msg('siteType'),
            dataIndex: 'siteType',
            key: 'siteType'
        },
        {
            title: msg('alarmLevel'),
            dataIndex: 'levelName',
            key: 'levelName'
        },
        {
            title: msg('popupConfig'),
            dataIndex: 'setup',
            key: 'setup',
            render: (_, record) => (
                <Radio.Group value={record.setup} onChange={(e) => { handleSelectPopup(e, record) }}>
                    <Radio value={'1'}>{msg('popup1')}</Radio>
                    <Radio value={'2'}>{msg('popup2')}</Radio>
                </Radio.Group>
            )
        }
    ]

    const getUserPreference = async (data): Promise<ScadaResponse<IUserPreferenceData[]>> => {
        const res = await _dao.fetchData(`/scadaweb/user_preference/get`, {}, JSON.stringify(data));
        return parseRes(res);
    }
    const insertUserPreference = async (data: IUserPreferenceData) => {
        const res = await _dao.fetchData(`/scadaweb/user_preference/insert`, {}, JSON.stringify(data));
        return parseRes(res);
    }
    const updateUserPreference = async (data: IUserPreferenceData) => {
        const res = await _dao.fetchData(`/scadaweb/user_preference/update`, {}, JSON.stringify(data));
        return parseRes(res);
    }
    const deleteUserPreference = async (data): Promise<ScadaResponse<IUserPreferenceData[]>> => {
        const res = await _dao.fetchData(`/scadaweb/user_preference/delete`, {}, JSON.stringify(data));
        return parseRes(res);
    }
    const get_menu_info = async (data): Promise<ScadaResponse<ISiteTypeData[]>> => {
        const res = await _dao.fetchData('/scadaweb/get_menu_info', {}, JSON.stringify(data), 'POST');
        return parseRes(res)
    }

    const handleSelectPopup = (e, record) => {
        setTableData(tableData.map(item => {
            if (item.key === record.key) {
                return {
                    key: record.key,
                    siteType: record.siteType,
                    siteValue: record.siteValue,
                    levelName: record.levelName,
                    level: record.level,
                    setup: e.target.value
                }
            }
            return item
        }))
    }
    const handleSwitch = (checked) => {
        setDoublePop(checked)
        const data: IUserPreferenceData = {
            content: JSON.stringify({
                isDouble: checked,
                tableData: tableData
            }),
            id: contentId,
            is_desc: "1",
            description: "popup",
            type: "3030"
        }
        updateUserPreference(data).then(res => {
            if (daoIsOk(res)) {
                // initializationDoublePopupData(false)
            } else {
                notify(msg('openFail'))
            }
        })
    }

    const popupset = (key: string, preTableData: ITableData[], level: number): string => {
        if (preTableData.length && preTableData.findIndex(item => item.key === key) !== -1) {
            return preTableData.find(item => item.key === key)?.setup as string
        } else {
            return level === 3 ? '2' : '1'
        }
    }

    const getDoublePopupData = async (isFirstGet: boolean, preTableData: ITableData[], id?: string) => {
        const alarmLevel = await _dao.getAlarmLevel();
        const siteTypeQuery = { 'menu_name': [Intl.isZh ? '厂站类型' : 'Substation_type'] }
        const siteType = await get_menu_info(siteTypeQuery)

        const newTableData: ITableData[] = [];
        if (siteType.data && alarmLevel.data) {
            siteType.data.forEach(item => {
                alarmLevel.data.forEach(level => {
                    newTableData.push({
                        key: String(item.id) + String(level.id),
                        siteType: item.display_value,
                        siteValue: Number(item.actual_value),
                        level: level.value,
                        levelName: level.name,
                        setup: popupset(String(item.id) + String(level.id), preTableData, level.value)
                    })
                })
            })
        }

        setTableData(newTableData)

        if (!isFirstGet && id) {
            const data: IUserPreferenceData = {
                content: JSON.stringify({
                    isDouble: true,
                    tableData: newTableData
                }),
                id: id,
                is_desc: "1",
                description: "popup",
                type: "3030"
            }
            updateUserPreference(data)
        }
        if (isFirstGet) {
            const data: IUserPreferenceData = {
                content: JSON.stringify({
                    isDouble: true,
                    tableData: newTableData
                }),
                is_desc: "1",
                description: "popup",
                type: "3030"
            }
            insertUserPreference(data).then(res => {
                if (daoIsOk(res)) {
                    setContentId(res.id)
                }
            })
        }
    }

    const initializationDoublePopupData = (): void => {
        const data = {
            description: "popup",
            is_desc: "1",
            type: "3030"
        }
        getUserPreference(data).then(res => {
            if (res.code === '10000') {
                if (res.data && res.data[0]) {
                    setContentId(res.data[0].id as string)
                    const { content, id } = res.data[0]
                    if (content.length === 1) {
                        getDoublePopupData(false, [], id);
                        setDoublePop(content === '1');
                    } else {
                        const data = JSON.parse(content)
                        getDoublePopupData(false, data.tableData, id)
                        setDoublePop(data.isDouble)
                    }
                } else {
                    setDoublePop(false)
                    getDoublePopupData(true, [])
                }
            }
        })
    }
    const handleSaveData = () => {
        const data: IUserPreferenceData = {
            content: JSON.stringify({
                isDouble: true,
                tableData: tableData
            }),
            id: contentId,
            is_desc: "1",
            description: "popup",
            type: "3030"
        }
        updateUserPreference(data).then((res: ScadaResponse<string>) => {
            if (daoIsOk(res)) {
                notify(msg('saveSuccess'));
            } else {
                notify(msg('saveFail'));
            }
        })
    }
    const handleResetData = () => {
        const data = {
            description: "popup",
            is_desc: "1",
            type: "3030"
        }
        getUserPreference(data).then(res => {
            if (res.code === '10000' && res.data[0]) {
                const content = JSON.parse(res.data[0].content)
                setTableData(content.tableData)
                notify(msg('resetSuccess'))
            } else {
                notify(msg('resetFail'))
            }
        })
    }

    useEffect(() => {
        initializationDoublePopupData()
    }, [])

    return (
        <div className={prefixCls}>
            <div className={`${prefixCls}-switch`}>
                <span>{msg('placeholder')}</span><Switch onChange={handleSwitch} checked={doublePop}></Switch>
            </div>
            {doublePop && <div className={`${prefixCls}-table`}>
                <Table columns={columns} dataSource={tableData} pagination={false}
                    scroll={{ y: `calc(100vh - 300px)` }}></Table>
            </div>}
            {doublePop && <div className={`${prefixCls}-button`}>
                <Button style={{ marginRight: '10px' }} onClick={() => { handleResetData() }}>{commonMsg('reset')}</Button>
                <Button onClick={() => { handleSaveData() }}>{msg('save')}</Button>
            </div>}
        </div>
    )
}

ReactDOM.render(<AlarmPopupConfig />, document.getElementById('popup_cfg'));
