import Konva from 'konva'
import { FONT_FAMILY } from '../constants';

export default ({ x, y, width, height, code, iconColor }: {
    x: number,
    y: number,
    width: number
    height: number,
    code: string,
    iconColor?: string
}) => {
    return new Konva.Text({
        x: x,
        y: y,
        width: width,
        height: height,
        text: code,
        fontFamily: FONT_FAMILY,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 12,
        fill: iconColor ?? '#fff'
    });
}