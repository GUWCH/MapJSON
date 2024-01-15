import React from 'react';
import styles from './index.mcss';
import deep from 'deep';
import Dropdown from './EnDropDown';
import Scroll from './EnScroll';
import _ from 'lodash';

var createReactClass = require('create-react-class');

var fmt=(row,col)=>typeof col.fmt(row[col.key],row, col) === 'string' ? col.fmt(row[col.key],row, col) : undefined;

export default createReactClass({
    getDefaultProps(){
        return {
            frozenColumn:0,
            frozenAfter:0,
            firstLoad:true,
            sortColumn:"",
            pager:true,
            page:0,
            pageSize:50,
            sortDir:"",
            columns:[],
            data:[]
        };
    },

    getInitialState() {
        this.clientWidth = 0;
        this.updateStyle(this.props);
        return {
            columns:this.dealColumns(this.props),
            sortColumn:this.props.sortColumn,
            sortDir:this.props.sortDir,
            page:this.props.page,
            pageSize:this.props.pageSize,
            data:this.props.data.map((row,i)=>Object.assign(row,{key:i}))
        };
    },

    updateStyle(props){
        Object.entries({  
            cellStyle:{width:200,height:47,lineHeight:'47px',backgroundColor:'rgba(81,81,81,0.3)',verticleAlign:'middle',borderRight:'solid 1px rgba(255,255,255,0.1)',textAlign:'right'},
            titleStyle:{height:49,backgroundColor:'rgba(0,0,0,0.4)',borderTop:'solid 1px rgba(0,0,0,0.3)',borderBottom:'solid 1px rgba(0,0,0,0.3)'},
            alterStyle:{backgroundColor:'rgba(0,0,0,0.25)'},
            frozenStyle:{},
            sortStyle:{color:'#00ccff'},
            hoverStyle:{backgroundColor:'rgba(0,204,255,0.5)'},
            style:{width:'100%',height:'100%'},
        }).forEach(([key,value])=>this[key]=Object.assign(value,props[key]));
    },

    componentWillReceiveProps(np){
        var props = this.props;
        this.updateStyle(np);

        if(!_.isEqual(_.omit(props.columns, _.functions(props.columns)), _.omit(np.columns, _.functions(np.columns)))){
            this.setState({
                columns:this.dealColumns(np),
                sortColumn:np.sortColumn,
                sortDir:np.sortDir
            },this.Resize);
        }

        if(np.sortDir != props.sortDir || np.sortColumn != props.sortColumn){
            this.setState({
                sortColumn:np.sortColumn,
                sortDir:np.sortDir
            });
        }
        
        if(!_.isEqual(np.data, props.data)){
            this.setState({
                data:np.data.map((row,i)=>Object.assign(row,{key:i}))
            },()=>this.gotoPage(np.data.length == props.data.length || np.onData ? this.state.page : np.page,true));
        }

        if(np.count !== props.count || np.page != props.page || np.pageSize != props.pageSize){
            this.setState({pageSize:np.pageSize},()=>this.gotoPage(np.page,true));
        }
    },


    //************************************* 处理columns,每次收到新的columns信息时，做一些处理
    dealColumns(np){
        var columns = np.columns;

        if(!columns){
            console.error('必须指定列描述信息[columns属性],格式为columns={[{title:"column1",style:{width:124}}, ....]}');
            return [];
        }

        columns = deep.clone(columns);      

        //---------------  检查有什么非法属性,顺便规格化一些style,设置每个column的left  -------------        

        for(let i=0;i<columns.length;i++){
            let o=columns[i];
            if(typeof o === 'string'){
                o = {title:o};
            }
            Object.assign(o,{style:Object.assign({width:this.cellStyle.width},o.style,{left:0,top:0})})
            o.sortable = o.sortable !== false;
            let style = o.style;

            if(!/^[0-9\.]+(px)?$/.test(style.width)){
                console.error('列宽度必须为数字，或者px');
                return [];
            }
            style.width = Number.parseFloat(style.width);

            if(style.height){
                console.error('不可以单独设置列高度，请在cellStyle中设置');
                return [];
            }

            if(o.title === undefined){
                console.error('每个列必须有title字段');
                return [];
            }
            o.key = o.key === undefined ? i : o.key;
            o.fmt = !o.fmt ? e=>e:o.fmt;
            columns[i]=o;
        }

        return columns;
    },

    isNumber(val){
        return val !== '' && val !== undefined && val !== null && !isNaN(val);
    },

    render() {
        var {data,columns} = this.state;
        var {props,cellStyle,titleStyle,frozenStyle,alterStyle,sortStyle,hoverStyle,style} = this;
        var {frozenColumn,frozenAfter} = props;

        if(!columns.length)return <div className={styles.container} />

        //如果没有后端分页排序的响应函数onData,则内存排序
        var page,pageCount;
        if(!props.onData){
            data = data.concat([]);

            //*********************************** 对数据排序 ***********************************
            if(this.state.sortColumn){
                let i = this.state.sortColumn;
           
                let dir = this.state.sortDir == 'asc' ? 1 : -1;
                data.sort((a,b)=> {
                    const prev = String(a[i]).replace(/\,/g, '');
                    const next = String(b[i]).replace(/\,/g, '');
                    return dir*(
                        this.isNumber(prev) && Number.isFinite(Number(prev)) && this.isNumber(next) && Number.isFinite(Number(next)) ? Number(prev) - Number(next) :
                        this.isNumber(prev) && Number.isFinite(Number(prev)) ? 1 : 
                        this.isNumber(next) && Number.isFinite(Number(next)) ? -1 : 
                        (a[i]+'').localeCompare(b[i]+'')
                    )
                })
            }
            //*********************************** 结束排序 ***********************************

            
            //*********************************** 对数据分页 ***********************************
            
            page = this.state.page;
            pageCount = Math.ceil(this.state.data.length/this.state.pageSize);
            var start = this.state.pageSize * page;
            if(props.pager) data = data.slice(start,start + this.state.pageSize);

            //*********************************** 对数据分页 ***********************************
        }else{
            //*********************************** 外排序 ***************************************
            page = this.state.page || 0;
            pageCount = Math.ceil((props.count || 0)/this.state.pageSize);
        }


        //*********************************** 计算每个col的left ***********************************
        var calcWidth = (start,end) => {
            var arr = columns.slice(start,end),acc = 0;
            arr.map(o=>o.style).forEach(o=>{o.left = acc;acc+=o.width});
            return [arr,acc];
        }
            
        
        var [leftColumns,left] = calcWidth(0,frozenColumn);
        var [dataColumns,dataWidth] = calcWidth(frozenColumn,columns.length - frozenAfter);
        var [rightColumns,right] = calcWidth(columns.length - frozenAfter);

        var columnsWidth = left+dataWidth+right;
        var dataColumnsCount = dataColumns.length;

        this.fixUp = dataColumnsCount > 0 && columnsWidth < this.clientWidth;//记录是否需要最后一列补全列表宽度        
        
        if(this.fixUp){
            var lastWidth = dataColumns[dataColumnsCount-1].style.width + Math.max(this.clientWidth - columnsWidth,0);
            dataWidth = this.clientWidth - left - right;
        }
        
        //*********************************** 计算每个col的left ***********************************

        //*********************************** render ***********************************
        var top = titleStyle.height || cellStyle.height;//数据区域顶部，即标题栏高度
        var height = cellStyle.height; //数据区域的每行高度

        var lan = props.language || 'en';
        return  <div onMouseDown={this.mouseDown} className={styles.container + ' ' + props.className} style={style} ref="me">
            <div className={styles.table} style={{height:top+height*data.length,maxHeight: props.pager ? 'calc(100% - 66px)':'100%'}}>
                {/* ----------------------- 标题栏 ------------------------ */}
                <div ref="top" className={styles.top} style={{left:left,right:right,height:top}}>
                    {dataColumns.map((col,i)=><div 
                        key={i}
                        onClick={e=>this.sort(col.key,e)}
                        draggable={true}
                        title={col.desc || col.title}
                        onDragStart={e=>this.drag(i+frozenColumn)}
                        onDragOver={e=>e.preventDefault()}
                        onDrop={e=>this.drop(e,i+frozenColumn)}
                        className={(col.sortable && styles.sortable) + ' ' + (this.state.sortColumn==col.key && styles[this.state.sortDir])}
                        style={Object.assign(
                            {},
                            cellStyle,//通用样式
                            col.style,//自定义当前列样式
                            titleStyle,//自定义标题栏样式
                            this.state.sortColumn==col.key ? sortStyle : {},
                            i==dataColumnsCount-1 && this.fixUp && {width:lastWidth}
                        )}
                    >
                        {col.title}
                        <div className={styles.handler} onMouseDown={e=>this.resizeStart(i+frozenColumn+(i==dataColumnsCount-1 && this.fixUp && frozenAfter ? 1 : 0))} />
                    </div>)}
                </div>

                {/* ----------------------- 左上角 ---------------- */}
                {frozenColumn>0 && <div className={styles.top + ' ' + styles.left} style={{width:left,height:top}}>
                    {leftColumns.map((col,i)=><div 
                        key={i}
                        onClick={e=>this.sort(col.key,e)}
                        title={col.desc || col.title}
                        className={(col.sortable && styles.sortable) + ' ' + (this.state.sortColumn==col.key && styles[this.state.sortDir])}
                        style={Object.assign(
                            {},
                            cellStyle,//通用样式
                            frozenStyle,//冻结栏的样式
                            col.style,//自定义当前列样式
                            titleStyle,//自定义标题栏样式
                            this.state.sortColumn==col.key && sortStyle
                        )}>
                        {col.title}
                        <div className={styles.handler} onMouseDown={e=>this.resizeStart(i)} />
                    </div>)}
                </div>}

                {/* ----------------------- 左侧栏 ---------------- */}
                {frozenColumn>0 && <div ref="left" className={styles.left} style={{top:top,width:left}}>
                    {leftColumns.map((col,j)=>data.map((row,i)=><div 
                        className={`grid-row-${i}`}
                        onClick={e=>this.select(row,e)}
                        onMouseOver={e=>this.hover(e,i)}
                        onWheel={this.wheel}
                        key={i+':'+j}
                        title={fmt(row,col)}
                        style={Object.assign(
                            {},
                            cellStyle,//通用样式
                            i%2==1?alterStyle:{},//斑马样式
                            frozenStyle,//锁定前frozenColumn列
                            col.style,//自定义当前列样式
                            this.state.hoverLine === i ? hoverStyle : {},
                            {top: height * i}
                        )}>
                        {col.fmt(row[col.key],row, col)}
                    </div>))}
                </div>}

                {/* -----------------------右上角 ---------------- */}
                {frozenAfter>0 && <div className={styles.top + ' ' + styles.right} style={{width:right,height:top}}>
                    {rightColumns.map((col,i)=><div 
                        key={i}
                        onClick={e=>this.sort(col.key,e)}
                        title={col.desc || col.title}
                        className={(col.sortable && styles.sortable) + ' ' + (this.state.sortColumn==col.key && styles[this.state.sortDir])}
                        style={Object.assign(
                            {},
                            cellStyle,//通用样式
                            frozenStyle,//冻结栏的样式
                            col.style,//自定义当前列样式
                            titleStyle,//自定义标题栏样式
                            this.state.sortColumn==col.key && sortStyle || {}
                        )}>
                        {col.title}
                        <div className={styles.handler} onMouseDown={e=>this.resizeStart(i+frozenColumn+dataColumns.length)} />
                    </div>)}
                </div>}

                {/* ----------------------- 右侧栏 ---------------- */}
                {frozenAfter>0 && <div ref="right" className={styles.right} style={{top:top,width:right}}>
                    {rightColumns.map((col,j)=>data.map((row,i)=><div 
                        className={`grid-row-${i}`}
                        onClick={e=>this.select(row,e)}
                        onMouseOver={e=>this.hover(e,i)}
                        onWheel={this.wheel}
                        key={i+':'+j}
                        title={fmt(row,col)}
                        style={Object.assign(
                            {},
                            cellStyle,//通用样式
                            i%2==1?alterStyle:{},//斑马样式
                            frozenStyle,//锁定前frozenColumn列
                            col.style,//自定义当前列样式
                            this.state.hoverLine === i ? hoverStyle : {},
                            {top: height * i}
                        )}>
                        {col.fmt(row[col.key],row, col)}
                    </div>))}
                </div>}
                
                {frozenColumn>0 && dataColumnsCount>0 && <div ref="shadowLeft" className={styles.shadowLeft} style={{left:left}} />}
                {frozenAfter>0 && dataColumnsCount>0 && <div ref="shadowRight" className={styles.shadowRight} style={{right:right}} />}
                
                {/* -----------------------   数据区域 ------------------------ */}
                <Scroll onScroll={this.scroll} refs={scroll=>this.scrollDiv = scroll} className={styles.middle} style={{top:top,left:left,right:right}}>
                    <div style={{width:dataWidth||1,height:data.length*height||1,border:'none'}} />
                    {dataColumns.map((col,j)=>data.map((row,i)=>{
                        return <div 
                            className={`grid-row-${i}`}
                            onClick={e=>this.select(row,e)}
                            key={i+':'+j}
                            onMouseEnter={e=>this.hover(e,i)}
                            title={fmt(row,col)}
                            style={Object.assign(
                                {},
                                cellStyle,//通用样式
                                i%2==1 && alterStyle,//斑马样式
                                col.style,//自定义当前列样式
                                {top:height * i},
                                this.state.hoverLine === i && hoverStyle,
                                j==dataColumnsCount-1 && this.fixUp && {width:lastWidth}
                            )}>
                            {col.fmt(row[col.key],row, col)}
                        </div>
                    }))}
                </Scroll>
            </div>

            {props.pager && <ul className={styles.pager}  style={{width:left+dataWidth+right}}>
                {page >0 && <li className={styles.prev} onClick={()=>this.gotoPage(page-1)} style={{visibility:page >0?'visible':'hidden'}} />}
                
                {page>1 && <li onClick={()=>this.gotoPage(0)}>{1}</li>}

                {page>2 &&<span>...</span>}

                {page>0 && <li onClick={()=>this.gotoPage(page-1)}>{page}</li>}

                <li className={styles.active} onClick={()=>this.gotoPage(page)}>{page+1}</li>

                {pageCount>page+1 && <li onClick={()=>this.gotoPage(page+1)}>{page+2}</li>}

                {pageCount>page+3 && <span>...</span>}

                {pageCount>page+2 && <li onClick={()=>this.gotoPage(pageCount-1)}>{pageCount}</li>}
            
                {page < pageCount-1 && <li className={styles.next} onClick={e=>this.gotoPage(page+1)} style={{visibility:page < pageCount-1?'visible':'hidden'}} />}

                <span> {{en:'To page ',zh:'到'}[lan]}</span>

                <li className={styles.input}><input ref="page" onKeyDown={e=>e.keyCode==13 && this.gotoPage()} defaultValue="1" /></li>
                <span>{{en:' ',zh:'页'}[lan]}</span>

                <span style={{float:'left'}}>
                    {{en:'Total Records:',zh:'总记录数:'}[lan]}  {props.count || this.state.data.length} 
                </span>
                
                <div style={{float:'right',verticalAlign:'middle',lineHeight:'66px'}}>
                    <Dropdown 
                        disabled={!(data && data.length)}
                        list={[50,100,200,500].map(o=>({value:o + '',name:o+'/'+({en:'Page',zh:'页'}[lan])}))}
                        value={this.state.pageSize+''}
                        firstLoad={props.firstLoad}
                        bottomUp={true}
                        style={{display:'inline-block',width:115,marginTop:-2,verticalAlign:'middle',marginLeft:10}}
                        onChange={o=>this.setState({pageSize:Number(o)},()=>this.gotoPage(0))}
                    />
                </div>
            </ul>}
        </div>;
    },

    //跳到指定分页
    gotoPage(value,skipCall){
        if(this.props.pager){
            value = value>=0 ? value : (parseInt(this.refs.page.value) - 1 || 0);

            var pageCount = Math.ceil((this.props.count || this.state.data.length || 0) / this.state.pageSize) || 1;
            
            value = Math.min(pageCount-1,Math.max(0,value));

            this.refs.page && (this.refs.page.value = value + 1);
        }
        this.setState({page:value},!skipCall ? this.onData : ()=>{});
    },

    //按第index列排序
    sort(key,e){
        if(this.dragX != e.pageX)return;
        var column = this.state.columns.find(o=>o.key==key)
        if(column.sortable===false)return;

        var dir = this.state.sortDir;
        if(this.state.sortColumn == key){
            if(dir == "asc"){//当前列已经逆序排序了，再次点击则取消排序
                dir = key = "";
            }else if(dir == "desc"){
                dir = "asc";
            }else{
                console.error("这里不应该被运行到，code key:FASAFEMLJV");//这不该发生
            }
        }else{
            dir = "desc";
        }
        this.setState({sortColumn:key,sortDir:dir},() => {
            let data = JSON.parse(JSON.stringify(this.state.data));
            if(this.state.sortColumn){
                let i = this.state.sortColumn;
                let dir = this.state.sortDir == 'asc' ? 1 : -1;
                data.sort((a,b)=>
                    dir*(
                        Number.isFinite(a[i]) && Number.isFinite(b[i]) ? a[i] - b[i] :
                        Number.isFinite(a[i]) ? 1 : 
                        Number.isFinite(b[i]) ? -1 : 
                        (a[i]+'').localeCompare(b[i]+'')
                    )
                )
            }
            typeof this.props.afterSort === 'function' && 
            this.props.afterSort(this.state.sortColumn, this.state.sortDir, data);

            this.onData();
        });
    },

    //当数据区发生滚动时，同步滚动其他区域
    scroll(scrollTop,scrollLeft,scrollBottom,scrollRight){
        this.refs.top.scrollLeft = scrollLeft;
        this.refs.left && (this.refs.left.scrollTop = scrollTop);
        this.refs.right && (this.refs.right.scrollTop = scrollTop);
    },

    wheel(e){
        var {scrollTop,scrollHeight,clientHeight} = this.scrollDiv;

        if(!(scrollTop+clientHeight >= scrollHeight && e.deltaY > 0 || scrollTop <= 0 && e.deltaY < 0))
            e.preventDefault();
        this.scrollDiv.scrollTop = scrollTop + (e.deltaY>0?20:-20);
    },
  
    //bug发源地，比较数据区别，加新数据记得更新它，否则无效。
    shouldComponentUpdate(np,ns){
        const isRender = !_.isEqual(np.data, this.props.data) || 
           deep.equals(np.style,this.props.style) ||
           !_.isEqual(_.omit(this.props.columns, _.functions(this.props.columns)), _.omit(np.columns, _.functions(np.columns))) || 
           ns.sortColumn != this.state.sortColumn || 
           ns.sortDir != this.state.sortDir ||
           ns.page != this.state.page ||
           ns.pageSize != this.state.pageSize ||
           ns.hoverLine != this.state.hoverLine ||
           this.dragI>=0;
        
        return isRender;
    },

    //------------------------------     Select Row    ------------------------
    select(row,e) {
        if(this.dragX != e.pageX)return;
        if(this.props.onChange)this.props.onChange(row);
    },

    //------------------------------     DragDrop Column    ------------------------
    drag(index){
        this.dragI = index;
    },
    drop(e,to){
        if(this.dragI < 0)return false;
        var columns = this.state.columns,from = this.dragI;

        if(to<from){
            columns.splice(to,from-to+1,columns[from],columns[to],...columns.slice(to+1,from));
        }else if(to>from){
            columns.splice(from,to-from+1,...columns.slice(from+1,to),columns[to],columns[from]);
        }else{
            return this.dragI = -1;
        }

        this.dragI = -1;
        this.forceUpdate();
    },

    //------------------------------     Hover highlight    ------------------------    
    hover(e,i){
        this.setState({hoverLine:i});
        e.stopPropagation();
    },

    //------------------------------     Resize Column    ------------------------    
    resizeStart(i){
        this.resizeI = i;
        this.resizer = this.state.columns[i];
        this.resizeWidth = this.resizer.style.width;
    },

    mouseDown(e){
        this.dragX = e.pageX;
    },

    mouseMove(e){
        if(this.resizer){        
            this.resizer.style.width = Math.max(50,this.resizeWidth + (e.pageX - this.dragX)*(this.resizeI>=this.state.columns.length-this.props.frozenAfter?-1:1));
            this.forceUpdate();
            e.preventDefault();
        }
    },
    mouseUp(e){
        var fun = this.props.onResizeColumn;
        if(this.resizer && fun){
            fun(this.resizer.key,this.resizer.style.width);
        }
        this.resizer = null;
    },

    onData(){
        this.props.onData && this.props.onData(this.props.pager && this.state.pageSize || 0,this.state.page,this.state.sortColumn,this.state.sortDir);
    },
    Resize(){
        var me = this.refs.me;
        if(!me)return;
        this.clientWidth = me.clientWidth;
        this.forceUpdate();
    },

    componentDidMount(){
        if((!this.props.data || !this.props.data.length) && this.props.firstLoad)this.onData();
        window.addEventListener('mousemove',this.mouseMove);
        document.addEventListener('mouseup',this.mouseUp);
        window.addEventListener('resize',this.Resize);
        this.Resize();
    },

    componentWillUnmount(){
        window.removeEventListener('mousemove',this.mouseMove);
        document.removeEventListener('mouseup',this.mouseUp);
        window.removeEventListener('resize',this.Resize);
    },
});

