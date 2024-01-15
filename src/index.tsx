import React from 'react';
import ReactDOM from 'react-dom';

const Index = () => {
    return <div style={{}}>{
        // @ts-ignore
        Object.keys(MULTI_PAGES).map((k) => {
            // @ts-ignore
            const path = MULTI_PAGES[k][0];
            const paths = path.split('/');
            const pageName = paths[paths.length - 1].split('.')[0];
            return <p key={k} style={{margin: 0, padding: 0}}>
                <span>目录: </span>
                <a href={`${pageName}.html${pageName==='page_tpl' ? '#/tpl' : ''}`}>{
                    paths.slice(1).reduce((prev, next) => {
                        return `${prev}${prev ? '/' : ''}${next.split('.')[0]}`;
                    }, '')
                }</a>
            </p>
        })
    }</div>
}

ReactDOM.render(<Index />, document.getElementById('center'));
