import React, { useRef, memo, useMemo, useState, useEffect, useContext } from 'react';
import { Button, Input, Modal, Upload, Tooltip, Badge, message } from 'antd';
import {
	ArrowLeftOutlined,
	MobileOutlined,
	DownloadOutlined,
	CopyOutlined,
	DeleteOutlined,
	UndoOutlined,
	RedoOutlined,
	FileAddOutlined,
	CodeOutlined,
	SketchOutlined,
	UploadOutlined,
	InstagramOutlined,
	WechatOutlined,
	PlusOutlined,
	MinusOutlined,
	QuestionCircleOutlined
} from '@ant-design/icons';
import { UserConfig, scaleFn, deepCopy } from 'dooringx-lib';
import { useNavigate, useLocation } from "react-router-dom";
import { useIntl, FormattedMessage } from "react-intl";
import domtoimage from 'dom-to-image';
import { _pageDao, daoIsOk } from '@/common/dao';
import { notify } from 'Notify';
import { localText } from '@/common/util-scada';
import { useStores } from '../../../../stores';
import { configContext, LocaleContext } from '../../layouts';
import { PREVIEWSTATE } from '../../constant';
import styles from './index.mscss';

interface HeaderComponentProps {
}

const HeaderComponent = (props: HeaderComponentProps) => {
	const intl = useIntl();
	const globalStores = useStores();
	const isDev = globalStores.isDev;
	const location = useLocation();
	const config = useContext(configContext);
	const navgiator = useNavigate();
	const commander = config.getCommanderRegister();
	const iptRef = useRef<Input>(null);
	const locale = useContext(LocaleContext);
	const pointData = config.getStore().getData().block;
	const stepData = config.getStore().getStoreList();
	const { value, maxValue, minValue } = config.getScaleState();

	const [open, setOpen] = useState(false);

	const clearData = () => {
		localStorage.setItem(PREVIEWSTATE, JSON.stringify([]));
		commander.exec('clear');
	};

	const redohandler = () => {
		config.getStore().redo();
	};

	const undohandler = () => {
		config.getStore().undo();
	};

	const handleSaveTpl = () => {
		globalStores.pageStore.setLoading(true);

		const node = document.getElementById('yh-container');
		domtoimage.toPng(node, {
			quality: 0.1
		})
		.then(function (dataUrl) {
			const json = config.getStore().getData();
			const JSONres = JSON.stringify(json);
			_pageDao.savePageTpl({...(location.state as object), ...{content: JSONres, image: ''}})
				.then(res => {
					if(daoIsOk(res)){
						const newData = stepData.slice(stepData.length - 1);
						config.getStore().resetToInitData(deepCopy(newData));
						config.getStore().replaceList(deepCopy(newData));
					}else{
						notify(intl.formatMessage({id: 'usd.fail' }));
					}
				})
				.finally(() => {
					globalStores.pageStore.setLoading(false);
				});
		})
		.catch(function (error) {
			console.error('oops, something went wrong!', error);
		})
		.finally(() => {
			globalStores.pageStore.setLoading(false);
		});
	};

	const deleteAll = () => {
		Modal.confirm({
			prefixCls: 'edit-frame-modal',
			title: intl.formatMessage({id: 'usd.confirmClear' }),
			okText: intl.formatMessage({id: 'usd.confirm' }),
			cancelText: intl.formatMessage({id: 'usd.cancel' }),
			onOk() {
				clearData();
			},
		});
	};

	const newPage = () => {
		clearData();
	};

	const handleSaveCode = () => {
		Modal.confirm({
			prefixCls: 'edit-frame-modal',
			title: '确定要下载吗? ',
			okText: '确定',
			cancelText: '取消',
			onOk() {
				const sid = localStorage.getItem('sid');
				// 下载
			},
		});
	};

	const createAndDownloadFile = (fileName: string) => {
		const aTag = document.createElement('a');

		const json = config.getStore().getData();

		const JSONres = JSON.stringify(json);
		const blob = new Blob([JSONres]);
		aTag.download = fileName;
		const url = URL.createObjectURL(blob);
		aTag.href = url;
		aTag.click();
		URL.revokeObjectURL(url);
	};

	const setScale = (isAdd: boolean = true) => {
		if(isAdd){
			scaleFn.increase(0.1, config);
		}else{
			scaleFn.decrease(0.1, config);
		}
	};

	return (
		<div className={styles.header}>
			<Button 
				type='link' 
				onClick={() => {
					if(stepData.length > 1){
						Modal.confirm({
							prefixCls: 'edit-frame-modal',
							title: localText('COMMON.PROMPT_LEAVE'),
							icon: <QuestionCircleOutlined />,
							onOk() {
								commander.exec('clear');
								navgiator('/tpl', {state: location.state});
							},
							onCancel() {},
						});
					}else{
						commander.exec('clear');
						navgiator('/tpl', {state: location.state});
					}
				}}
			>
				<ArrowLeftOutlined />
				<span><FormattedMessage id='usd.tmplList' /></span>
			</Button>
			<div className={styles.controlArea}>
				<Tooltip placement="bottom" title={<FormattedMessage id='usd.undo' />}>
					<Button
						type="link"
						style={{ marginRight: '6px' }}
						onClick={undohandler}
					>
						<UndoOutlined />
					</Button>
				</Tooltip>

				<Tooltip placement="bottom" title={<FormattedMessage id='usd.redo' />}>
					<Button
						type="link"
						style={{ marginRight: '6px' }}
						onClick={redohandler}
						disabled={!pointData.length}
					>
						<RedoOutlined />
					</Button>
				</Tooltip>

				<Tooltip placement="bottom" title={<FormattedMessage id='usd.clear' />}>
					<Button
						type="link"
						style={{ marginRight: '6px' }}
						onClick={deleteAll}
						disabled={!pointData.length}
					>
						<DeleteOutlined />
					</Button>
				</Tooltip>
				{
					isDev && <Tooltip placement="bottom" title={<FormattedMessage id='usd.uploadJson' />}>
						<Button
							type='link'
							onClick={() => {
								setOpen(true);
							}}
						>
							<UploadOutlined />
						</Button>
					</Tooltip>
				}

				<Tooltip placement="bottom" title={<FormattedMessage id='usd.downloadJson' />}>
					<Button
						type='link'
						onClick={() => {
							createAndDownloadFile('uscada_tmpl.json');
						}}
						disabled={!pointData.length}
					>
						<DownloadOutlined />
					</Button>
				</Tooltip>
				<span>
					<Button type='link' onClick={() => setScale(false)}><MinusOutlined /></Button>
					<span>{`${(value * 100).toFixed(0)}%`}</span>
					<Button type='link' onClick={() => setScale(true)}><PlusOutlined /></Button>
				</span>
			</div>
			<div>
				{
					isDev && <Button
						style={{ marginRight: '8px' }}
						onClick={() => {
							window.open(`${window.location.pathname}#/page/${location.state.sign}`);
							//navgiator('/page');
						}}
					>
						<FormattedMessage id='usd.preview' />
					</Button>
				}
				
				<Button
					style={{ marginRight: '8px' }}
					onClick={handleSaveTpl}
					disabled={stepData.length <= 1}
				>
					<FormattedMessage id='usd.saveTmpl' />
				</Button>
				{/* <Button
					onClick={() => {
						locale.change((pre: localeKey) => {
							return pre === 'zh-CN' ? 'en' : 'zh-CN';
						});
					}}
				>
					<FormattedMessage id='usd.switchLang' />
				</Button> */}

				{/* <Button
					onClick={() => {
						window.open('/iframe');
					}}
				>
					iframe 预览
				</Button>
				<Tooltip placement="bottom" title="新建页面">
					<Button
						type="link"
						style={{ marginRight: '6px' }}
						title="新建页面"
						onClick={newPage}
					>
						<FileAddOutlined />
					</Button>
				</Tooltip>

				<Tooltip placement="bottom" title="下载源码">
					<Button
						type="link"
						style={{ marginRight: '6px' }}
						onClick={handleSaveCode}
						disabled={!pointData.length}
						title="下载源文件"
					>
						<DownloadOutlined />
					</Button>
				</Tooltip>
				<Input
					style={{ width: 200 }}
					value={value}
					onChange={(e) => setValue(e.target.value)}
				></Input>
				<Button
					onClick={() => {
						const leftprops: Partial<LeftRegistComponentMapItem> = {
							type: 'basic',
							img: 'https://img.guguzhu.com/d/file/android/ico/2021/09/08/rytzi2w34tm.png',
						};
						config.scriptSingleLoad(value, leftprops);
					}}
				>
					远程组件
				</Button> */}
			</div>
			<Modal
				visible={open}
				onCancel={() => setOpen(false)}
				onOk={() => setOpen(false)}
				title={'import json'}
			>
				<Upload
					name="file"
					maxCount={1}
					showUploadList={false}
					beforeUpload={(file) => {
						// 解析并提取excel数据
						let reader = new FileReader();
						reader.onload = function (e: Event) {
							let data = (e as any).target.result;
							config.getStore().resetToInitData([JSON.parse(data)]);
							setOpen(false);
						};
						reader.readAsText(file);
					}}
				>
					<Button icon={<UploadOutlined />}>&nbsp; 点击上传</Button>
				</Upload>
			</Modal>
		</div>
	);
};

export default HeaderComponent;
