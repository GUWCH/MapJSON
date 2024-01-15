import React from "react";
import TemplateList from '../pages/IndexTpl';
import NotFound from '../../components/NotFound';
import CE from '../pages/CanvasEditor';
import IndexPage from '../pages/IndexPage';
import AuthRoute from '../pages/AuthRoute';

const isDev: boolean = process.env.NODE_ENV === 'development';

export default [{
    path: '/tpl',
    element: isDev ? <TemplateList /> : <AuthRoute><TemplateList /></AuthRoute>
},{
    path: '/editor',
    element: isDev ? <CE isEdit={true}/> : <AuthRoute><CE isEdit={true}/></AuthRoute>
},/* {
    path: '/preview',
    element: <CE isEdit={false}/>
}, */{
    path: '/page',
    element: <IndexPage key={1}/>
},{
    path: '/page/:sign',
    element: <IndexPage key={2} />
},{
    // react device, use history state
    path: '/page/:sign/device/:deviceAlias/:deviceSign',
    element: <IndexPage key={3} />
},{
    // no react device, use param
    path: '/page/:sign/device/:deviceAlias/:deviceSign/:deviceTable/:deviceType',
    element: <IndexPage key={4} />
},{
    path: '/page/device/:deviceAlias/:deviceSign',
    element: <IndexPage key={5} />
},{
    path: '*',
    element: <NotFound />
}];