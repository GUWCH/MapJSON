/* eslint-disable */

import React, { Component } from "react";
import ReactDOM from "react-dom";
import ControlDialog from "./ControlDialog";
import { msgTag } from "../common/lang";
import { ControlPanel } from './ControlPanel';
import cfg from './config.json';

const msg = msgTag("control");

class ControlPanelModal extends Component {
	constructor(props) {
		super(props);

		this.state = {
			visible: true
		}
	}

	static propTypes = {
	};

	static defaultProps = {
	};

	componentWillMount() {
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			visible: true
		});
	}

	componentDidMount() {
	}

	shouldComponentUpdate(nextProps, nextState) {
		return true;
	}

	render() {
		const { options } = this.props;
		const visible = this.state.visible;
		return visible ? (
			<ControlDialog
				classes={{
					paperScrollPaper:'control-panel-dialog'
				}}
				contentStyle={{
					border: 'none',
					height:'calc(100% - 40px)'
				}}
				visible={visible}
				title={msg('controlPanel')}
				onCancel={() => this.setState({ visible: false })}
				content={
					<ControlPanel
						options={options}
						onDisvisitable={() => this.setState({ visible: false })}
					></ControlPanel>
				}
			/>
		) : null;
	}
}

if (process.env.NODE_ENV === 'development') {
	ReactDOM.render(<ControlPanelModal visible={true} options={{
		config: cfg,
		//facBayAlias: 'F01.Farm.AGC',
		facBayAlias: 'SXGL.V110.AGC',
		bayList: [/* {
			"alias": "F01.T1_L1.WTG001",
			"name": "CESS01"
		},
		{
			"alias": "F01.T1_L1.WTG002",
			"name": "CESS02"
		}, */ {
			"name":"濉溪子系统EMS01",
			"alias":"SXCN.ESS01.CESS"
		},{
			"name":"濉溪子系统EMS02",
			"alias":"SXCN.ESS02.CESS"
		},{
			"name":"濉溪子系统EMS03",
			"alias":"SXCN.ESS03.CESS"
		},{
			"name":"濉溪子系统EMS04",
			"alias":"SXCN.ESS04.CESS"
		}],
		startStopData: {
			treeData: [{
				"id": "444000002",
				"name": "山西广灵润广",
				"alias": "SXGL",
				"link_id": "4000001",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "0",
				"graph_file": "EnFeeder",
				"node_type": "FACTORY",
				"model_id": 0,
				"model": "",
				"display_name": "山西广灵润广",
				"full_name": "山西广灵润广",
				"icon": "test.png",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "0",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "",
				"is_forecast": "false",
				"feeder_id": "0",
				"capacity": "0",
				"fac_type": "3"
			}, {
				"id": "444000036",
				"name": "山西广灵1期",
				"alias": "",
				"link_id": "0",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "444000002",
				"graph_file": "",
				"node_type": "CONTAINER",
				"model_id": 0,
				"model": "",
				"display_name": "山西广灵1期",
				"full_name": "山西广灵1期",
				"icon": "",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "1",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "",
				"is_forecast": "false",
				"feeder_id": "0",
				"capacity": "0",
				"fac_type": "-1"
			}, {
				"id": "444000037",
				"name": "KX01",
				"alias": "SXGL.V35.KX01",
				"link_id": "430000039",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "444000036",
				"graph_file": "Ena1",
				"node_type": "BAY_STATISTIC",
				"model_id": 0,
				"model": "",
				"display_name": "山西广灵润广馈线01",
				"full_name": "山西广灵润广馈线01",
				"icon": "",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "2",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "",
				"is_forecast": "false",
				"feeder_id": "0",
				"capacity": "0",
				"fac_type": "-1"
			}, {
				"id": "444000003",
				"name": "D01",
				"alias": "SXGL.T1_L1.WTG001",
				"link_id": "430000002",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "444000037",
				"graph_file": "Ena1",
				"node_type": "BAY_TURBINE",
				"model_id": 446000001,
				"model": "En-110-2.3",
				"display_name": "WH01",
				"full_name": "山西广灵润广 WH01",
				"icon": "",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "3",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "En-82/1.5",
				"is_forecast": "false",
				"feeder_id": "15000001",
				"capacity": "2300",
				"fac_type": "-1"
			}, {
				"id": "444000004",
				"name": "D02",
				"alias": "SXGL.T1_L1.WTG002",
				"link_id": "430000003",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "444000037",
				"graph_file": "Ena1",
				"node_type": "BAY_TURBINE",
				"model_id": 446000001,
				"model": "En-110-2.3",
				"display_name": "WH02",
				"full_name": "山西广灵润广 WH02",
				"icon": "",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "3",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "En-82/1.5",
				"is_forecast": "false",
				"feeder_id": "15000001",
				"capacity": "2300",
				"fac_type": "-1"
			}, {
				"id": "444000005",
				"name": "D03",
				"alias": "SXGL.T1_L1.WTG003",
				"link_id": "430000004",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "444000037",
				"graph_file": "Ena1",
				"node_type": "BAY_TURBINE",
				"model_id": 446000001,
				"model": "En-110-2.3",
				"display_name": "WH03",
				"full_name": "山西广灵润广 WH03",
				"icon": "",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "3",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "En-82/1.5",
				"is_forecast": "false",
				"feeder_id": "15000001",
				"capacity": "2300",
				"fac_type": "-1"
			}, {
				"id": "444000038",
				"name": "KX02",
				"alias": "SXGL.V35.KX02",
				"link_id": "430000040",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "444000036",
				"graph_file": "Ena1",
				"node_type": "BAY_STATISTIC",
				"model_id": 0,
				"model": "",
				"display_name": "山西广灵润广馈线02",
				"full_name": "山西广灵润广馈线02",
				"icon": "",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "2",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "",
				"is_forecast": "false",
				"feeder_id": "0",
				"capacity": "0",
				"fac_type": "-1"
			}, {
				"id": "444000016",
				"name": "D14",
				"alias": "SXGL.T1_L2.WTG014",
				"link_id": "430000015",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "444000038",
				"graph_file": "Ena1",
				"node_type": "BAY_TURBINE",
				"model_id": 446000001,
				"model": "En-110-2.3",
				"display_name": "WH14",
				"full_name": "山西广灵润广 WH14",
				"icon": "",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "3",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "En-82/1.5",
				"is_forecast": "false",
				"feeder_id": "15000001",
				"capacity": "2300",
				"fac_type": "-1"
			}, {
				"id": "444000017",
				"name": "D15",
				"alias": "SXGL.T1_L2.WTG015",
				"link_id": "430000016",
				"mdm_id": "",
				"order_no": "0",
				"web_url": "",
				"pid": "444000038",
				"graph_file": "Ena1",
				"node_type": "BAY_TURBINE",
				"model_id": 446000001,
				"model": "En-110-2.3",
				"display_name": "WH15",
				"full_name": "山西广灵润广 WH15",
				"icon": "",
				"lat": "0",
				"lon": "0",
				"alt": "0",
				"level": "3",
				"time_zone": "8",
				"benchmark": "false",
				"controller_name": "En-82/1.5",
				"is_forecast": "false",
				"feeder_id": "15000001",
				"capacity": "2300",
				"fac_type": "-1"
			}],
			startAlias: '.Sys.Run',
			stopAlias: '.Stop.Run'
		},
		onSubmit: (value, callback) => {
			callback();
		}
	}}></ControlPanelModal>, document.getElementById('center'))
}

let container;
let instance;
export const ControlPanelWidget = function (options) {
	let dom = options.dom;

	if (!dom && !container) {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	}

	if (!instance) {
		instance = ReactDOM.render(<ControlPanelModal
			options={options}
		/>, dom || container);
	} else {
		instance.props.options = options;
		instance.setState({
			visible: true
		});
	}

	return instance;
}

/* eslint-enable */
