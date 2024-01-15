import React, { Component, useEffect, useState,useRef} from 'react'
import ReactDOM  from 'react-dom'
import FavoriteList from './FavoriteList'
import './index.scss'


if(process.env.NODE_ENV === 'development'){
	console.log('dev')
	let callback =()=>{}
	let sourceData = null
	let parentNodes = ["USCADA.Farm.Statistics", "USCADA.Farm.WindStatistics"]
	ReactDOM.render(<iframe style={{background:'#01333D',
	height: '51px',
	display: 'flex',
	justifyContent: 'flex-start',
	alignItems: 'center',
	paddingLeft: '16px'}}>
		<FavoriteList callback={callback} sourceData={sourceData} parentNodes={parentNodes}/>
	</iframe>, document.getElementById('center'))
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
		<FavoriteList callback={callback} sourceData={sourceData} parentNodes={parentNodes}/>
	</div>, targetDom)
	return instance
  }
