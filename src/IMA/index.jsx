import LocaleProvider from 'antd/lib/locale-provider'
import React from 'react'
import ReactDOM from 'react-dom'
import Detail from './Detail'
import zhCN from 'antd/lib/locale/zh_CN'

const App = () => {
    return <LocaleProvider locale={zhCN}>
        <Detail/>
    </LocaleProvider>
}

if (process.env.NODE_ENV === 'development') {
    import('./dev.less')
    ReactDOM.render(<App />, document.getElementById('center'))
} else {
    ReactDOM.render(<App />, document.getElementById('container'))
}