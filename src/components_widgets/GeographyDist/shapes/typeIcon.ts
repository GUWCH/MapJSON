import Konva from 'konva'
import { FONT_FAMILY } from '../constants'

export default ({
    x, y, height, width, code
}: {
    x: number
    y: number
    height: number
    width: number
    code: string
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
        fill: '#fff',
    })
}