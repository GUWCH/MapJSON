import React, {useEffect, useState} from "react";
import { Popover } from "antd";
import { SketchPicker } from 'react-color';
import { FontIcon, IconType } from 'Icon';
import './style.scss';

const colorPick = 'env-color-pick';

const defaultColors = ['#00DBFF', '#58F5C0', '#8E85FF', '#FFB500', '#F50A22', '#BCBED1', '#BD10E0', '#9013FE'];
const defaultColor = 'rgba(0,0,0,0)';

function ColorPick(props) {

    let {value, onColorChange } = props;

    const [color, setColor] = useState(value);

    useEffect(() => {
        setColor(value);
    }, [value])

    const handleChange = (value) => {

        let {r, g, b, a} = value.rgb;

        let rgbToString = String(r+g+b+a) === '0' ? null : "rgba(" + r + ',' + g + ',' + b + ',' + a + ')';

        if(typeof(onColorChange) === 'function'){
            onColorChange(rgbToString);
        }

        setColor(rgbToString);
    }

    const renderColorPick = () => {
        return(
            <SketchPicker  
                className = {`${colorPick}-sketch`}
                width = {'235px'} 
                color = {color || ''}
                onChangeComplete = {handleChange}
                presetColors = {[...defaultColors, { color: defaultColor, title: 'Clear' }]}
            />
        )
    }

    let isNo = !color;

    return (
        <Popover placement="bottomRight" content={renderColorPick} trigger = "click">
            <button 
                className={`${colorPick} ${isNo ? 'noColor' :''}`}
                style = {isNo ? {} : {backgroundColor: color}}
            >
            {isNo ? <FontIcon type={IconType.SPLIT_LINE}/>: null} 
            </button>
        </Popover>
    )
}

const areEqual = (prevProps, nextProps) => {
    if(prevProps.value !== nextProps.value){
        return false;
    };

    return true;
}

// export default React.memo(ColorPick, areEqual);
export default ColorPick;