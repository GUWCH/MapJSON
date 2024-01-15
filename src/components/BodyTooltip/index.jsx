import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

class BodyTooltip extends React.Component{

    static defaultProps = {
        show: false,
        destroyOnHide: false,
        style: {},
        className: '',
        arrowClassName: '',
        arrowStyle: {},
        arrowSize: 10,
        target: null
    };

    constructor(props){
        super(props);

        this.container = React.createRef();
        this.content = React.createRef();
        this.createContainer();

        this.state = {
            contentStyle: {
                position: 'absolute',
                left: 0,
                top: 0                
            },
            arrowStyle: {
                position: 'absolute',
                left: 0,
                top: -10
            }
        }
    }

    componentDidMount(){
    }

    componentDidUpdate(){
    }

    componentWillUnmount(){
        this.unmount(); 
    }

    unmount(){
        if(this.container.current){
            this.content.current = null;
            document.body.removeChild(this.container.current);
            this.container.current = null;
        }
    }

    createContainer(){
        if(this.container.current){
            return;
        }

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = 0;
        container.style.top = 0;
        container.style.width = '100%';
        document.body.appendChild(container);
        this.container.current = container;
    }

    getStyle(){
        const { target, arrowSize } = this.props;

        if(!(this.content.current instanceof HTMLElement && target instanceof HTMLElement)){
            return {};
        }

        const winWidth = window.innerWidth;
        const winHeight = window.innerHeight;
        const rectContent = this.content.current.getBoundingClientRect();
        const {
            x: x0, 
            y: y0, 
            width: width0, 
            height: height0, 
            left: left0, 
            right: right0, 
            top: top0, 
            bottom: bottom0
        } = rectContent;
        const rectTarget = target.getBoundingClientRect();
        const {
            x: x1, 
            y: y1, 
            width: width1, 
            height: height1, 
            left: left1, 
            right: right1, 
            top: top1, 
            bottom: bottom1
        } = rectTarget;
        const contentWidth = right0 - left0;
        const contentHeight = bottom0 - top0;
        const targetWidth =  right1 - left1;
        const targetHeight = bottom1 - top1;

        let left = left1 + targetWidth / 2 - contentWidth / 2;
        if(left < 0){
            left = 0;
        }else if(left + contentWidth > winWidth - 25){
            left = winWidth - contentWidth - 25;
        }
        const triangleLeft = left1 - left + targetWidth/2 - arrowSize;

        let top = top1 - contentHeight - arrowSize;
        let triangleTop = contentHeight;
        let isTop = true;
        if(top < 0){
            top = top1 + targetHeight + arrowSize;
            triangleTop = -1 * arrowSize;
            isTop = false;

            if(top + contentHeight > winHeight){
                top = 0;
                triangleTop = contentHeight;
                isTop = true;
            }
        }

        return {
            contentStyle: {
                left,
                top
            },
            arrowStyle: {
                left: triangleLeft,
				top: triangleTop,
                borderStyle: 'solid',
				borderWidth: isTop ? 
                    `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px` : 
                    `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
				borderColor: isTop ? 
                    '#0b2730 transparent transparent transparent' : 
                    'transparent transparent #01404a transparent'
            }
        }
    }

    // eslint-disable-next-line complexity
    render(){
        const { 
            style, 
            className, 
            arrowClassName, 
            arrowStyle, 
            show, 
            destroyOnHide, 
            target,
            forceTarget,
            children 
        } = this.props;
        const { contentStyle={}, arrowStyle: arrowStyle1 } = this.getStyle();
        let finalContentStyle = Object.assign({}, this.state.contentStyle, contentStyle, style);
        const finalArrowStyle = Object.assign({}, this.state.arrowStyle, arrowStyle1 ||{}, arrowStyle);

        if(destroyOnHide && !show){
            this.unmount();
            return null;
        }

        if(show){
            this.createContainer();
        }

        finalContentStyle = Object.assign({}, finalContentStyle, show ? {
            display: 'block'
        } : {
            display: 'none',
            left: 0,
            top: 0
        });

        let rendered = true;
        if(forceTarget && !(target instanceof HTMLElement)){
            rendered = false;
        }

        return (this.container.current && rendered) ? ReactDOM.createPortal(
            <div>
                <div
                    className={className || undefined}
                    style={finalContentStyle}
                    ref={this.content}
                >
                    <div>{children}</div>
                    <div
                        className={arrowClassName || undefined}
                        style={finalArrowStyle}
                    ></div>
                </div>
            </div>,
            this.container.current
        ) : null;
    }
}

export default BodyTooltip;