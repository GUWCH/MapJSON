import Konva from 'konva'

export default ({ count, x, y, height, color }: {
    count: number,
    x: number,
    y: number,
    height: number,
    color?: string
}): Konva.Group => {
    const g = new Konva.Group({
        x, y
    })

    const text = new Konva.Text({
        x: 2,
        y: 0,
        height: height + 2,
        text: String(count),
        align: 'center',
        verticalAlign: 'middle',
        fontSize: 12,
        fontFamily: 'PingFangSC-Medium, PingFang SC',
        fill: '#fff',
        padding: 5
    })

    const rect = new Konva.Rect({
        x: 2,
        y: 4,
        width: text.width(),
        height: height - 8,
        fill: color ?? '#2B97BA',
        cornerRadius: 3,
    })

    g.add(rect)
    g.add(text)
    g.width(rect.width() + 2)
    return g
}