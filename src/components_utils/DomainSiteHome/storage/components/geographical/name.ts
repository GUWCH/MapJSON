import { calcCusEventProps, fireCustomEvent } from 'DrawLib/utils'
import Konva from 'konva'
import { DeviceTooltipProps } from '../tooltips/DeviceTooltip'
import { UnionTooltipProps } from '../tooltips/UnionTooltip'

const MAX_WIDTH = 184
const MIN_WIDTH = 59

export default ({
    x, y,width, height, text,fontSize, onRename
}: {
    x: number,
    y: number,
    width:number,
    height: number,
    text: string,
    fontSize:number,
    onRename?: (name: string) => void
}) => {
    const name = new Konva.Text({
        x: x,
        y: y,
        height: height,
        width:width,
        text: text,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: fontSize,
        fontFamily: 'SFPro-Medium, SFPro',
        fill: '#fff',
    });

    const actualWidth = name.width()
    // name.width(Math.max(Math.min(actualWidth, MAX_WIDTH), MIN_WIDTH))

    if (onRename) {
        name.on('dblclick', (evt) => {
            if (evt.evt.detail === 1) return;
            const stage = evt.target.getStage();
            let textPosition = name.getAbsolutePosition();
            let stageBox = stage?.container().getBoundingClientRect();
            let areaPosition = {
                /**不加括号, 会把0+作为运算表达式, 计算错误, 编译后没问题 */
                x: (stageBox?.left ?? 0) + textPosition.x,
                y: (stageBox?.top ?? 0) + textPosition.y,
            };

            let textarea = document.createElement('input');
            document.body.appendChild(textarea);

            textarea.maxLength = 20
            textarea.value = name.text();
            Object.assign(textarea.style, {
                position: 'absolute',
                top: areaPosition.y + 'px',
                left: areaPosition.x + 'px',
                width: name.width() + 'px',
                height: name.height() + 'px',
                backgroundColor: '#254F61',
                border: '1px solid #00A7DB',
                color: '#fff',
                borderRadius: '2px',
                fontSize: '11px'
            })

            textarea.focus();

            textarea.addEventListener('blur', function (e) {
                name.text(textarea.value);
                document.body.removeChild(textarea);
                onRename(textarea.value)
                return false;
            })

            evt.cancelBubble = true;
        })
    }

    return name
}