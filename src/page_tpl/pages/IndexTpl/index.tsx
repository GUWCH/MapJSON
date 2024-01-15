import React, { useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { observer, Observer } from 'mobx-react';
import { 
    ConfigProvider, 
    Form, Collapse, Button, Input, Tooltip, 
    Card, Skeleton, Menu, Dropdown, Modal, Upload, Checkbox
} from 'antd';
import { 
    PlusOutlined, 
    SearchOutlined, 
    RightOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    EllipsisOutlined,
    SettingOutlined,
    AppstoreOutlined,
    ExclamationCircleOutlined,
    QuestionCircleOutlined,
    AppstoreAddOutlined,
    EyeOutlined,
    ToolOutlined,
    ExportOutlined,
    ImportOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { _pageDao, daoIsOk } from '@/common/dao';
import { saveAs } from 'file-saver';
import { FontIcon, IconType } from 'Icon';
import { notify } from 'Notify';
import EnvLoading from 'EnvLoading';
import { useStores } from '../../stores';
import { ITplState, IPageTpl, IPage } from '../../stores/tplStore';
import { localText } from '@/common/util-scada';
import { TEMPLATE_MODAL } from '@/common/constants';
import PageForm from './Forms/PageForm';
import ProForm from './Forms/ProForm';
import '../../assets/ant.light.css';
import styles from './style.mscss';

function IndexTpl(props) {
    const nav = useNavigate();
    const location = useLocation();
    const stores = useStores();
    const tplStore: ITplState = stores.tplStore;
    const isDev = stores.isDev;

    const [hoverPageId, setHoverPageId] = useState('');

    useEffect(() => {
        tplStore.getPageTpls().then(() => {
            if(location.state && location.state?.id){
                const pageId = location.state?.id;
                const target = tplStore.filterTpls.find((item) => item.pages?.find((i) => i.id === pageId));

                tplStore.setExpandsTplIds([target?.id]);
                const pageTarget = document.getElementById(pageId);
                pageTarget?.scrollIntoView();

                if (location.state) {
                    nav(location.pathname, {state: null});
                }
            }
        });
    }, []);

    const changeCategory = (record?: any) => {
        tplStore.setModalState({
            type: record ? TEMPLATE_MODAL.CATEGORY_UPDATE : TEMPLATE_MODAL.CATEGORY_NEW,
            record
        });
    };

    const deleteCategory = async (tpl: IPageTpl) => {
        Modal.confirm({
            prefixCls: 'edit-frame-modal',
            title: localText('CATEGORY.PROMPT_DELETE'),
            icon: <QuestionCircleOutlined />,
            content: localText('COMMON.PROMPT_DELETE'),
            onOk() {
                (async () => {
                    tplStore.setLoading(true);
                    const res = await _pageDao.deletePageCategory(tpl.id);
                    if(daoIsOk(res)){
                        tplStore.getPageTpls();
                    }else{
                        notify(localText('COMMON.MSG_DELETE_FAILED'));
                    }
                    tplStore.setLoading(false);
                })();
            },
            onCancel() {},
        });
    }

    const checkeCategory = (tpl: IPageTpl, checked: boolean) => {
        tplStore.checkCategory(tpl.id, checked);
    }

    const checkAll = (tpl: IPageTpl): {all: boolean, part: boolean} => {
        const pageIds = (tpl.pages || []).map(page => page.id);
        const filterPageIds = tplStore.checkedPageIds.filter(id => pageIds.indexOf(id) > -1);
        return {
            all: pageIds.length > 0 && pageIds.length === filterPageIds.length,
            part: filterPageIds.length > 0
        };
    }

    const changeTpl = (record?: any, copy?: boolean) => {
        tplStore.setModalState({
            type: copy 
                ? TEMPLATE_MODAL.TPL_COPY 
                : record && record.id
                    ? TEMPLATE_MODAL.TPL_UPDATE 
                    : TEMPLATE_MODAL.TPL_NEW,
            record
        });
    }

    const deleteTpl = (page: IPage) => {
        Modal.confirm({
            prefixCls: 'edit-frame-modal',
            title: localText('TPL.PROMPT_DELETE'),
            icon: <QuestionCircleOutlined />,
            content: localText('COMMON.PROMPT_DELETE'),
            onOk() {
                (async () => {
                    tplStore.setLoading(true);
                    const res = await _pageDao.deletePageTpl(page.id);
                    if(daoIsOk(res)){
                        tplStore.getPageTpls();
                    }else{
                        notify(localText('COMMON.MSG_DELETE_FAILED'));
                    }
                    tplStore.setLoading(false);
                })();
            },
            onCancel() {},
        });
    }

    const exportTpl = (pageIds?: string[], name?: string) => {
        (async () => {
            tplStore.setLoading(true);
            if(!pageIds){
                if(tplStore.checkedPageIds.length === 0){
                    pageIds = ['all'];
                }else{
                    pageIds = tplStore.checkedPageIds;
                }
            }
            const res = await _pageDao.exportTpl(pageIds);
            if(res.ok){
                let fileName;
                if(name){
                    fileName = `${name}.sql`;
                }else{
                    const content = res.headers.get("content-disposition");
                    fileName = content.replace(/.*filename=(.*)/gi, '$1');
                }
                
                const blob = await res.blob();
                saveAs(blob, fileName)
            }else{
                notify(localText('TPL.MSG_EXPORT_FAILED'));
            }
            tplStore.setLoading(false);
        })();        
    }

    const importTpl = (formData: FormData) => {
        (async () => {
            tplStore.setLoading(true);
            const res = await _pageDao.importTpl(formData);
            if(daoIsOk(res)){
                notify(localText('TPL.MSG_IMPORT_OK'));
                tplStore.getPageTpls();
            }else{
                notify(localText('TPL.MSG_IMPORT_FAILED'));
            }
            tplStore.setLoading(false);
        })();  
    }

    const checkeTpl = (page: IPage, checked: boolean) => {
        tplStore.checkPage(page.id, checked);
    }

    const categoryIcon = (tpl: IPageTpl): ReactNode => {
        return <div>
            <Tooltip placement="top" title={localText('COMMON.TXT_EDIT')}>
                <EditOutlined 
                    style={{color: '#a4a5b3'}} 
                    onClick={e =>{
                        e.stopPropagation();
                        changeCategory(tpl);
                    }}
                />
            </Tooltip>
            <Tooltip placement="top" title={localText('COMMON.TXT_DELETE')}>
                <DeleteOutlined 
                    style={{color: '#a4a5b3', marginLeft: 10}} 
                    onClick={e =>{
                        e.stopPropagation();
                        deleteCategory(tpl);
                    }}
                />
            </Tooltip>                                        
        </div>;
    }

    const tplMenu = (page: IPage): ReactNode => {
        const { editable } = page;
        return <Dropdown 
            trigger={['click', 'hover']}
            overlay={
                <Menu>
                    {
                        editable && <Menu.Item
                            key={1}
                            onClick={(e) => {
                                changeTpl(page);
                            }}
                        >
                            <FontIcon type={IconType.SETTING}  style={{marginRight: 10, fontSize: 12}}/>
                            <span>{localText('COMMON.TXT_CONFIG')}</span>
                        </Menu.Item>
                    }
                    
                    <Menu.Item
                        key={2}
                        onClick={(e) => {
                            changeTpl(page, true)
                        }}
                    >
                        <FontIcon type={IconType.FILE}  style={{marginRight: 10, fontSize: 12}}/>
                        <span>{localText('COMMON.TXT_COPY')}</span>
                    </Menu.Item>
                    {
                        editable && <Menu.Item
                            key={3}
                            onClick={(e) => {
                                exportTpl([page.id as string], page.name);
                            }}
                        >
                            <FontIcon type={IconType.BUILDING}  style={{marginRight: 10, fontSize: 12}}/>
                            <span>{localText('COMMON.TXT_EXPORT')}</span>
                        </Menu.Item>
                    }
                    <Menu.Item
                        key={4}
                        onClick={(e) => {
                            deleteTpl(page);
                        }}
                    >
                        <FontIcon type={IconType.DELETE}  style={{marginRight: 10, fontSize: 12}}/>
                        <span>{localText('COMMON.TXT_DELETE')}</span>
                    </Menu.Item>
                </Menu>
            }
        >
            <Button 
                className={styles.modalBtn}
            >
                <ToolOutlined  style={{fontSize: 30}}/>
                <span>{localText('COMMON.TXT_OPERATE')}</span>
            </Button>
        </Dropdown>;
    }

    const modalForm = () => {
        const modalState = tplStore.modalState;
        switch(modalState.type){
            case TEMPLATE_MODAL.TPL_NEW:
            case TEMPLATE_MODAL.TPL_UPDATE:
            case TEMPLATE_MODAL.TPL_COPY:
                return <PageForm />
            case TEMPLATE_MODAL.CATEGORY_NEW:
            case TEMPLATE_MODAL.CATEGORY_UPDATE:
                return <ProForm containerCls={styles.content}/>
        }
        return null;
    }

	return (
        <ConfigProvider prefixCls='edit-frame'>
		<div className={`${styles.tpl}`}>
            <div className={styles.header}>
                <div>
                    <Button type='primary' onClick={e => {
                        //nav('/editor', {replace: true, state: {id: 1}});
                        changeTpl();
                    }}>
                        <PlusOutlined />
                        <span>{localText('TPL.TITLE_NEW')}</span>
                    </Button>
                    <Button 
                        style={{marginLeft: 10}} 
                        onClick={() => changeCategory()}
                    >{localText('CATEGORY.TITLE_NEW')}</Button>
                </div>
                <div>
                    <Button onClick={e => {
                        exportTpl();
                    }}>
                        <ExportOutlined />
                        <span>{localText('COMMON.TXT_EXPORT')}</span>
                    </Button>
                    <Upload
                        showUploadList={false}
                        customRequest={(option) => {
                            // TODO
                            let formData = new FormData();
                            formData.append('file', option.file);
                            importTpl(formData);
                        }}
                    >
                        <Button 
                            style={{marginLeft: 10, marginRight: 10}}
                        >
                            <UploadOutlined />
                            <span>{localText('COMMON.TXT_IMPORT')}</span>
                        </Button>
                    </Upload>
                    
                    <Input 
                        style={{width: 250}} 
                        type="search" 
                        prefix={<SearchOutlined />}
                        placeholder={localText('COMMON.TXT_SEARCH_MULTI')}
                        onChange={e => {
                            tplStore.setSearchText(e.target.value);
                        }}
                        allowClear={true}
                    />
                </div>
            </div>
            <div className={styles.content}>
            {
                tplStore.filterTpls.map((tpl: IPageTpl, ind) => {
                    const { name, pages, id } = tpl;
                    const check = checkAll(tpl);

                    return <Collapse
                        key={id}
                        className={styles.collapse}
                        activeKey={tplStore.expandsTplIds}
                        bordered={false}
                        expandIcon={({ isActive }) => <RightOutlined rotate={isActive ? 90 : 0} />}
                        onChange={key => {
                            tplStore.setExpandsTplIds(key);
                        }}
                    >
                        <Collapse.Panel 
                            key={id as string}
                            header={
                                <>
                                <span title={localText('TPL.TITLE_SELECT_EXPORT')} style={{marginRight: 5}}>
                                    <Checkbox 
                                        indeterminate={!check.all && check.part}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            return false;
                                        }}
                                        onChange={(e) => {
                                            checkeCategory(tpl, e.target.checked);
                                        }} 
                                        checked={check.all}
                                    >
                                    </Checkbox>
                                </span>
                                {name}
                                </>
                            } 
                            extra={categoryIcon(tpl)}
                            className={styles.panel}
                        >
                            <div className={styles.cards}>
                                {
                                    pages?.map((page, index) => {
                                        const { name: pageName, image, sign, id, editable, product_owned } = page;

                                        return <Card
                                            key={index}
                                            hoverable
                                            title={
                                                <div>
                                                    <p>
                                                        <span title={localText('TPL.TITLE_SELECT_EXPORT')} style={{marginRight: 5}}>
                                                            <Checkbox 
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    return false;
                                                                }}
                                                                onChange={(e) => {
                                                                    checkeTpl(page, e.target.checked);
                                                                }} 
                                                                checked={tplStore.checkedPageIds.indexOf(page.id) > -1}
                                                            >
                                                            </Checkbox>
                                                        </span>
                                                        {pageName}
                                                    </p>
                                                    <p className={styles.sign}>{localText('COMMON.TXT_SIGN')}: {sign}</p>
                                                </div>
                                            }
                                            className={`${styles.card} ${hoverPageId===id ? styles.cardHover : ''} ${product_owned ? styles.cardProduct: ''}`}
                                            id={id}
                                            onMouseOver={(e) => {
                                                setHoverPageId(id as string);
                                            }}
                                            onMouseOut={(e) => {
                                                setHoverPageId('');
                                            }}
                                        >
                                            <div className={styles.overlay}>
                                                {
                                                    image 
                                                    ? <img src={image}/>
                                                    : <Skeleton.Image />
                                                }
                                            </div>
                                            <div className={`${styles.modal}`}>
                                                {
                                                    isDev && <Button 
                                                        className={styles.modalBtn}
                                                        onClick={e => {
                                                            window.open(`${window.location.pathname}#/page/${sign}`);                                                            
                                                            //nav(`/page/${sign}`, {replace: true});
                                                        }}
                                                    >
                                                        <EyeOutlined style={{fontSize: 30}}/>
                                                        <span>{localText('COMMON.TXT_PREVIEW')}</span>
                                                    </Button>
                                                }
                                                {
                                                    editable && <Button 
                                                        className={styles.modalBtn}
                                                        onClick={e => {
                                                            nav(`/editor`, {replace: true, state: {...JSON.parse(JSON.stringify(page))}});
                                                        }}
                                                    >
                                                        <EditOutlined style={{fontSize: 30}}/>
                                                        <span>{localText('COMMON.TXT_EDIT')}</span>
                                                    </Button>
                                                }                                                
                                                {tplMenu(page)}
                                            </div>
                                        </Card>
                                    })
                                }
                            
                                <Card
                                    hoverable
                                    className={styles.card}
                                >
                                    <Button  
                                        className={styles.aloneBtn}
                                        onClick={e => changeTpl({category_id: tpl.id})}
                                    >
                                        <PlusOutlined />
                                    </Button>
                                </Card>
                            </div>
                        </Collapse.Panel>
                    </Collapse>
                })
            }
            </div>
            {modalForm()}
            <Observer>{
                () => 
                <EnvLoading 
                    isLoading={tplStore.isLoading} 
                />
            }</Observer>
        </div>
        </ConfigProvider>
	);
}

export default observer(IndexTpl);