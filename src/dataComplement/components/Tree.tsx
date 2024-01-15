import React, { useRef, useState } from 'react'
import Tree, { TreeNode } from "rc-tree";
import { notify } from 'Notify';
import { msgTag } from "../../common/lang";
import "rc-tree/assets/index.css";
import { Col ,Modal, Tag} from 'antd';
import Dialog from '../../components/Dialog';

function TreeComponent(props) {
    const { 
        title, 
        content, 
        classes = {}, 
        handleClass = 'env-draggable-dialog-title', 
        visible = false, 
        hasAction = false, 
        hasCancel = true, 
        // onOk, 
        // onCancel, 
        ...otherProps 
    } = props;
    const msg = msgTag("dataComplete");

    const [keyword, setKeyword] = useState(undefined);
    const [expandKeys, setExpandKeys] = useState([]);
    const [autoExpandParent, setAutoExpandParent] = useState(false);
    const [filterKeys, setFilterKeys] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [checkedNum,setCheckedNum] = useState(0)
    const [maxLimit,setMaxLimit] = useState('')
    const [checkedNodes, setCheckedNodes] = useState([]);
    const [isExceed,setIsExceed] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(visible);
    const treeRef = useRef(null);
    const onExpand = (expandedKeys) => {
		setExpandKeys(expandedKeys);
		setAutoExpandParent(false);
	};
    const onOk = ()=>{
        
    } 
    const onCancel = ()=>{
        setIsModalOpen(false)
    } 
    const onCheck = (keys, info) => {
        const checkedArr = info.checkedNodes.filter((o) => isLeafNode(o))
        console.log('checks',keys, info,checkedArr)
		setCheckedNum(checkedArr.length)
        console.log('after set',checkedNum)
		if(maxLimit&&checkedArr.length > maxLimit){
			notify(msg('selectedExceed'));
			setIsExceed(true)
		}else{
			setIsExceed(false)
		}
		setCheckedNodes(info.checkedNodes.filter((o) => isLeafNode(o)));
	};

    const showModal = () => {
        console.log('showModal')
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const isLeafNode = (node) => {
		return !node.children || node.children.length <= 0;
	};

    function getTreeData() {
        // big-data: generateData(1000, 3, 2)
        return [
          {
            key: '0',
            title: 'node 0',
            children: [
              { key: '0-0', title: 'node 0-0' },
              { key: '0-1', title: 'node 0-1' },
              {
                key: '0-2',
                title: 'node 0-2',
                children: [
                  { key: '0-2-0', title: 'node 0-2-0' },
                  { key: '0-2-1', title: 'node 0-2-1' },
                  { key: '0-2-2', title: 'node 0-2-2' },
                ],
              },
              { key: '0-3', title: 'node 0-3' },
              { key: '0-4', title: 'node 0-4' },
              { key: '0-5', title: 'node 0-5' },
              { key: '0-6', title: 'node 0-6' },
              { key: '0-7', title: 'node 0-7' },
              { key: '0-8', title: 'node 0-8' },
              {
                key: '0-9',
                title: 'node 0-9',
                children: [
                  { key: '0-9-0', title: 'node 0-9-0' },
                  {
                    key: '0-9-1',
                    title: 'node 0-9-1',
                    children: [
                      { key: '0-9-1-0', title: 'node 0-9-1-0' },
                      { key: '0-9-1-1', title: 'node 0-9-1-1' },
                      { key: '0-9-1-2', title: 'node 0-9-1-2' },
                      { key: '0-9-1-3', title: 'node 0-9-1-3' },
                      { key: '0-9-1-4', title: 'node 0-9-1-4' },
                    ],
                  },
                  {
                    key: '0-9-2',
                    title: 'node 0-9-2',
                    children: [
                      { key: '0-9-2-0', title: 'node 0-9-2-0' },
                      { key: '0-9-2-1', title: 'node 0-9-2-1' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            key: '1',
            title: 'node 1',
            // children: new Array(1000)
            //   .fill(null)
            //   .map((_, index) => ({ title: `auto ${index}`, key: `auto-${index}` })),
            children: [
              {
                key: '1-0',
                title: 'node 1-0',
                children: [
                  { key: '1-0-0', title: 'node 1-0-0' },
                  {
                    key: '1-0-1',
                    title: 'node 1-0-1',
                    children: [
                      { key: '1-0-1-0', title: 'node 1-0-1-0' },
                      { key: '1-0-1-1', title: 'node 1-0-1-1' },
                    ],
                  },
                  { key: '1-0-2', title: 'node 1-0-2' },
                ],
              },
            ],
          },
        ];
      }
    const defaultExpandedKeys = ['0', '0-2', '0-9-2'];
      return (
        <Col span={10} >
            <div className='dateLabel treeSelect'>选择设备</div>
            <div className='dateLabel selectedContent ' onClick={showModal}>{
                checkedNodes.map(el=>{
                    return <Tag className='selectTag'>{el.title}</Tag>
                })
            }</div>
             <Dialog
                //保证在按钮和loading之间
                style={{ zIndex: 900000 }}
                handleClass={handleClass}
                disableTypography
                classes={{
                    paperScrollPaper: 'control-modal-pager-scroll',
                    ...classes
                }} 
                draggable 
                titleClasses={{
                    root: 'control-modal-title-class',
                }} 
                maxWidth='lg' 
                contentClasses={{
                    root: 'control-modal-content-class'
                }} 
                action={hasAction ? <div>
                    <button
                        onClick={(e) => {
                            onOk && onOk(e);
                        }}
                    >{msg('ok')}</button>
                    {hasCancel && <button
                        onClick={(e) => {
                            onCancel && onCancel();
                        }}
                    >{msg('cancel')}</button>}
                </div> : null
                } 
                actionsClasses={{
                    root: hasAction ? 'control-modal-action-class' : 'control-modal-action-class-disabled'
                }} 
                open={isModalOpen} 
                title={
                    <div>
                        {title}
                        <span 
                            className={'control-panel-close-icon'} 
                            onClick={() => onCancel && onCancel()}
                        ></span>
                    </div>
                }
                content={<fieldset className="control-device-panel">
                  <div>已选择：{checkedNum}</div>
                <div className='className="control-device-list"'>
                    <Tree
                    onExpand={onExpand}
                    // autoExpandParent={autoExpandParent}
                    showLine
                    filterTreeNode={(node) => {
                        return keyword && filterKeys.indexOf(node.key) > -1;
                    }}
                    onCheck={onCheck}
                    expandedKeys={expandKeys}
                    switcherIcon
                    checkable
                    style={{display:'inline-block'}}
                    selectable={false}
                    ref={treeRef}
                    // treeData={treeData.map(d => {
                    //     if(d.iconPath){
                    //         d.icon = (props)=>{
                    //             return <span
                    //                 style={{
                    //                     width: 16,
                    //                     height: 16,
                    //                     display: 'inline-block',
                    //                     background: `url(${d.iconPath}) 0 0 no-repeat`
                    //                 }}
                    //             ></span>;
                    //         }
                    //     }
                    //     return d;
                    // })}
                    defaultExpandedKeys={defaultExpandedKeys}
                    treeData={getTreeData()}
                    ></Tree>
                </div>
                </fieldset>} 
                {...otherProps}
            ></Dialog>
        </Col>
  )
}

export default TreeComponent