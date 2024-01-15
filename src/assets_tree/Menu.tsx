import React ,{useEffect,useState,useMemo} from 'react'
import StatusTable from './statusTable'
import {_dao} from '../common/dao'
import { msgTag } from '../common/lang';
import { Dropdown,Space,Card,Menu} from "antd";
import type {MenuProps} from 'antd'
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import {BStools} from '../common/utils'
import ScadaCfg from '@/common/const-scada';
import 'antd/dist/antd.less'

const isDev: boolean = process.env.NODE_ENV === 'development';
const msg = msgTag('statusDetail')
export default function MenusTree(props) {
	let {callback,sourceData,parentNodes} = props
	const isZh = true
	let nodeAlias: any = ScadaCfg.getCurNodeAlias() || '';
	if (isDev) {
		nodeAlias = 'USCADA.Farm.Statistics';
		callback = function(e,id,data){
			// console.log('callback',e,id)
		}
		const nodesData = sessionStorage.getItem('nodes')
		sourceData = nodesData?JSON.parse(nodesData):[]
	}
	const [loading, setLoading] = useState(false);
	const [menuData,setMenuData] = useState<Object[]>([])
	const [showFirstMenus,setShowFirstMenus] = useState(false)
	const [menusList,setMenusList] = useState<Object[]>([])
	const [menuName,setMenuName] = useState<Object[]>([])
	
  useEffect(()=>{
    setLoading(true)
	const queries = BStools.getQuery()
	const res =  sourceData?Promise.resolve({data:sourceData}):_dao.getTreeList('', nodeAlias);
	res.then(e=>{
		const sourceData = toTree(e.data)
		let matchedNodes = parentNodes?e.data.filter(el=>parentNodes.includes(el.alias||el.display_name)):[]
		let matchedMenulist:Object[] = []
		console.log('matchedNodes',matchedNodes)
		let matchedNodesNameList = matchedNodes.map((el,index)=>{
			const matchedTreeNode = treeFind(sourceData,(data)=>data.alias == el.alias)
			if(matchedTreeNode.children){
				matchedMenulist[index] = matchedTreeNode.children
			}
			return {name:el.display_name,data:el}
		})
		let menuNameArr = matchedNodesNameList.length?matchedNodesNameList:[{name:sourceData[0].display_name,data:sourceData[0]}]
		let menuList = matchedNodes.length?matchedMenulist:[sourceData[0].children]
		setMenuData(e.data)
		setMenusList(menuList)
		setMenuName(()=>menuNameArr)
	}).catch(e=>{
		console.error('err',e)
	}).finally(()=>{
		setLoading(false)
	})
  },[])
  const handleMenuClick = (e,data,cb)=>{
		const index = data.level
		const nodeType = data.node_type
		// 处理资产树名称
		let menuNameArr = [...menuName]
		menuNameArr[index] = {name:data.display_name,data}
		if(menuNameArr.length-1>index){
			menuNameArr.splice(Number(index)+1,menuNameArr.length-1)
		}
		// 处理资产树子菜单  到场站即可
		if(!data.belowFactory){
			let currentChildMenusList = [...menusList]
			const matchedChildMenusList = menuData.filter(el=>el.pid == data.id)
			currentChildMenusList[index] = matchedChildMenusList
			setMenusList(currentChildMenusList)
			setMenuName(menuNameArr)
		}
		cb(e,'dropdown-click',data)
	}
	// 在树形结构中搜索匹配节点
	function treeFind (tree, func) {
		for (const data of tree) {
		  if (func(data)) return data
		  if (data.children) {
			const res = treeFind(data.children, func)
			if (res) return res
		  }
		}
		return null
	  }
	// 根据pid和level转换成树形结构
	function toTree(data){
		let cloneData = JSON.parse(JSON.stringify(data))    // 对源数据深度克隆
		let superiorFactory:Object[] = []
		let tree = cloneData.filter((father)=>{              //循环所有项
			if(father.node_type == 'FACTORY'){
				superiorFactory.push({id:father.id,name:father.display_name})
			}
				let branchArr = cloneData.filter((child)=>{
					// 给场站以下节点加上标识
					if(father.node_type == 'FACTORY'&&father.id == child.pid){
						child.belowFactory = true
					}
					return father.id == child.pid;//返回每一项的子级数组
				});
				if(branchArr.length>0){
					father.children = branchArr; //如果存在子级，则给父级添加一个children属性，并赋值
				}
				return father.pid==0;//返回第一层
			});
			return tree;    //返回树形数据
	}


  const formattedData = useMemo(() => {
    if (!menusList||!menusList.length) return null;
    
    return menusList;
  }, [menusList]);
  const formattedMenuName = useMemo(()=>{
	if(!menuName||!menuName.length) return null
	return menuName
  },[menuName])
  function showMenuList(){
	setShowFirstMenus(true)
  }
  function hideMenuList(){
	setShowFirstMenus(false)
  }
  return (
    <>
      {!loading  && formattedData&&formattedMenuName && (
        <div className='menuContainer' style={{fontSize: '14px'}}>
			<div className='menuContent'>
				{menuName.map((el,index)=>{
					return <span 
					// onMouseEnter={showMenuList} 
					// onMouseLeave={hideMenuList}
					>
					{index !=0 && <span className='separator' style={{color:'#6A8CA3','fontSize': '18px'}}>/</span>}
					<span className='menuName' style={index!=menuName.length-1?{color:'#6A8CA3',cursor: 'pointer'}:{cursor: 'pointer'}} onClick={e=>callback(e,'menuName',el.data)}>{el.name}</span>
					{menusList[index].length? <Dropdown
						className={`dropdown-common ${index!=menuName.length-1?'dropdown-current':''}`}
						overlay={<Menu>
							{menusList[index].map((mEl,mIndex)=>{
								return (<Menu.Item 
									style={(menuName[index+1]&&mEl.display_name == menuName[index+1].name)?{color:'#ec6941'}:{}} 
									onClick={(e)=>handleMenuClick(e,mEl,callback)
								} key={`firstMenu-${mEl.alias}-${mIndex}`}>{mEl.display_name}</Menu.Item>)})}</Menu>}
					>
					<a onClick={(e) => e.preventDefault()}>
						<Space>
						{el?.data?.node_type!='FACTORY'?<DownOutlined />:null}
						</Space>
					</a>
					</Dropdown>:null}
				{showFirstMenus && <div className='menuList'></div>}
				</span>
				})}
				
			</div>
		</div>
      )}
    </>
  )
}
