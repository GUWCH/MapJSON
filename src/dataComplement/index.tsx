import React, { Component, useEffect, useState,useRef} from 'react'
import ReactDOM  from 'react-dom'
import DataTable from './components/Table'
import TreeComponent from './components/Tree'
import DatePickerComponent from './components/DatePicker'
import './index.scss'
import { Button, Col, Row } from 'antd'

(function(){
		ReactDOM.render(<div style={{'padding':'20px'}}>
      <Row className='dateSelect'>
        <DatePickerComponent />
        <TreeComponent></TreeComponent>
        <Col span={4}><Button type={'primary'}>查询</Button></Col>
      </Row>
        <DataTable></DataTable>
	</div>, document.getElementById('center'))
  })()
