import React from "react";
import NotFound from '@/components/NotFound';
import Device from '../device';
import StorageSite from '../home';

export default [{
    path: '/',
    element: <StorageSite />
}, {
    path: '/:deviceAlias',
    element: <Device />
},{
    path: '*',
    element: <NotFound />
}];