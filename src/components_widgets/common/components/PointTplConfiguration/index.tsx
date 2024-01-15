import React, { useEffect, useMemo, useState } from 'react';
import { observer, Observer } from 'mobx-react';
import { Input, Select, Popover, Row, Col, Space } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { notify } from 'Notify';
import { IconType, FontIcon } from 'Icon';
import msg from '@/common/lang';
import { POINT_TABLE } from '@/common/constants';
import { DefaultButton, PrimaryButton } from 'Button';
import { confirm, StyledModal as Modal } from 'Modal';
import PointSelect, { BasicItem, Item } from 'PointSelect';
import DropDown, { DropDownProps, DropDownComponentType } from 'DropDown';
import { getPointConfigurationI18nMap } from '../../i18n';
import { DataStore } from './dataStore';
import {
    Point,
    PointsTemplate,
    PointWithConf,
    LightPlateCondition
} from './models';
import { group, isValidTemplateName } from './utils';
import styles from './index.module.scss';
import { isProductEnv } from '@/common/const-scada';

const isZh = msg.isZh

export const NORMAL_DEFAULT_COLOR = '#124B5C';
export const GREEN_COLOR = 'rgba(88,245,192,0.7)'
export const RED_COLOR = 'rgba(250,70,92,0.7)'

export type PointGroup = {
    type: typeof POINT_TABLE[keyof typeof POINT_TABLE]
    name: string
    points: Point[]
}

export type Configurable = Partial<{
    showTitle: boolean
    showStyle: boolean
    condition: boolean
    convert: boolean
    showValueMap: boolean
}>

export type PointConfiguratorProps = {
    visible?: boolean
    candidates: Point[]
    configurable?: Configurable
    pointTypes?: typeof POINT_TABLE[keyof typeof POINT_TABLE][]
    dataStore: DataStore
    currentTplId?: string
    onClose: () => void
}
export enum FieldName {
    pointCandidates = 'pointCandidates',
    domainId = 'domainId',
    modelId = 'modelId',
    modelNumber = 'selectedModel',
}

