import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import configRoutes from './config';
import Home from '../pages/Home';
import SolarApp from '@/components_utils/DomainSiteHome/solar/App';
import SolarDeviceTopo from '@/components_utils/DomainSiteHome/solar/device';
import StorageApp from '@/components_utils/DomainSiteHome/storage/App';
import StorageDeviceTopo from '@/components_utils/DomainSiteHome/storage/device';

const getRoutes = () => {

    return <HashRouter>
        <Routes>
            <Route path="/" element={<Home />}>
                {
                    configRoutes.map(
                        (ele, ind) => 
                        <Route 
                            key={ind} 
                            path={ele.path} 
                            element={ele.element}
                        />
                    )
                }
            </Route>
            <Route path="/topo_solar" element={<SolarApp />} >
                <Route key={1} path='/topo_solar/:deviceAlias' element={<SolarDeviceTopo />} />
            </Route>
            <Route path="/topo_storage" element={<StorageApp />} >
                <Route key={2} path='/topo_storage/:deviceAlias' element={<StorageDeviceTopo />} />
            </Route>
        </Routes>
    </HashRouter>;
}

export default getRoutes;