import React, { useMemo, memo, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { deepCopy, UserConfig } from 'dooringx-lib';
import { CreateOptionsRes } from 'dooringx-lib/dist/core/components/formTypes';
import { IBlockType } from 'dooringx-lib/dist/core/store/storetype';
import { Select, Form, Input, Space, Button } from 'antd';
import { ReactSortable } from "react-sortablejs";
import { MinusCircleOutlined, PlusOutlined, MenuOutlined } from '@ant-design/icons';
import SingleCollapse, { CollapsePanel } from 'SingleCollapse';
import { FormMap } from '../formTypes';
import BaseInfo from '@/components_utils/base';

const uuid = (len?: number, radix?: number) => {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [], i;
  radix = radix || chars.length;

  if (len) {
      // Compact form
      for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data. At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
          if (!uuid[i]) {
              r = 0 | Math.random() * 16;
              uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
          }
      }
  }

  return uuid.join('');
};

export interface TabDataType {
	type: string
};

export interface TabFormPropsType {
	data: CreateOptionsRes<FormMap, 'tab'>;
	current: IBlockType;
	config: UserConfig;
};

const TabForm = (props: TabFormPropsType) => {
  let tabs: any = Object.assign({}, {
    tabs: []
  }, props.current.props).tabs;
  if(tabs.length === 0){
    tabs = [{
      id: uuid(),
      name: '页签'
    }];
  }

  const store = props.config.getStore();

  const onChange = (values: any) => {
    const cloneData = deepCopy(store.getData());
    const newblock = cloneData.block.map((v: IBlockType) => {
      if (v.id === props.current.id) {
        v.props = {...v.props, ...{tabs: values}};
      }
      return v;
    });
    store.setData({ ...cloneData, block: [...newblock] });
  };

  const remove = (index) => {
    tabs.splice(index, 1);
    onChange(tabs);
  };

  const add = () => {
    tabs.push({
      id: uuid(),
      name: '页签'
    });
    onChange(tabs);
  }

  const onValuesChange = (index, e) => {
    tabs[index].name = e.target.value;
    onChange(tabs);
  };

  const sortChange = (values) => {
    onChange(values.map(v => ({id: v.id, name: v.name})));
  }

  return <BaseInfo {...props}>
    <SingleCollapse>
        <CollapsePanel header="页签" key="1">
        <div style={{
            maxHeight: 120, 
            overflow: 'auto',
            border: '1px solid #eee',
            borderRadius: 2,
            background: '#eee',
            padding: 5,
            userSelect: 'none'
          }}
        >
        <ReactSortable 
          list={tabs.map(t => ({...t}))}
          setList={(tabs) => sortChange(tabs)}
          handle='span.anticon'
          filter='.disable_item'
          animation={200}
        >
          {
            tabs.map((tab, index) => {
              const { name, id } = tab;
              return <div key={id} style={{margin: '5px 0'}}>
                <MenuOutlined 
                  style={{marginRight: 5, cursor: 'move'}}
                />
                <Input 
                  placeholder="页签" 
                  style={{ width: 'calc(100% - 40px)' }}  
                  value={name}
                  onChange={e => onValuesChange(index, e)}
                />
                {tabs.length > 1 ? (
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(index)}
                  />
                ) : null}
              </div>
            })
          }
        </ReactSortable>
        </div>
        <Button onClick={() => add()} block icon={<PlusOutlined />}>
          添加
        </Button>
        </CollapsePanel>
    </SingleCollapse>
  </BaseInfo>;
}

export default memo(TabForm);