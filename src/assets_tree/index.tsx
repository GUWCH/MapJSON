import React, { Component, useEffect, useState,useRef} from 'react'
import ReactDOM  from 'react-dom'
import Menu from './Menu'
import './index.scss'
import 'antd/dist/antd.less'
import 'antd/lib/dropdown/style/index.less'

if(process.env.NODE_ENV === 'development'){
	console.log('dev')
	let callback =()=>{}
	let sourceData = null
	let parentNodes = ["USCADA.Farm.Statistics", "储能领域"]
	ReactDOM.render(<div style={{background:'#01333D',
	height: '51px',
	display: 'flex',
	justifyContent: 'flex-start',
	alignItems: 'center',
	paddingLeft: '16px'}}>
		<Menu callback={callback} sourceData={sourceData} parentNodes={parentNodes}/>
	</div>, document.getElementById('center'))
}


let instance;
export const init = function(options){
	let {callback,sourceData,targetDom,parentNodes} = options
	instance = ReactDOM.render(<div style={{
		background:'#01333D',
		height: '51px',
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		paddingLeft: '16px'}}>
		<Menu callback={callback} sourceData={sourceData} parentNodes={parentNodes}/>
	</div>, targetDom)
	return instance
  }


// export const ControlPanelWidget = function (options) {
// 	let dom = options.dom;

// 	if (!dom && !container) {
// 		container = document.createElement('div');
// 		container.style.display = 'none';
// 		document.body.appendChild(container);
// 	}

// 	if (!instance) {
// 		instance = ReactDOM.render(<ControlPanelModal
// 			options={options}
// 		/>, dom || container);
// 	} else {
// 		instance.props.options = options;
// 		instance.setState({
// 			visible: true
// 		});
// 	}

// 	return instance;
// }
