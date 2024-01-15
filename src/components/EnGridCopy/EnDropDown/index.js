import React from 'react';
import styles from './index.mcss';

var createReactClass = require('create-react-class');

//下拉列表框，通用组件
var DropDown = createReactClass({
    getDefaultProps(){
        return {firstLoad:true}
    },
    getInitialState() {
        return {
            open: false
        };
    },
    componentDidMount(){
        this.select(this.props.value,!this.props.firstLoad);
    },
    mousedownOut(e){
        for(var node = e.target;node;node = node.parentNode)
            if(this.refs.me == node)return;

        this.shrink();
    },
    shrink() {
        this.setState({ open: false });
        removeEventListener("mousedown", this.mousedownOut);
    },
    toggle() {
        if (this.props.disabled) return;
        !this.state.open && addEventListener("mousedown", this.mousedownOut);
        this.setState({ open: !this.state.open });
    },
    componentWillUnmount(){
        this.shrink();
    },

    componentWillReceiveProps(np){
        if(np.value != this.props.value)
            this.select(np.value, false, true);
    },

    render() {
        var list = this.props.list || this.props.List || this.props.options || this.props.Options || [];

        //list是key value形式提供的，自动转换成[{name:key,value:value}]的形式
        if (typeof list === "object" && !Array.isArray(list)) {
            list = Object.keys(list).map(key => ({
                name: list[key],
                value: key
            }));
        }

        //如果直接给了个字符串数组，把他转换成 name:value的形式，name等于value
        list = list.map(o => typeof o === "string" ? {name: o,value: o} : o);

        //默认值,因为可以为0，所以不能用||语法
        var selected = this.state.value;

        //显示title, 获取被选中项的name
        var title = list.find(o => o.value == selected);
        title = title && title.name || '';

        return  <div ref="me" className={styles.dropdown} style={this.props.style}>
            <div onClick={this.toggle} className={styles.title}>
                <span className={styles.titleText}>{title}</span>
                <span className={styles.triangle} />
            </div>
            <div className={styles.dropdownlist + ' ' + (this.state.open ? styles.show : '')}  style={this.props.bottomUp && {bottom:'2em'}}>
                {list.map(o=><div
                    key={o.value}
                    className={o.value == selected ? styles.selected : ''}
                    onClick={()=>this.select(o.value) }>
                    {o.name}
                </div>)}
            </div>
        </div>;
    },

    select(e,skipcall,isCWRP) { // isCWRP：是否是componentWillReceiveProps调用的
        if(this.state.value != e){
            this.shrink();
            this.setState({value:e},()=>!skipcall && this.props.onChange && this.props.onChange(e, isCWRP));
        }

    }
});

export default DropDown;
