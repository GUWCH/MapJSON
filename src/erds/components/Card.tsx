/* eslint-disable */

import React from 'react';
import _ from 'lodash';
import EchartsWrap from 'EchartsWrap';
import { getAreaLineOption } from './EchartsUtil';
import { BStools } from '@/common/utils';

type TCard = {
    source: () => HTMLElement;
    data: {
        textData: any[];
        yAxisName: string;
        eData: any[];
    },
    className?: string;
    position: 'rt' | 'lt' | 'rb' | 'lb';
    title: string;
    hasPower: boolean;
}

class Card extends React.Component<TCard, {}>{

    static defaultProps = {
        source: null,
        data: {
            textData: [],
            yAxisName: '',
            eData: []
        },
        className: '',
        position: 'lt',
        title: '',
        hasPower: false
    };

    dom: React.RefObject<HTMLDivElement> = React.createRef();
    state = {

    };

    constructor(props) {
        super(props);
        this.resize = this.resize.bind(this);
    }

    componentDidMount(){
        window.addEventListener('resize', this.resize);
        window.addEventListener('load', this.resize);
        this.resize();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(_.omit(this.props, _.functions(this.props)), _.omit(nextProps, _.functions(nextProps)))) {
            return true;
        }
        return false;
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
    }

    resize() {
        let {position, source} = this.props;
        if(!source || typeof source !== 'function')return;

        let parent: any = source();
        if(!parent || !(parent instanceof HTMLElement))return;

        let wrapperPos = BStools.getPos(document.getElementById('center'));
        let pos = BStools.getPos(parent);
        let selfPos = BStools.getPos(this.dom.current);
        let selfWidth = selfPos.right -selfPos.left;
        let selfHeight = selfPos.bottom -selfPos.top;
        let offset = 10;

        let left, top;
        switch(position){
            case 'rt':
                left = pos.right - selfWidth - wrapperPos.left;
                top = pos.top - selfHeight - offset - wrapperPos.top;
                break;
            case 'rb':
                left = pos.right - selfWidth - wrapperPos.left;
                top = pos.bottom + offset - wrapperPos.top;
                break;
            case 'lt':
                left = pos.left - wrapperPos.left;
                top = pos.top - selfHeight - offset - wrapperPos.top;
                break;
            case 'lb':
                left = pos.left - wrapperPos.left;
                top = pos.bottom + offset - wrapperPos.top;
                break;
            default:break;
        }

        if(typeof left !== 'undefined' && typeof top !== 'undefined' && this.dom.current){
            this.dom.current.style.left = `${left}px`;
            this.dom.current.style.top = `${top}px`;
        }
    }

    render(){
        let {className, data, title} = this.props;
        let {textData=[], yAxisName='', eData=[]} = data;

        return (
            <div className={className} ref={this.dom}>
                <div>
                    {
                        textData.map((d, ind) => {
                            return (
                                <div key={ind}>
                                    <div>
                                        {d.value}
                                        <span>{d.unit}</span>
                                    </div>
                                    <div>{d.name}</div>
                                </div>
                            );
                        })
                    }
                </div>
                {/* <div>{title}</div> */}
                <div>
                    <EchartsWrap
                        getOption={getAreaLineOption}
                        data={{
                            data: eData,
                            yAxisName,
                            hasPower: this.props.hasPower
                        }}
                    />
                </div>
            </div>
        );
    }
}

export default Card;

/* eslint-enable */