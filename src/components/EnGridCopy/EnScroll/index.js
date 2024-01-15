import React from 'react';
import styles from './index.mcss';

var createReactClass = require('create-react-class');

var isWebkit = window.navigator.userAgent.indexOf("WebKit") >= 0;


export default createReactClass({
    render(){
        var { className,style,onScroll,children,refs, ...props } = this.props;

        return <div className={className + ' ' + styles.container} style={style}>
            <div 
                ref="me" 
                style={{overflow:isWebkit?'scroll':'hidden',width:'100%',height:'100%'}} 
                onScroll={this.onScroll} 
                className={styles.me} 
                onWheel={isWebkit ? undefined : this.wheel} 
                {...props}
            >
                {children}
            </div>

            <div ref="y" className={styles.scroll} style={{right:4}} onMouseDown={this.yDown} />
            <div ref="x" className={styles.scroll} style={{bottom:4}} onMouseDown={this.xDown} />
        </div>;
    },

	//为了提升性能，只好另立中央，放弃setState了，这里核心将是scrollTop和scrollLeft，而不是state
    myRender(){
        var {clientWidth,clientHeight,scrollWidth,scrollHeight,scrollTop,scrollLeft} = this.refs.me;

        var y = this.refs.y.style;
        if(clientHeight < scrollHeight){
            let height = clientHeight * clientHeight / scrollHeight;

            y.display = 'block';
            y.height = height + 'px'; 
            y.top = scrollTop * (clientHeight - height) / (scrollHeight - clientHeight) + 'px';
        }else{
            y.display = 'none';
        }

        var x = this.refs.x.style;
        if(clientWidth < scrollWidth){
            let width = clientWidth * clientWidth / scrollWidth;

            x.display = 'block';
            x.width = width + 'px';
            x.left = scrollLeft * (clientWidth - width) / (scrollWidth - clientWidth) + 'px';
        }else{
            x.display = 'none';
        }
    },
    

    onScroll(){
        this.myRender();
        this.props.onScroll && this.props.onScroll(this.refs.me.scrollTop,this.refs.me.scrollLeft);
    },

    yDown(e){
        this.sy = this.refs.y.offsetTop - e.pageY;
        e.preventDefault();
    },
    xDown(e){
        this.sx = this.refs.x.offsetLeft - e.pageX;
        e.preventDefault();
    },

    move(e){
        var me = this.refs.me;

		//单纯给scrolltop left赋值，即会触发scroll事件，scroll事件自会调用myRender
        if(this.sy != undefined)
            me.scrollTop = limit((this.sy + e.pageY) / (me.clientHeight - this.refs.y.clientHeight),0,1) * (me.scrollHeight - me.clientHeight);

        if(this.sx != undefined)
            me.scrollLeft = limit((this.sx + e.pageX) / (me.clientWidth - this.refs.x.clientWidth),0,1) * (me.scrollWidth - me.clientWidth);
    },

    up(){
        this.sy = this.sx = undefined;
    },
    
    wheel(e){
        var {scrollTop,scrollHeight,clientHeight} = this.refs.me;

        if(!(scrollTop+clientHeight >= scrollHeight && e.deltaY > 0 || scrollTop <= 0 && e.deltaY < 0))
            e.preventDefault();
        this.refs.me.scrollTop = scrollTop + (e.deltaY>0?20:-20);
    },
    
    componentDidUpdate(){
        this.onScroll();
    },

    componentDidMount(){
        this.props.refs && this.props.refs(this.refs.me);
        this.onScroll();
        this.renderLater();
        document.addEventListener('mousemove',this.move);
        document.addEventListener('mouseup',this.up);
        window.addEventListener('resize',this.renderLater)
    },
    componentWillUnmount(){
        document.removeEventListener('mousemove',this.move);
        document.removeEventListener('mouseup',this.up);
        window.removeEventListener('resize',this.renderLater)
    },
    renderLater(){
        this.myRender();
        setTimeout(this.myRender,1);
    },
});

function limit(val,min,max){
    return Math.min(max,Math.max(val,min))
}
