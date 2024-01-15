import React, { ReactNode, useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import {StyledModal} from "Modal";
import { _dao, daoIsOk } from '@/common/dao';
import { isDevelopment, InputTextSize } from "@/common/constants";
import Intl from '@/common/lang';
import ScadaCfg, { DATE_FORMAT } from '@/common/const-scada';
import { DateUtil } from '@/common/utils';
import { Select, Input, Tooltip } from "antd";
import _ from "lodash";
import { notify } from "Notify";
import { AntdProvider } from "@/common/antd.provider";
import styles from 'style.mscss';

const { TextArea } = Input;

const isZh = Intl.isZh;

const intlDesc = isZh ? {
	remark: '备注：',
	type: '类型：',
	time: '挂牌时间：',
	func: '功能：',
	user: '操作员：',
	success: '操作成功',
	fail: '操作失败'
} : {
	remark: 'Comment: ',
	type: 'Type: ',
	time: 'Time: ',
	func: 'Function: ',
	user: 'User: ',
	success: 'Succeed',
	fail: 'Failed'
}

const mockData = {
    "children_list": [
        {
            "checkable": true,
            "id": "769",
            "name": "检修置牌",
            "usable": true
        },
        {
            "checkable": false,
            "id": "770",
            "name": "接地置牌",
            "usable": true
        },
        {
            "checkable": true,
            "id": "771",
            "name": "危险置牌",
            "usable": true
        },
        {
            "checkable": true,
            "id": "772",
            "name": "故障置牌",
            "usable": true
        },
        {
            "checkable": true,
            "id": "773",
            "name": "现场工作",
            "usable": true
        }
    ],
    "id": "255",
    "name": "设置标志牌",
    "type": "",
    "usable": true
}

const mockTipData = [{
    "alias": "SXGL.T1_L1.WTG002",
    "bay_name": "WH02",
    "token_id": "770",
    "token_name": "接地置牌",
    "icon_name": "Grounding",
    "note": "demo 置牌 2023/03/27 18:41:02\n"
},{
    "alias": "SXGL.T1_L1.WTG002",
    "bay_name": "WH02",
    "token_id": "770",
    "token_name": "接地置牌",
    "icon_name": "Grounding",
    "note": "demo 置牌 2023/03/27 18:41:02\n"
}]

const SetTokenApp = (props) => {
	let {visitable, aliasKey, data = {}, timestamp} = props;

	const [isVisitable, setIsvisitable] = useState(false);
	const [curData, setCurData] = useState(JSON.parse(JSON.stringify(data)));

	useEffect(() => {
		setIsvisitable(visitable);
		setCurData(data);
	}, [timestamp])

	const handleSelectChange = (valList) => {
		let newChildrenList = (curData.children_list || []).map((d) => {
			let checkable = valList.indexOf(d.id) > -1;
			const rawD = data?.children_list?.find(rd => rd.id === d.id);
			return Object.assign({}, 
				d, 
				{checkable}, 
				!checkable && ("remark" in rawD) ? {remark: rawD.remark} : {}
			)
		})

		setCurData({...curData, children_list: newChildrenList})
	}

	const handleMarkChange = (id, text) => {
		let newChildrenList = (curData.children_list || []).map((d) => {
			if(id === d.id){
				return Object.assign({}, d, {remark: text})
			}else{
				return d
			}
		})

		setCurData(Object.assign({}, curData, {children_list: newChildrenList}))
	}

	const handleSubmit = () => {
		// loading
		setIsvisitable(false)

		let diff = (curData.children_list || []).filter((d) => {
			const rawD = data?.children_list?.find( rd => d.id === rd.id);

			return !_.isEqual(d, rawD);
		})

		_dao.multiHandlePopupMenu(diff.map(f => {
			let id = f.id;
			if(!f.checkable){
				id = String(Number(f.id) + 15)
			}
			return {
				...f, 
				id: id,
				alias: aliasKey
			}
		})).then(responses => {
			let ok = true;
			for (let response of responses) {
				if (!response.ok) {
					ok = false;
				}
			}
			if (ok) {
				return responses;
			}
			throw new Error('popMenu failed');
		}).then((responses) => {
			return Promise.all(responses.map(res => res.json()));
		}).then((res) => {
			let isAllOk = true;
			let failList: any[] = [];
			res.map((r, index) => {
				if(!daoIsOk(r)){
					isAllOk = false;
					failList.push(diff[index].name)
				}
			})

			if(failList.length > 0){
				let text = '';
				failList.map(l => {
					text = text + l + ' ';
				})
				notify(`${text}${intlDesc.fail}`)
			}

			if(isAllOk){
				notify(intlDesc.success);
			}
		})

		// end loading
	}

	return curData.usable ? <AntdProvider>
		<StyledModal
			bodyStyle={{height: `${window.innerHeight - 400}px`, overflowY: 'auto'}}
			title= {curData.name || ''}
			visible={isVisitable}
			onOk={handleSubmit}
			onCancel={() => setIsvisitable(false)}
			destroyOnClose={true} 
		>
			<Select
				className={styles.select}
				style={{width: '100%'}}
				mode="multiple"
				value={(curData.children_list || []).filter(d => d.checkable).map((d) => d.id)}
				onChange={handleSelectChange}
				options={(curData.children_list || []).map((d) => {
					return {
						value: d.id,
						label: d.name,
						disabled: String(d.usable) == 'false'
					}
				})}
			/>
			{(curData.children_list || []).filter(d => d.checkable).map((d, index) => {
				return <div key={index} className={styles.remarkContainer}>
					<div>{`${d.name}${isZh ? '' : ' '}${intlDesc.remark}`}</div>
					<TextArea
						className={styles.text}
						value={(d.remark || '').trim()}
						showCount
						maxLength={InputTextSize.Middle}
						style={{ height: 100, resize: 'none' }}
						onChange={(e) => handleMarkChange(d.id, e.target.value)}
					/>
				</div>
			})}
		</StyledModal>
	</AntdProvider> : null
}

let container;
let instance;
export const SetToken = function (aliasKey, data = mockData) {
	if (!container) {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	}

	if(isDevelopment){
		_dao.getPopupMenu(`1:430:${aliasKey}:1`).then((res) => {

			let devData = mockData;

			if(daoIsOk(res)){
				devData = res.data.find(d => d.id === '255');
			}

			if (!instance) {
				instance = ReactDOM.render(
					<SetTokenApp 
						visitable = {true}
						aliasKey = {`1:430:${aliasKey}:1`}
						data = {devData}
						timestamp = {new Date().getTime()}
					/>, container
				);
			}
		})
	}else{
		if (!instance) {
			instance = ReactDOM.render(
				<SetTokenApp 
					visitable = {true}
					aliasKey = {aliasKey}
					data = {data}
					timestamp = {new Date().getTime()}
				/>, container
			);
		}
	}

	return instance;
}

const tokenTip = (t: IToken) => {
	return <div>
		<div>
			<span>{intlDesc.type}</span>
			<span>{t.token_name}</span>
		</div>
		<div>
			<span>{intlDesc.time}</span>
			<span>{t.time}</span>
			{/* <span>{t.time ? DateUtil.format(t.time as string, 0, DATE_FORMAT.DATE_TIME) : ''}</span> */}
		</div>
		<div>
			<span>{intlDesc.user}</span>
			<span>{t.user}</span>
		</div>
		<div>
			<span>{intlDesc.func}</span>
			<span>{t.func}</span>
		</div>
		<div>
			<span>{intlDesc.remark}</span>
			<span>{t.remark}</span>
		</div>
	</div>
}

interface IShowTokenImg {
	data?: IToken;
	imgProps?: {
		style?: React.CSSProperties
	};
}
const emptyToken: IToken = {
	icon_name: '',
	alias: ''
};
const ShowTokenImg = React.memo((props: IShowTokenImg) => {
	const { imgProps = {}, data = emptyToken, ...rest} = props;

	return <Tooltip 
		key={data.icon_name}
		placement={'top'}
		trigger={'hover'}
		title = {() => tokenTip(data)}
		destroyTooltipOnHide={{keepParent: false}}
		{...rest}
	>
		<img 
			src={`${ScadaCfg.token.path}${data.icon_name}${ScadaCfg.token.ext}`} 
			style={{
				width: 20,
				height: 20
			}}
			{...imgProps}
		/>
	</Tooltip> ;
}, (prevProps, nextProps) => {
	let same = _.isEqual(prevProps.data, nextProps.data) && _.isEqual(prevProps.imgProps?.style, nextProps.imgProps?.style);
	return same;
});

interface IShowToken {
	tokenData?: IToken[];
	children?: ReactNode;
	width?: number
	height?: number
}
export const ShowToken = (props: IShowToken) => {
	const {children, tokenData = [], width, height} = props;

	return <>
		{
			tokenData.map((t) => {
				return <ShowTokenImg 
					key={t.icon_name} 
					data={t} 
					imgProps={{
						style: {
							width: width ?? 20,
							height: height ?? 20
						}
					}}
				></ShowTokenImg>;
			})
		}
		{children}
	</>;
}

export const ShowTokenClient = (domNode, tipData = mockTipData) => {
	if (!domNode) {
		return;
	}
	
	ReactDOM.render(
		<ShowToken 
			tokenData={tipData}
		></ShowToken>, domNode
	);
}

export const unmountTokenNodeClient = (domNode) => {
	ReactDOM.unmountComponentAtNode(domNode);
}