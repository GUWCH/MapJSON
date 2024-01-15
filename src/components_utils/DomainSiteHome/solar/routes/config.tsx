import React from "react";
import NotFound from '@/components/NotFound';
import Device from '../device';
import SolarSite from '../home';

export default [{
    path: '/',
    element: <SolarSite />
}, {
    path: '/:deviceAlias',
    element: <Device />
},{
    path: '*',
    element: <NotFound />
}];