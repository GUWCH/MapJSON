import React from 'react';
import ReactDOM from 'react-dom';
import { PREVIEWSTATE } from './constant';
import { Preview, UserConfig } from 'dooringx-lib';
import { useState } from 'react';
import plugin from './plugin';

const config = new UserConfig(plugin);

function PreviewPage() {
	const data = localStorage.getItem(PREVIEWSTATE);
	//const [loading, setLoading] = useState(true);
	if (data) {
		try {
			const json = JSON.parse(data);
			config.resetData([json]);
		} catch {
			console.log('err');
		}
	}
	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Preview
				//loadingState={loading}
				// completeFn={() => {
				// 	setTimeout(() => {
				// 		setLoading(false);
				// 	}, 10000);
				// }}
				config={config}
			></Preview>
		</div>
	);
}

export default PreviewPage;
