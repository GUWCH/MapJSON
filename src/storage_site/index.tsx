/* eslint-disable */
import React from 'react';
import ReactDOM from 'react-dom';
import getRoutes from '@/components_utils/DomainSiteHome/storage/routes';

function AppWrap(props){
    return getRoutes(props);
}

let container;
let instance;
export const AppWidget = function (dom) {
	if (!dom && !container) {
		container = document.createElement('div');
		container.style.display = 'none';
		document.body.appendChild(container);
	}

	if (!instance) {
		instance = ReactDOM.render(
			<AppWrap 
				container={dom || container}
			/>, dom || container
		);
	}

	return instance;
}

if(process.env.NODE_ENV === 'development'){
    ReactDOM.render(
		<AppWrap 
			container={document.getElementById('center')}
		/>, document.getElementById('center')
	);
}

/* eslint-enable */