import * as React from 'react';
import styles from './style.module.scss';

type StyleRowProp = {
    children?: React.ReactNode;
    noMB?: boolean;
}

const StyleRow = (props: StyleRowProp) => {
    return <div className={`${styles.row}`}>
        {props.children}
    </div>
}

export default StyleRow;