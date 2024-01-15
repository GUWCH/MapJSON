import '@/common/css/app.scss';

import * as React from 'react';
import ReactDOM from 'react-dom'
import { RecordFile } from "./RecordFile";

export const EmsRecordFile = (domNode: Element | null , options={}) => {
	ReactDOM.render(<RecordFile
        {...options}
    />, domNode);
}

if (process.env.NODE_ENV === 'development') {
    EmsRecordFile(document.querySelector('#center'));
}