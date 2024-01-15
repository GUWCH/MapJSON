import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import configRoutes from './config';
import App from '../App';

const getRoutes = () => {

    return <HashRouter>
        <Routes>
            <Route path="/" element={<App />}>
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
        </Routes>
    </HashRouter>;
}

export default getRoutes;