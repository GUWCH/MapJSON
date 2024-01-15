/* eslint-disable */

import React from 'react';
import { SvgScrap, Direction } from '../constants';

//IE HACK
const isIE = !!window.ActiveXObject || "ActiveXObject" in window;

type ISvgAnimateProps = {
    /**
     * 风机发电
     */
    isGenerate?: boolean;
    /**
     * 光伏发电
     */
    isSolarGenerate?: boolean;
    /**
     * 储能充放电
     */
    storageCharge?: Direction;
    /**
     * 并网点输出输入
     */
    outputCharge?: Direction;
    /**
     * 负载使用
     */
    isLoader?: boolean;
    className?: string;
};

class SvgAnimate extends React.Component<ISvgAnimateProps>{

    static defaultProps = {
        isGenerate: false,
        isSolarGenerate: false,
        storageCharge: Direction.ZERO,
        outputCharge: Direction.ZERO,
        isLoader: true,
        className: ''
    };

    private svg?: SVGSVGElement;
    private svgContainer: React.RefObject<HTMLDivElement> = React.createRef();
    private generateGroup: Element[] = [];
    private solarGenerateGroup: Element[] = [];
    private loaderConsumeGroup: Element[] = [];
    private outputGroup: Element[] = [];
    private storageGroup: Element[] = [];

    state = {};

    constructor(props: ISvgAnimateProps) {
        super(props);
        this.resize = this.resize.bind(this);
    }

    async init(){
        const res = await fetch(require('../images/animate.svg').default);
        if(res.ok){
            const svgText = await res.text();
            if(this.svgContainer.current){
                this.svgContainer.current.innerHTML = svgText;
                this.svg = document.getElementsByTagName('svg')[0];
                this.svgInit();
                this.setSvgSize();
                this.svgAnimate();
            }
        }
    }

    componentDidMount(){
        this.init();
        window.addEventListener('resize', this.resize);
    }

    componentWillReceiveProps(nextProps: ISvgAnimateProps){
        let {
            isGenerate: isGenerateNew, 
            isSolarGenerate: isSolarGenerateNew, 
            isLoader: isLoaderNew,
            storageCharge: storageChargeNew,
            outputCharge: outputChargeNew
        } = nextProps;
        let {isGenerate, isSolarGenerate, isLoader, storageCharge, outputCharge} = this.props;
        if(isGenerateNew !== isGenerate 
            || isSolarGenerateNew !== isSolarGenerate 
            || isLoaderNew !== isLoader
            || storageChargeNew !== storageCharge
            || outputChargeNew !== outputCharge
        ){
            this.svgAnimate(nextProps);
        }        
    }

