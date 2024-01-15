import * as React from 'react';
import styles from './style.module.scss';

type StylePanelProp = {
    children?: React.ReactNode;
    noMB?: boolean;
}

const StylePanel = (props: StylePanelProp) => {
    return <div className={`${styles.main}${props.noMB ? ` ${styles['no-margin-bottom']}` : ''}`}>
        {props.children}
    </div>
}

export default StylePanel;