const PointConfigurator: React.FC<PointConfiguratorProps> = ({
    pointTypes,
    dataStore,
    visible,
    candidates,
    configurable,
    currentTplId,
    onClose
}) => {
    const i18n = getPointConfigurationI18nMap()
    const {
        tplMap,
        tplList,
        nonStandardPoints,
        saveTpl,
        renameTpl,
        deleteTpl
    } = dataStore
    const [currentTpl, setCurrent] = useState<PointsTemplate>(tplList.find(t => t.id === currentTplId) || tplList[0])
    const originTpl = tplMap && currentTpl && tplMap[currentTpl.id]

    const [editState, setEditState] = useState({ visible: false, id: '', name: '', name_en: '' })
    const [saveState, setSaveState] = useState({ visible: false, name: '', name_en: '' })

    const { groups, candidatesMap }: {
        groups: PointGroup[],
        candidatesMap: { [key: string]: Point }
    } = useMemo(() => {
        const allPoints = candidates.concat(nonStandardPoints).filter(
            p => (
                !Array.isArray(pointTypes) ||
                pointTypes.length === 0 ||
                pointTypes.map(t => String(t)).includes(String(p.tableNo))
            )
        );
        const groups = group(allPoints);

        const map = groups.flatMap(c => c.points).reduce((p, c) => ({
            ...p,
            [c.key]: c
        }), {})

        return {
            groups: groups,
            candidatesMap: map
        }
    }, [candidates, nonStandardPoints, pointTypes])

    const resetTplPoints = (points: Omit<Item, 'dropDownContent'>[]) => {
        setCurrent(curTpl => {
            const pointMap = (curTpl?.points ?? []).reduce((p, c) => ({
                ...p,
                [c.key]: { ...c }
            }), {}) || {}

            const newPoints: PointWithConf[] = points.map(p => {
                if (pointMap[p.key]) {
                    return Object.assign({}, pointMap[p.key])
                }

                let valueMap: { [key: string | number]: LightPlateCondition } = {};
                if (String(candidatesMap[p.key].tableNo) === String(POINT_TABLE.YX)) {
                    valueMap = {
                        0: {
                            value: 0,
                            background: GREEN_COLOR,
                            isTop: '0'
                        },
                        1: {
                            value: 1,
                            background: RED_COLOR,
                            isTop: '0'
                        }
                    }
                }
                return Object.assign({ conf: { valueMap } }, candidatesMap[p.key])
            })

            return Object.assign({}, curTpl, { points: newPoints });
        });
    }

    const selectedItems: Item[] = (currentTpl?.points || []).map(p => {
        const constNames = p.const_name_list || [];

        let contents: DropDownProps['content'] = [];
        if (configurable?.showTitle) {
            contents.push({
                name: i18n('showName'),
                members: [{
                    component: DropDownComponentType.INPUT,
                    key: isZh ? 'showTitleCn' : 'showTitleEn'
                }]
            });
        }
        if (configurable?.condition &&
            [String(POINT_TABLE.YC), String(POINT_TABLE.PROD)].indexOf(String(p.tableNo)) > -1
        ) {
            contents.push({
                members: [{
                    component: DropDownComponentType.CONDITION,
                    key: 'conditions',
                    type: 'ycCondition'
                }]
            });
        }

        if (configurable?.convert &&
            [String(POINT_TABLE.YC), String(POINT_TABLE.PROD)].indexOf(String(p.tableNo)) > -1
        ) {
            contents.push({
                members: [{
                    component: DropDownComponentType.CONDITION,
                    type: 'convert',
                    key: 'convert'
                }]
            });
        }

        if (configurable?.showValueMap) {
            contents.push({
                members: [{
                    key: '',
                    component: DropDownComponentType.CUSTOM,
                    customRender: <PointSelect
                        limitNum={-1}
                        selectedData={constNames.map(c => {
                            return {
                                title: isZh ? c.name : c.name_en,
                                key: c.value,
                                dropDownContent: <DropDown
                                    key={c.value}
                                    data={(p.conf?.valueMap || {})[c.value] || {}}
                                    content={[{
                                        name: i18n('colorSet'),
                                        members: [{
                                            component: 'colorPick',
                                            key: 'background',
                                        }]
                                    }, {
                                        name: i18n('isTop'),
                                        members: [
                                            {
                                                component: 'select',
                                                key: 'isTop',
                                                type: '',
                                                options: [{
                                                    value: '1',
                                                    name: i18n('yes')
                                                }, {
                                                    value: '0',
                                                    name: i18n('no')
                                                }]
                                            }
                                        ]
                                    }]}
                                    onChange={(args) => {
                                        setCurrent(curTpl => {
                                            const temp = JSON.parse(JSON.stringify(curTpl));
                                            const curPoint = temp.points.find(point => point.key === p.key);
                                            if (curPoint) {
                                                curPoint.conf = curPoint.conf || {};
                                                curPoint.conf.valueMap = curPoint.conf.valueMap || {};
                                                curPoint.conf.valueMap[c.value] = Object.assign({}, curPoint.conf.valueMap[c.value] || {}, args);
                                            }
                                            return temp;
                                        });
                                    }}
                                />
                            }
                        })}
                        options={constNames.map(c => {
                            return {
                                id: c.value,
                                key: c.value,
                                title: isZh ? c.name : c.name_en,
                                value: c.value,
                                needLabelShow: true
                            }
                        })}
                        onChange={() => { }}
                        needDelete={false}
                        needSelect={false}
                        treeProps={{
                            treeDefaultExpandAll: true,
                        }}
                        dropDownStyle={{ width: "100%" }}
                    />
                }]
            });
        }

        return {
            title: (isZh ? p.name.cn : p.name.en) || '',
            key: p.key,
            dropDownContent: <Observer>{() => <DropDown
                key={p.key}
                data={p.conf || {}}
                content={contents}
                onChange={(args) => {
                    setCurrent(curTpl => {
                        const temp = JSON.parse(JSON.stringify(curTpl));
                        const curPoint = temp.points.find(point => point.key === p.key);
                        if (curPoint) {
                            curPoint.conf = Object.assign({}, curPoint.conf, args || {});
                        }
                        return temp;
                    });
                }}
            />}</Observer>
        }
    })

    useEffect(() => {
        setCurrent(tplList.find(t => t.id === currentTplId) || tplList[0]);
    }, [currentTplId, tplList])

    useEffect(() => {
        if (tplList && !currentTpl) {
            setCurrent(tplList[0])
        }
    }, [tplList, currentTpl])

    const handleCancel = () => {
        onClose()
    }

    return <>
        {
            visible &&
            <Modal
                destroyOnClose={true}
                centered={true}
                visible={true}
                width={300}
                closable={false}
                onCancel={() => {
                    handleCancel();
                }}
                footer={<div className={styles.footer}>
                    <DefaultButton
                        onClick={handleCancel}
                    >{i18n('cancel')}</DefaultButton>
                    <DefaultButton
                        disabled={currentTpl === originTpl}
                        onClick={() => {
                            setSaveState(s => Object.assign({}, s, { visible: true }));
                        }}
                    >{i18n('saveAs')}</DefaultButton>
                    <PrimaryButton
                        disabled={currentTpl === originTpl}
                        onClick={() => {
                            if (currentTpl) {
                                saveTpl(currentTpl, () => {
                                    handleCancel()
                                })
                            }
                        }}
                    >{i18n('save')}</PrimaryButton>
                </div>}
                title={<div className={styles.header}>
                    <Select
                        value={currentTpl?.id}
                        onChange={(v) => {
                            tplMap && setCurrent(tplMap[v])
                        }}
                        size={'small'}
                        bordered={false}
                        suffixIcon={<FontIcon type={IconType.DIRECT_DOWN} style={{ color: '#fff' }} />}
                        optionLabelProp={'label'}
                    >{
                            tplList.map(t => {
                                return <Select.Option key={t.id} value={t.id} label={isZh ? t.name : t.name_en}>
                                    <div className={styles.headerOption}>
                                        <Popover content={isZh ? t.name : t.name_en} zIndex={1060}>
                                            <div className={styles.headerOptionLabel}>{isZh ? t.name : t.name_en}</div>
                                        </Popover>
                                        <div>
                                            <Popover content={i18n('edit')} zIndex={1060}>
                                                <EditOutlined
                                                    style={{ color: '#8A8B99', marginRight: '13px' }}
                                                    onClick={(e) => {
                                                        setEditState({
                                                            visible: true,
                                                            name: t.name,
                                                            name_en: t.name_en,
                                                            id: t.id
                                                        });
                                                        e.stopPropagation();
                                                    }}
                                                />
                                            </Popover>
                                            {
                                                tplList.length <= 1 ? null :
                                                    <Popover content={i18n('delete')} zIndex={1060}>
                                                        <DeleteOutlined style={{ color: '#8A8B99' }} onClick={(e) => {
                                                            confirm({
                                                                title: i18n('delete_warning'),
                                                                content: i18n('delete_content'),
                                                                onOk: () => {
                                                                    deleteTpl(t.id, () => {
                                                                        setCurrent(tplList[0])
                                                                    })
                                                                }
                                                            })

                                                            e.stopPropagation()
                                                        }} />
                                                    </Popover>
                                            }
                                        </div>
                                    </div>
                                </Select.Option>
                            }
                            )
                        }</Select>
                    <div className={styles.reset} onClick={() => {
                        confirm({
                            title: i18n('reset_warning'),
                            content: i18n('reset_content'),
                            onOk: () => originTpl && setCurrent(originTpl)
                        })
                    }}>
                        <FontIcon type={IconType.RESET} style={{ marginRight: 5 }} />
                        {i18n('reset')}
                    </div>
                </div>}
            >
                <div className={styles.content}>
                    <PointSelect
                        limitNum={-1}
                        onChange={(items: Omit<Item, 'dropDownContent'>[]) => {
                            resetTplPoints(items)
                        }}
                        selectedData={selectedItems}
                        options={
                            groups.flatMap(g => {
                                const arr: BasicItem[] = []
                                arr.push({
                                    key: g.name,
                                    id: g.name,
                                    value: g.name,
                                    title: g.name,
                                    needLabelShow: false
                                })
                                return arr.concat(g.points.map(p => ({
                                    key: p.key,
                                    id: p.key,
                                    pId: g.name,
                                    value: p.key,
                                    title: (isZh ? p.name.cn : p.name.en) || '',
                                    needLabelShow: true
                                })))
                            })
                        }
                    />
                </div>
            </Modal>
        }

        <Modal
            destroyOnClose={true}
            visible={editState.visible}
            paddingSize='big'
            title={i18n('edit_modal')}
            zIndex={1050}
            onCancel={() => {
                setEditState({ visible: false, id: '', name: '', name_en: '' });
            }}
            footer={<div className={styles['edit-btn-group']}>
                <DefaultButton onClick={() => {
                    setEditState({ visible: false, id: '', name: '', name_en: '' });
                }}>
                    {i18n('cancel')}
                </DefaultButton>
                <PrimaryButton onClick={() => {
                    if ((isProductEnv && !isValidTemplateName(editState.name) && !isValidTemplateName(editState.name_en)) ||
                        (!isProductEnv && !isValidTemplateName(isZh ? editState.name : editState.name_en))) {
                        return false
                    }
                    if (tplList.find(o => {
                        if (o.id === editState.id) {
                            return false
                        }
                        if (isProductEnv) {
                            return o.name === editState.name || o.name_en === editState.name_en
                        }
                        return isZh ? (o.name === editState.name) : (o.name_en === editState.name_en)
                    })) {
                        notify(i18n('save_duplicate'))
                        return false
                    }

                    renameTpl(editState.id, editState.name, editState.name_en, () => {
                        setEditState({ visible: false, id: '', name: '', name_en: '' });
                        if (editState.id !== currentTpl.id) {
                            setCurrent(tplList.find(t => t.id === editState.id) || currentTpl)
                        }
                    })
                }}>
                    {i18n('save')}
                </PrimaryButton>
            </div>}
        >
            <div className={styles.edit} onClick={(e) => e.stopPropagation()}>
                {isProductEnv ?
                    <Space direction="vertical" size="small" style={{ display: 'flex', flex: 1 }}>
                        <Row align='middle' justify='center'>
                            <Col span={6} flex={0}>
                                模板名称
                            </Col>
                            <Col span={18}>
                                <Input
                                    value={editState.name}
                                    maxLength={20}
                                    onChange={(v) => {
                                        const newV = v.target?.value
                                        setEditState(s => Object.assign({}, s, { name: newV }));
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row align='middle' justify='center'>
                            <Col span={6} flex={0}>
                                Tamplate Name
                            </Col>
                            <Col span={18}>
                                <Input
                                    value={editState.name_en}
                                    maxLength={20}
                                    onChange={(v) => {
                                        const newV = v.target?.value
                                        setEditState(s => Object.assign({}, s, { name_en: newV }));
                                    }}
                                />
                            </Col>
                        </Row>
                    </Space> :
                    <div className={styles.name_input}>
                        <span>{i18n('tpl_name')}</span>
                        <Input className={styles.input}
                            value={isZh ? editState.name : editState.name_en}
                            maxLength={20}
                            onChange={(v) => {
                                const newV = v.target?.value
                                setEditState(s =>
                                    Object.assign({}, s, isZh ? { name: newV } : { name_en: newV }))
                            }} />
                    </div>
                }


            </div>
        </Modal>

        <Modal
            destroyOnClose={true}
            visible={saveState.visible}
            paddingSize='big'
            title={i18n('saveAs_title')}
            onCancel={() => {
                setSaveState({ visible: false, name: '', name_en: '' })
            }}
            footer={<div className={styles['saveas-btn-group']}>
                <DefaultButton
                    onClick={() => setSaveState({ visible: false, name: '', name_en: '' })}
                >
                    {i18n('cancel')}
                </DefaultButton>
                <PrimaryButton
                    onClick={() => {
                        if (currentTpl) {
                            if (
                                (isProductEnv && !isValidTemplateName(saveState.name) && !isValidTemplateName(saveState.name_en)) ||
                                (!isProductEnv && !isValidTemplateName(isZh ? saveState.name : saveState.name_en))
                            ) {
                                return
                            }
                            if (tplList.find(tpl => {
                                if (isProductEnv) {
                                    return tpl.name == saveState.name || tpl.name_en == saveState.name_en
                                }
                                return isZh ? tpl.name == saveState.name : tpl.name_en == saveState.name_en
                            })) {
                                notify(i18n('save_duplicate'))
                                return
                            }
                            saveTpl({
                                name: saveState.name,
                                name_en: saveState.name_en,
                                points: currentTpl.points
                            }, () => {
                                setSaveState({ visible: false, name: '', name_en: '' })
                            })
                        }
                    }}
                >
                    {i18n('save')}
                </PrimaryButton>
            </div>}>
            <div className={styles.saveas}>
                {isProductEnv ?
                    <Space direction="vertical" size="small" style={{ display: 'flex', flex: 1 }}>
                        <Row align='middle' justify='center'>
                            <Col span={6} flex={0}>
                                模板名称
                            </Col>
                            <Col span={18}>
                                <Input
                                    maxLength={20}
                                    onChange={(v) => {
                                        const newV = v.target?.value
                                        setSaveState(s => Object.assign({}, s, { name: newV }));
                                    }}
                                />
                            </Col>
                        </Row>
                        <Row align='middle' justify='center'>
                            <Col span={6} flex={0}>
                                Tamplate Name
                            </Col>
                            <Col span={18}>
                                <Input
                                    maxLength={20}
                                    onChange={(v) => {
                                        const newV = v.target?.value
                                        setSaveState(s => Object.assign({}, s, { name_en: newV }));
                                    }}
                                />
                            </Col>
                        </Row>
                    </Space> :
                    <div className={styles.name_input}>
                        <span>{i18n('tpl_name')}</span>
                        <Input
                            maxLength={20}
                            onChange={(v) => {
                                const newV = v.target?.value
                                setSaveState(s => Object.assign({}, s, isZh ? { name: newV } : { name_en: newV }));
                            }}
                        />
                    </div>
                }
            </div>
        </Modal>
    </>
}

export default observer(PointConfigurator)