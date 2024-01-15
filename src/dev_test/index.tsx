import LocaleProvider from 'antd/lib/locale-provider'
import React from 'react'
import ReactDOM from 'react-dom'
import Test, { TooltipDemo } from './Draw'
import zhCN from 'antd/lib/locale/zh_CN'
import styles from './index.module.scss'
import '../common/css/app.scss'
import './dev.css'
import iconsMap from 'Icon/iconsMap'
import { FontIcon } from 'Icon'
import EchartsTest from './EchartsTest'
import ComponentsTest, { AssetAndPointPickerDemo, AssetTreeSelectorDemo, ButtonGroupDemo, CollapseDemo, ColorDemo, DatePickerDemo, HighlightTextDemo, IconSelectorDemo, PointCurveDemo, PointTreeDemo, TreeSelectorDemo, TrendAnalysisStatisticTableDemo } from './ComponentsTest'
import Draw from './Draw'
import { ConfigProvider, Tooltip } from 'antd'
// import StyledAntSelect from 'Select/StyledAntSelect'
// import ComponentsTest from './ComponentsTest'


const App = () => {
    return <ConfigProvider locale={zhCN}>
        <div className={styles.container}>
            <div className={styles.icons}>
                {Object.entries(iconsMap).map(([k, v]) => <FontIcon key={k} type={v} title={k} style={{
                    fontSize: '1.2em',
                    margin: '1px'
                }} />)}
            </div>
            <div className={styles.content}>
                {/* <Draw /> */}
                {/* <IconSelectorDemo /> */}
                {/* <TrendAnalysisStatisticTableDemo /> */}
                {/* <EchartsTest /> */}
                {/* <TooltipDemo /> */}
                {/* <ColorDemo /> */}
                {/* {/* <PointCurveDemo /> */}
                {/* <AssetAndPointPickerDemo />
                <PointTreeDemo />
                <CollapseDemo />
                <ButtonGroupDemo /> */}
                {/* <AssetTreeSelectorDemo /> */}
                <TreeSelectorDemo />
                {/* <HighlightTextDemo/> */}
                {/* <StyledAntSelect options={[{value: 1, label:'1'}, {value:2, label:'2'}]}/> */}
                <div className={styles.messure} />
            </div>
        </div>
    </ConfigProvider>
}

const _App = () => {
    return <div style={{ height: '100%', overflow: 'hidden' }}>
        <Tooltip visible title={<div style={{ width: 400, height: 400, background: 'yellow' }}>title</div>}>
            <div style={{
                width: 300, height: 300, position: 'absolute', background: 'red',
                top: 100, left: 0
            }}>content</div>
        </Tooltip>
    </div>
}

ReactDOM.render(<App />, document.getElementById('center'))