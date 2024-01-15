/* eslint-disable no-undef */

import React from 'react';
import PropTypes from 'prop-types';
import lodash from 'lodash';
import {setLayoutByParent} from 'Layout';

import * as echarts from 'echarts/core';
import { 
    DataZoomComponent,
    TitleComponent,
    MarkLineComponent,
    GridComponent, 
    TooltipComponent,
    LegendComponent,
    GeoComponent,
    VisualMapComponent,
    VisualMapContinuousComponent,
    VisualMapPiecewiseComponent
} from 'echarts/components';
import { 
    BarChart, 
    LineChart, 
    MapChart,
    ScatterChart,
    EffectScatterChart
} from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    DataZoomComponent,
    TitleComponent,
    MarkLineComponent,
    GridComponent, 
    TooltipComponent,
    LegendComponent, 
    GeoComponent,
    VisualMapComponent,
    VisualMapContinuousComponent,
    VisualMapPiecewiseComponent,
    LineChart, 
    BarChart, 
    MapChart,
    ScatterChart,
    EffectScatterChart,
    CanvasRenderer
]);

const colors = [
    '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc',
    '#f4f211', '#f60a0a', '#13cdef', '#649f0d', '#e91a90', '#18f4e1', '#ef0cec', '#075cf1', '#11ec3b'
];

/**
 * 通过ref获取echarts实例echart
 * 事件通过属性传递，如onclick使用click，其它类同，全部小写
 */
class EchartsWrap extends React.Component {
    constructor(props) {
        super(props);

        this.resize = this.resize.bind(this);
        this.echart = null;
    }

    componentDidMount() {
        this.props.beforeMount();

        this.echart = echarts.init(this.refs.me, undefined, this.props.options);
        let option = this.props.getOption(this.props.data, this.echart);
        this.echart.setOption(Object.assign({}, {color: colors}, option || {}));
        window.addEventListener("resize", this.resize);
        window.addEventListener("load", this.resize);
        this.resize();
        
        let eventsList = [
            'click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'globalout',
            'legendselectchanged', 'legendselected', 'legendunselected',
            'datazoom',
            'datarangeselected',
            'timelinechanged',
            'timelineplaychanged',
            'restore',
            'dataviewchanged',
            'magictypechanged',
            'geoselectchanged', 'geoselected', 'geounselected', 'georoam',
            'pieselectchanged', 'pieselected', 'pieunselected',
            'mapselectchanged', 'mapselected', 'mapunselected',
            'axisareaselected',
            'brush', 'brushselected',
            'rendered', 'finished'
        ];
        eventsList
            .filter(eventName => this.props[eventName] && typeof this.props[eventName] === 'function')
            .map(eventName => this.echart.on(eventName, o => this.props[eventName](o, this.echart)));
        
        this.props.afterMount();
    }

    shouldComponentUpdate(nextProps) {
        if (!lodash.isEqual(this.props.name, nextProps.name)
            || !lodash.isEqual(this.props.id, nextProps.id)
            || !lodash.isEqual(this.props.className, nextProps.className)
            || !lodash.isEqual(this.props.style, nextProps.style)
            || !lodash.isEqual(this.props.data, nextProps.data)
        ) {
            return true;
        }
        return false;
    }

    componentDidUpdate() {
        this.props.beforeUpdate();

        if(this.echart ){
            let option = this.props.getOption(this.props.data, this.echart);

            /** clear when returning null by getOption*/
            if(this.props.isClearOpt || option === null){
                this.echart.clear();
            }
            
            const opts = {
                notMerge: !!this.props.isNotMergeOpt,
                replaceMerge: this.props.replaceMerge,
                lazyUpdate: this.props.lazyUpdate
            };
            if(this.props.replaceMerge && 
                (typeof this.props.replaceMerge === 'string' 
                || Array.isArray(this.props.replaceMerge))
            ){
                opts.replaceMerge = this.props.replaceMerge;
            }
            this.echart.setOption(option || {}, opts);
        }

        this.props.afterUpdate();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize);
        this.echart && this.echart.dispose();
        this.echart = null;
    }

    _resize() {
        setLayoutByParent(this.refs.me, true, this.props.widthScale, this.props.heightScale);
        if(!this.echart)return;

        if(this.props.resizeRedraw){
            let option = this.props.getOption(this.props.data, this.echart);
            this.echart.setOption(option, true, true);
        }
        
        this.echart.resize();
    }

    resize() {
        if(typeof this.props.resizeDelay === 'number' && this.props.resizeDelay >= 0){
            setTimeout(this._resize.bind(this), this.props.resizeDelay);
        }else{
            this._resize();
        }        
    }

    ec(...[method, ...rest]){
        if(!method || 
            !this.echart || 
            typeof this.echart[method] !== 'function'
        )return undefined;

        return this.echart[method].apply(this.echart, rest);
    }

    render() {
        return (
            <div
                ref="me"
                name={this.props.name}
                id={this.props.id}
                className={this.props.className}
                style={this.props.style}
            >                
            </div>
        );
    }
}

EchartsWrap.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    getOption: PropTypes.func.isRequired,
    isNotMergeOpt: PropTypes.bool,
    replaceMerge: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    lazyUpdate: PropTypes.bool,
    isClearOpt: PropTypes.bool,
    beforeMount: PropTypes.func,
    afterMount: PropTypes.func,
    beforeUpdate: PropTypes.func,
    afterUpdate: PropTypes.func,
    resizeRedraw: PropTypes.bool,
    resizeDelay: PropTypes.number,
    widthScale: PropTypes.number,
    heightScale: PropTypes.number
};  
EchartsWrap.defaultProps = {
    name: '',
    id: '',
    className: '',
    style: {},
    data: {},
    getOption: () => {},
    isNotMergeOpt: false, // 与isClearOpt效果相同
    replaceMerge: undefined,
    lazyUpdate: false,
    isClearOpt: false, // 与isNotMergeOpt效果相同
    beforeMount: () => {},
    afterMount: () => {},
    beforeUpdate: () => {},
    afterUpdate: () => {},
    resizeRedraw: false,
    resizeDelay: -1,
    widthScale: 1,
    heightScale: 1
}; 

export const EchartsEvent = (...[method, ...rest]) => {
    if(echarts && method && typeof echarts[method] === 'function'){
        return echarts[method].apply(echarts, rest);
    }
    return undefined;
};

export {echarts};

export default EchartsWrap;