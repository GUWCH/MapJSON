import * as React from 'react';
import { Tooltip } from 'antd';
import { msg, SLOT } from '../../constants';
import {IconColor} from '../StyleShow';
import { PointEvt } from '@/common/util-scada';

import styles from './style.mscss';

interface IDynDataProps{
    name?: String;
    value: String | Number;
    aKey: String;
    unitClassName?: String;
    /**
     * 别名
     */
    alias?: String;
    show?: boolean;
    color?: String;
    bg?: String;
    unit?:String;
    icon?: String;
    bgShow?:boolean;
    colorShow?:boolean,
    placement?:String,
    size?:String,
    iconFontSize?:String
};

class DynData extends React.PureComponent<IDynDataProps> {

    static defaultProps = {
        show: true
    }

    render(){

        const {
            name, 
            aKey='', 
            value, 
            color = '', 
            unit, 
            unitClassName, 
            icon, 
            bgShow = false, 
            colorShow = false,
            placement,
            ...restProps
        } = this.props;

        const keys = aKey.split(':');
        const keyStr = keys.length >= 3 ? keys[2] : (keys[0] || '');

        let colorStyle = {}, bgColorStyle = {};
        if(colorShow){
            colorStyle = {'color': color};
        }
        if(bgShow){
            bgColorStyle = {'background-color': color};
        }

        return <>
            <Tooltip 
                placement={ placement || 'top' }
                title={() => {
                    return <div>
                        <div><span style={{marginRight: 10}}>{msg('name')}:</span>{name}</div>
                        <div><span style={{marginRight: 10}}>{msg('alias')}:</span>{keyStr}</div>
                    </div>;
                }} 
                overlayClassName={styles.tip} 
                overlayStyle={{maxWidth: 500}}
                color={styles.tipColor}
                trigger={'contextMenu'}
            >
            <span onClick={(e) => {
                PointEvt.popMenu(aKey as string, e.nativeEvent);
            }}>
                {
                    icon || color ? <IconColor icon = {icon} color = {bgShow ? color : ''} {...restProps}/>: null
                }
                <span style={colorStyle} className={styles.data} >{value || SLOT}</span>
            </span>
            </Tooltip>
            {unit ? <span className={unitClassName}>{unit}</span> : null}
        </>
    }
}

export default DynData;