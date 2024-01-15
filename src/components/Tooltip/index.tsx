import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import styles from './style.mscss';

interface ITooltipProps {
    visible?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

interface ITooltipState {
    node?: HTMLElement | null
}

let tooltipNode: HTMLElement | null | undefined;

class Tooltip extends Component<ITooltipProps, ITooltipState> {

    state: ITooltipState = {
        node: null
    };

    static getDerivedStateFromProps(props: ITooltipProps, state: ITooltipState) {
        const document = window.document
        if (props.visible) {
            let node = tooltipNode;
            if (!node) {
                tooltipNode = document.createElement('div');
                node = tooltipNode;
                document.body.appendChild(node);
            }
            let { left=0, top=0, width, height } = props.style as React.CSSProperties || {};
            node.className = styles.envTooltipWrap;
            left = (left as number) + 12;
            top = (top as number) + 12;
            if (width === undefined) {
                width = node.getBoundingClientRect().width;
            }
            if (height === undefined) {
                height = node.getBoundingClientRect().height;
            }
            // 处理dom的位置
            if ((width as number) + (left as number) - window.innerWidth > -40) {
                left = left - 80;
            }
            if ((height as number) + (top as number) - window.innerHeight > -40) {
                top = top - (height as number) - 20;
            }
            node.style.left = `${left}px`;
            node.style.top = `${top}px`;
            return {
                node // 将挂载的dom节点存储起来，方便移除时使用
            };
        }
        if (state.node && document.body.contains(state.node)) { // visible为false时，移除对应的dom
            document.body.removeChild(state.node);
            tooltipNode = null;
            state.node = null;
        }
        return null
    }

    componentDidUpdate(){
        if(this.props.visible && this.state.node){
            const width = this.state.node.clientWidth;
            const height = this.state.node.clientHeight;
            const pos = this.state.node.getBoundingClientRect();

            let isUpdate = false;
            let newLeft = pos.left;
            let newTop = pos.top;
            if(newLeft + width > window.innerWidth){
                newLeft = window.innerWidth - width;
                isUpdate = true;
            }
            if(newTop + height > window.innerHeight){
                newTop = window.innerHeight - height;
                isUpdate = true;
            }

            if(isUpdate){
                this.state.node.style.left = `${newLeft}px`;
                this.state.node.style.top = `${newTop}px`;
            }
        }
    }

    render() {
        const { visible=false, className='', children } = this.props;
        if (!visible) {
            return null;
        }
        return createPortal(
            <div className={`${styles.envTooltip} ${className}`}>
                {children}
            </div>,
            this.state.node as HTMLElement
        )
    }
}

export default Tooltip

