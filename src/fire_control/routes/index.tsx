import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import configRoutes from './config';

const getRoutes = () => {

    return <HashRouter>
        <Routes>
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
        </Routes>
    </HashRouter>;
}

export default getRoutes;