    shouldComponentUpdate(nextProps, nextState) {
        return false;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    resize(){
        this.setSvgSize();

        if(window.___debug___){
            console.log(this);
        }
    }

    svgAnimate(props?: ISvgAnimateProps){
        let { 
            isGenerate, 
            isSolarGenerate, 
            isLoader, 
            storageCharge, 
            outputCharge 
        } = props || this.props;
        let {
            wtgGeneration, 
            solarGeneration,
            loaderConsume,
            output, 
            storage, 
            strokeLength=20, 
            strokeInfo
        } = SvgScrap;

        // 动画彼此有依赖,故要先生成
        if(this.generateGroup.length === 0){
            let t = this.createCurrentAnimate(wtgGeneration, strokeLength, strokeInfo);
            if(t){
                this.generateGroup.push(t);
            }
        }

        // 风机发电动画, 否则不动画
        if(isGenerate){
            this.generateGroup.forEach(g => {
                g.removeAttribute('display');
            });
        }else{
            this.generateGroup.forEach(g => {
                g.setAttribute('display', 'none');
            });
        }

        // 光伏发电动画, 否则不动画
        if(this.solarGenerateGroup.length === 0){
            let t = this.createCurrentAnimate(solarGeneration, strokeLength, strokeInfo);
            if(t){
                this.solarGenerateGroup.push(t);
            }
        }
        if(isSolarGenerate){
            this.solarGenerateGroup.forEach(g => {
                g.removeAttribute('display');
            });
        }else{
            this.solarGenerateGroup.forEach(g => {
                g.setAttribute('display', 'none');
            });
        }

        // 负载动画, 否则不动画
        if(this.loaderConsumeGroup.length === 0){
            let t = this.createCurrentAnimate(loaderConsume, strokeLength, strokeInfo);
            if(t){
                this.loaderConsumeGroup.push(t);
            }
        }
        if(isLoader){
            this.loaderConsumeGroup.forEach(g => {
                g.removeAttribute('display');
            });
        }else{
            this.loaderConsumeGroup.forEach(g => {
                g.setAttribute('display', 'none');
            });
        }

        // 并网点动画路径生成
        if(this.outputGroup.length > 0){
            this.outputGroup.forEach(g => {
                if(g.parentNode){
                    g.parentNode.removeChild(g);
                } 
            });  
            this.outputGroup = [];
        }

        // 风机发电或储能不充电不停止时要并网点输出动画
        if(outputCharge === Direction.POSITION){
            let t = this.createCurrentAnimate(output, strokeLength, strokeInfo);
            if(t){
                this.outputGroup.push(t);
            }
        }else if(outputCharge === Direction.NEGATIVE){
            let t = this.createCurrentAnimate(output, strokeLength, strokeInfo, true);
            if(t){
                this.outputGroup.push(t);
            }
        }

        // 储能动画路径生成
        if(this.storageGroup.length > 0){
            this.storageGroup.forEach(g => {
                if(g.parentNode){
                    g.parentNode.removeChild(g);
                } 
            });  
            this.storageGroup = [];
        }

        // 风机发电或储能不充电不停止时要并网点输出动画
        if(storageCharge === Direction.POSITION){
            let t = this.createCurrentAnimate(storage, strokeLength, strokeInfo);
            if(t){
                this.storageGroup.push(t);
            } 
        }else if(storageCharge === Direction.NEGATIVE){
            let t = this.createCurrentAnimate(storage, strokeLength, strokeInfo, true);
            if(t){
                this.storageGroup.push(t);
            } 
        }
    }

    setSvgSize(){
        if(!this.svg || !this.svgContainer.current)return;
        
        //let {innerHeight, innerWidth} = window;
        let {clientWidth: innerWidth, clientHeight: innerHeight} = this.svgContainer.current;
        let svgWidth = 1920;
        let svgHeight = 1080;
        let widthScale = innerWidth / svgWidth;
        let heightScale = innerHeight / svgHeight;

        if(isIE){
            let nodes = this.svg.childNodes;
            for(let i = 0; i < nodes.length; i++){
                // 子节点标签变动需要改变
                if(nodes[i].nodeName.toLowerCase() === 'g'){
                    nodes[i].setAttribute(
                        'transform', 
                        `scale(${widthScale}, ${heightScale})`
                    );
                }
            }
        }else{
            //this.svg.setAttribute('width', `${innerWidth}px`);
            //this.svg.setAttribute('height', `${innerHeight}px`);
            this.svg.setAttribute(
                'transform', 
                `translate(${svgWidth * (widthScale - 1)/2}, ${svgHeight *(heightScale - 1)/2}) 
                scale(${widthScale}, ${heightScale})`
            );
        }        
    }

    svgInit(){
        if(!this.svg)return;
        let {defs=[]} = SvgScrap;

        defs.forEach(grad => {
            let {id, stops, ...attrs} = grad;
            this.createGradient(this.svg, id, attrs, stops);
        });
    }

    createCurrentAnimate(infos, strokeLength, strokeInfo, anti=false): Element| undefined {
        if(!this.svg)return;

        let svg = this.svg;
        let svgNS = svg.namespaceURI;
        let g: SVGGElement = document.createElementNS(svgNS, 'g') as SVGGElement;
        
        infos.forEach((info, index) => {
            const {
                id, 
                pathCoords, 
                stroke, 
                middle, 
                strokeGradientLayers,
                strokeGradientLayerOffset,
                strokeLineLength,
                strokeLineSpaceLength,
                dur,
                ...animates
            } = info;

            const opacityPer = 1 / strokeGradientLayers;
            const strokeLength = strokeGradientLayers * strokeGradientLayerOffset + strokeLineLength;
            [...Array(strokeGradientLayers)].map((val, ind) => {
                let path: SVGPathElement  = document.createElementNS(svgNS, 'path') as SVGPathElement;
                
                if(stroke){
                    path.setAttribute('stroke', `${stroke}`);
                }
                for(let k in strokeInfo){
                    if(strokeInfo.hasOwnProperty(k)){
                        path.setAttribute(k, strokeInfo[k]);
                    }
                }
                const dashOffset: number = ind * strokeGradientLayerOffset + strokeLineLength;

                path.setAttribute('id', `${id}-path`);
                path.setAttribute('d', (anti ? JSON.parse(JSON.stringify(pathCoords)).reverse() : pathCoords).reduce((a, b) => (`${a}${!a ? 'M ' : ' L '}${b.join(' ')}`), ''));
                path.setAttribute('stroke-dasharray', `${strokeLineLength}, ${strokeLineSpaceLength}`);
                path.setAttribute('stroke-dashoffset', String(dashOffset));
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('stroke-linejoin', 'round');
                path.setAttribute('opacity', `${(strokeGradientLayers - ind) * opacityPer}`);

                const pathLength: number = path.getTotalLength() + strokeLength;
                // 循环时去除剩余路径长度, 否则会有跳动
                const loopRestPathLength = pathLength % (strokeLineLength + strokeLineSpaceLength);
                const toDashOffset: number = pathLength - dashOffset - loopRestPathLength;
                let animate: SVGAnimateElement  = document.createElementNS(svgNS, 'animate') as SVGAnimateElement;
                animate.setAttribute('dur', String(dur || 10));
                animate.setAttribute('attributeName', `stroke-dashoffset`);
                animate.setAttribute('from', String(dashOffset));
                animate.setAttribute('to', String(-toDashOffset));
                animate.setAttribute('repeatCount', 'indefinite');
                path.appendChild(animate);

                g.appendChild(path);
            })
        });

        svg.appendChild(g);
        return g;
    }

    // simple animation
    createCurrentAnimate_old(infos, strokeLength, strokeInfo, anti=false): Element| undefined {
        if(!this.svg)return;

        let svg = this.svg;
        let svgNS = svg.namespaceURI;
        let g = document.createElementNS(svgNS, 'g');

        let lastAnimateId;
        let firstLineAnimate, middleLineAnimate;
        infos.forEach((info, ind, _s) => {
            if(ind >= _s.length - 1)return;

            let nextInfo = _s[ind + 1];
            let line  = document.createElementNS(svgNS, 'line');
            let {id, coor, stroke, middle, ...animates} = info;
            let {coor: nextCoor} = nextInfo;
            if(stroke){
                line.setAttribute('stroke', `url(#${stroke})`);
            }
            for(let k in strokeInfo){
                if(strokeInfo.hasOwnProperty(k)){
                    line.setAttribute(k, strokeInfo[k]);
                }
            }
            
            let slope = (nextCoor[1] - coor[1]) / (nextCoor[0] - coor[0]);
            let tan = Math.atan(slope);
            let endX, endY;
            let fact = slope >= 0 ? -1 : 1;
            let dx = fact * strokeLength*Math.cos(tan);
            let dy = fact * strokeLength*Math.sin(tan);

            if(anti){
                endX = coor[0] + dx;
                endY = coor[1] + dy;
            }else{
                endX = coor[0] - dx;
                endY = coor[1] - dy;
            }            

            line.setAttribute('id', `${id}-line`);
            line.setAttribute('x1', coor[0]);
            line.setAttribute('y1', coor[1]);
            line.setAttribute('x2', endX);
            line.setAttribute('y2', endY);
            line.setAttribute('opacity', '0');

            let {dur, begin='inherit'} = animates;
            let animateMotion  = document.createElementNS(svgNS, 'animateMotion');
            let animateMotionId = `${id}`;
            animateMotion.setAttribute('id', animateMotionId);
            animateMotion.setAttribute('path', `M 0 0 L ${nextCoor[0]-coor[0]+(anti ? -1 : 1)*dx} ${nextCoor[1]-coor[1]+(anti ? -1 : 1)*dy}`);
            animateMotion.setAttribute('dur', `${dur}s`);
            animateMotion.setAttribute('begin', (begin === 'inherit' || lastAnimateId ? `${lastAnimateId}.end` : `${begin}`));
            animateMotion.setAttribute('fill', `freeze`);
            lastAnimateId = animateMotionId;
            line.appendChild(animateMotion);

            let animate  = document.createElementNS(svgNS, 'animate');
            animate.setAttribute('dur', `.1`);
            animate.setAttribute('attributeName', `opacity`);
            animate.setAttribute('from', `1`);
            animate.setAttribute('to', `0`);
            animate.setAttribute('begin', `${animateMotionId}.end`);
            animate.setAttribute('fill', `freeze`);
            line.appendChild(animate);

            animate  = document.createElementNS(svgNS, 'animate');
            animate.setAttribute('dur', `.1`);
            animate.setAttribute('attributeName', `opacity`);
            animate.setAttribute('from', `0`);
            animate.setAttribute('to', `1`);
            animate.setAttribute('begin', `${animateMotionId}.begin`);
            animate.setAttribute('fill', `freeze`);
            line.appendChild(animate);

            g.appendChild(line);

            if(ind === 0){
                firstLineAnimate = animateMotion;
            }

            if(middle){
                middleLineAnimate = animateMotion;
            }

            if(ind === _s.length - 2 && firstLineAnimate && middleLineAnimate){
                let begin = firstLineAnimate.getAttribute('begin');
                let midId = middleLineAnimate.getAttribute('id');
                firstLineAnimate.setAttribute('begin', `${begin};${midId}.begin+0.5s`);
            }
        });

        svg.appendChild(g);
        return g;
    }

    createGradient(svg, id, attrs, stops){
        let svgNS = svg.namespaceURI;
        let grad  = document.createElementNS(svgNS, 'linearGradient');
        grad.setAttribute('id', id);
        for (let attr in attrs){
            if (attrs.hasOwnProperty(attr)) grad.setAttribute(attr, attrs[attr]);
        }
        stops.forEach(f => {
            let stop = document.createElementNS(svgNS,'stop');
            for (let k in f){
                if (f.hasOwnProperty(k)) stop.setAttribute(k, f[k]);
            }
            grad.appendChild(stop);
        });
      
        let defs = svg.querySelector('defs') ||
            svg.insertBefore(document.createElementNS(svgNS,'defs'), svg.firstChild);
        return defs.appendChild(grad);
    }

    render(){
        return (
            <div className={this.props.className} ref={this.svgContainer}>
            </div>
        );
    }
}

export default SvgAnimate;

/* eslint-enable */