import React from 'react'
import {Space, Table} from 'antd'

function DataTable(props) {
    console.log('table props',props)
    const dataSource = [
        {
          key: '1',
          name: '胡彦斌',
          age: 32,
          address: '西湖区湖底公园1号',
        },
        {
          key: '2',
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号',
        },
      ];
      
      const columns = [
        {
          title: '姓名',
          dataIndex: 'name',
          key: 'name',
          align:'center',
        },
        {
          title: '年龄',
          dataIndex: 'age',
          key: 'age',
          align:'center',
        },
        {
          title: '住址',
          dataIndex: 'address',
          key: 'address',
          align:'center',
        },
        {
          title:'操作',
          key:'action',
          align:'center',
          render: (_, record) => (
            <Space size="middle">
              <a>Invite {record.name}</a>
              <a>Delete</a>
            </Space>
          ),
        }
      ];
  return (<div>
    <div>DataTable</div>
    <Table dataSource={dataSource} columns={columns} />
  </div>
    
  )
}

export default DataTable