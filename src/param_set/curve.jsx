import React,{ useEffect } from 'react'
import * as echarts from 'echarts/core';
const CONNECT_STR = '.'

export default function Curve(props) {
    
// console.log('props',props)
const { prefixClsChart,
        noAuth,
        prefixClsChartDisabled,
        newCharts,
        msg,
        prefixClsChartList,
        maxEleNumInRow,
        renderChild,
        keys,
        state,
        prefixClsChartShow,
        prefixClsChartCanvas,
        chartDoms,                    
        charts,
        domIndex,
        resizeCharts,
        needRender,
        chartsInsNum,
        handleChartRender } = props


    const initChart = ()=>{
    // if(!needRender){
    //     resizeCharts();
    //     return
        
    // }
        // handleChartRender(false)
        Object.keys(chartDoms).map((parentKey) => {
            // chartDoms[parentKey].map(eEl=>{
                const eEl = chartDoms[parentKey][domIndex]
                    const chart = echarts.init(eEl)
                    chart.setOption({
                        grid: {
                            top: 30,
                            bottom: 30
                        },
                        textStyle: {
                            fontSize: 14
                        }
                    });
                if(!charts[parentKey]&&chart)
                    {
                        charts[parentKey] = [chart];
                    }else{
                        const existIndex = charts[parentKey].findIndex(el=>el==chart)
                        if(existIndex==-1&&chart){
                            charts[parentKey].push(chart)
                        }
                    }
                // })
        });

        resizeCharts();
    }
    useEffect(()=>{
        initChart()
    },[])
  return (
    <div 
        key={1} 
        className={`${prefixClsChart} ${noAuth ? prefixClsChartDisabled : ''}`} 
        // style={{'marginTop':'20px','height':'100%'}}
        title={noAuth ? msg('noAuth') : ''}
    >
        <div className={`${prefixClsChartList}`}><table><tbody>
            {
                newCharts.map((group, ind) => {

                    let length = group.length;
                    let divisor = Math.floor(maxEleNumInRow / length);

                    return <tr key={ind}>{
                        Array.apply(null, Array(maxEleNumInRow))
                        .map((t, index) => {
                            let child = group[Math.floor(index / divisor)];

                            if(!child || index % divisor !== 0){
                                return <td key={index}></td>;
                            }

                            return <td key={index}><div>
                                <span 
                                    dangerouslySetInnerHTML={{
                                        __html: child.getDesc()
                                    }}
                                ></span>
                                {renderChild(keys.concat([child.getIndex()]), child, {
                                    width: state.extCls === 'mini' 
                                        ? 35 
                                        : state.extCls === 'middle' 
                                            ? 40 
                                            : 55
                                })}
                            </div></td>;
                        })
                    }</tr>;
                })
            }
        </tbody></table></div>

        {/*
        <div className={`${prefixClsChartList}`}>
            {
                newCharts.map((group, ind) => {

                    let length = group.length;
                    let className = length > 1 ? prefixClsChartRow : '';
                    let style = {};
                    if(length > 1){
                        Object.assign(style, {
                            //minWidth: `${100 / length}%`
                        });
                    }

                    return <div key={ind} className={className}>
                        {
                            group.map((child, index) => {
                                return <div key={index} style={style}>
                                    <span 
                                        dangerouslySetInnerHTML={{
                                            __html: child.getDesc()
                                        }}
                                    ></span>
                                    {this.renderChild(keys.concat([child.getIndex()]), child, {
                                        width: state.extCls === 'mini' 
                                            ? 40 
                                            : state.extCls === 'middle' 
                                                ? 50 
                                                : 60
                                    })}
                                </div>;
                            })
                        }
                    </div>;
                })
            }
        </div>
         */}
        <div className={`${prefixClsChartShow}`}>
            <div className={`${prefixClsChartCanvas} canvasDom${domIndex}`} 
            id={`canvasDom${domIndex}`}  
            key={`canvasDom${domIndex}`}
            ref={(e) =>{
                if(!chartDoms[keys.join(CONNECT_STR)]&&e){
                    chartDoms[keys.join(CONNECT_STR)] = [e]
                }else{
                    const existIndex = chartDoms[keys.join(CONNECT_STR)].findIndex(el=>el==e)
               if(existIndex == -1&&e){
                chartDoms[keys.join(CONNECT_STR)].push(e);
               }
                }
                    
                    // console.log('render dom',domIndex)
                    // initChart()
            }}>                        
            </div>
        </div>
    </div>
  )
}
