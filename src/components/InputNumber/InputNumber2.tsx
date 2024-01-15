import React from "react";
import { InputNumber, InputNumberProps} from "antd";

import styles from './style2.mscss';


const NewInputNumber = (props: InputNumberProps) => {
    return <InputNumber className={styles.inputNumber} {...props} />
}

export default NewInputNumber;