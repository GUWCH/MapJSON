import '@/common/css/app.scss';

import * as React from 'react';
import ReactDOM from 'react-dom'
import { AvailabilityAndDowntime } from "./Report";

export const StorageReport = (domNode: Element | null , props={}) => {
	ReactDOM.render(<AvailabilityAndDowntime
        {...props}
    />, domNode);
}

if (process.env.NODE_ENV === 'development') {
    StorageReport(document.querySelector('#center'));
}