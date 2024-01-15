import React, { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import queryString from 'query-string';

function Home(){
    const nav = useNavigate();
    const parseUrl = queryString.parseUrl(window.location.href, {parseFragmentIdentifier: true});
    const {query: {id}, fragmentIdentifier} = parseUrl;

    useEffect(() => {        
        if(id && !window.location.hash.startsWith('#/page/')){
            nav(`/page/${id}`, {replace: true});
        }
    }, [id, fragmentIdentifier]);
    
    return <Outlet />;
}

export default Home;