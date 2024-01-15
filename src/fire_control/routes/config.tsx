import React from "react";
import NotFound from '../../components/NotFound';
// import Device from '../device'; //后期需求
import FireControl from '../home';

export default [{
    path: '/',
    element: <FireControl />
}, 
// {
//     path: '/:deviceAlias',
//     element: <Device />
// },
{
    path: '*',
    element: <NotFound />
}];