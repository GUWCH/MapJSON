import { isRowAndColLayoutItem, point } from 'DrawLib/utils'
import Konva from 'konva'
import { ActualStageInfo } from 'KonvaWrap'
import { CommonOptions, ILayoutEleContent, IRowAndColLayoutBuilder, IRowAndColLayoutItem, JustifyContent, LinkPointProvider, LinkPointRegister, Padding, Point, ShapeElement } from '../model'

export class RowAndColLayoutItem implements IRowAndColLayoutItem {
    constructor(direction: 'row' | 'col', options?: {
        height?: number
        width?: number
        justifyContent?: JustifyContent
        origin?: Point
        padding?: Padding
        name?: string
    }) {
        this.name = options?.name
        this.direction = direction
        this.height = options?.height
        this.width = options?.width
        this.justifyContent = options?.justifyContent || 'center'
        this.origin = options?.origin
        this.padding = options?.padding
    }

    name?: string //debug 用
    group?: Konva.Group
    origin?: Point
    direction: 'row' | 'col'
    height?: number
    width?: number
    justifyContent: JustifyContent
    content?: ILayoutEleContent<any, any> | IRowAndColLayoutItem[]
    padding?: Padding

    private calcContentProps = (): { start: Point[], rect: { width: number, height: number } } => {
        if (!this.origin || this.width === undefined || this.height === undefined) {
            throw Error(`container origin{${this.origin}}/rectWidth{${this.width}}/rectHeight{${this.height}} has not been set`)
        }
        const {
            top = 0,
            bottom = 0,
            left = 0,
            right = 0
        } = this.padding || {}
        return {
            start: [point(this.origin.x + left, this.origin.y + top)],
            rect: {
                width: this.width - right - left,
                height: this.height - bottom - top,
            }
        }
    }

    private calcContentOrigins = () => {
        const { top = 0, right = 0, bottom = 0, left = 0 } = this.padding || {}
        if (!this.origin || this.width === undefined || this.height === undefined) {
            throw Error('origin/width/height has not been set, content key:' + (this.content as ILayoutEleContent<any, any> | undefined)?.key)
        }
        const directionLength = this.direction === 'row' ? this.width - left - right : this.height - top - bottom

        const colOrigins: Point[] = []
        if (!Array.isArray(this.content) || this.content.length === 0) {
            return colOrigins
        }

        const contents = this.content as IRowAndColLayoutItem[]
        const contentLengthSum = contents.reduce((p, c) => {
            if (this.direction === 'row') {
                return p + (c.width || 0)
            } else {
                return p + (c.height || 0)
            }
        }, 0)
        let firstDirectionPosition: number = this.direction === 'row' ? this.origin.x + left : this.origin.y + top
        let gap = 0
        switch (this.justifyContent) {
            case 'space-between': {
                gap = Math.max(
                    (directionLength - contentLengthSum) / (Math.max(contents.length - 1, 1))
                    , 0)
                break;
            }
            case 'space-evenly': {
                gap = Math.max(
                    (directionLength - contentLengthSum) / (Math.max(contents.length + 1, 1))
                    , 0)
                firstDirectionPosition += gap
                break;
            }
            case 'flex-end': {
                firstDirectionPosition += directionLength - contentLengthSum
                break;
            }
            case 'flex-start': {
                break;
            }
            default: {
                firstDirectionPosition += directionLength / 2 - contentLengthSum / 2
            }
        }

        const origins: Point[] = []
        let preContentLengthSum = 0
        contents.forEach((content, i) => {
            if (this.direction === 'row') {
                origins.push({
                    x: firstDirectionPosition + i * gap + preContentLengthSum,
                    y: this.origin!.y + top
                })
                preContentLengthSum += content.width || 0
            } else {
                origins.push({
                    x: this.origin!.x + left,
                    y: firstDirectionPosition + i * gap + preContentLengthSum
                })
                preContentLengthSum += content.height || 0
            }
        })
        return origins
    }

    addContent = (item?: ILayoutEleContent<any, any, any> | IRowAndColLayoutItem) => {
        if (!item) {
            return this
        }
        if (this.content !== undefined && !Array.isArray(this.content) && isRowAndColLayoutItem(item)) {
            console.warn('layout content have been override to IRowAndColLayoutItem array');
        }

        if (isRowAndColLayoutItem(item)) {
            if (Array.isArray(this.content)) {
                this.content.push(item)
            } else {
                this.content = [item]
            }
        } else {
            this.content = item
        }
        return this
    }

    constructGroup: (
        group: Konva.Group,
        opt?: ActualStageInfo,
        options?: {
            parentInfo?: { width?: number, height?: number, padding?: Padding },
            linkPointRegister?: LinkPointRegister
        }
    ) => void = (group, opt, options) => {
        const { parentInfo, linkPointRegister } = options || {}

        if (this.width === undefined) {
            this.width = (parentInfo?.width || 0) - (parentInfo?.padding?.left || 0) - (parentInfo?.padding?.right || 0)
        }
        if (this.height === undefined) {
            this.height = (parentInfo?.height || 0) - (parentInfo?.padding?.top || 0) - (parentInfo?.padding?.bottom || 0)
        }

        if (!this.content) {
            return
        }
        if (Array.isArray(this.content)) { // 内嵌item渲染
            const itemOrigins = this.calcContentOrigins()
            this.content.forEach((c, i) => {
                c.origin = itemOrigins[i]
                c.constructGroup(group, opt, {
                    parentInfo: {
                        width: this.width,
                        height: this.height,
                        padding: this.padding
                    },
                    linkPointRegister
                })
            })
        } else { // 内嵌图形渲染
            const state = this.content.stateProducer?.()
            if (state !== undefined || !this.content.stateProducer) {
                const layoutOptions: CommonOptions = {
                    startType: 'origin'
                }
                const props = Object.assign({}, this.content.baseProps, {
                    ...this.calcContentProps(),
                    options: Object.assign({ key: this.content.key }, this.content.baseProps?.options, layoutOptions)
                }, {
                    state: state
                })
                const element = this.content.drawFunc(props)
                if (linkPointRegister && this.content.key) {
                    linkPointRegister(this.content.key, element.start, 'start')
                    linkPointRegister(this.content.key, element.end, 'end')
                }
                group.add(element.ele)
            }
        }
    }
}

export class RowAndColLayoutBuilder implements IRowAndColLayoutBuilder {
    constructor(rootLayout: IRowAndColLayoutItem, link: (g: Konva.Group, p: LinkPointProvider) => { start: Point[], end: Point[] } | void, group?: Konva.Group,) {
        this.group = group || new Konva.Group()
        this.rootLayout = rootLayout
        this.link = link
    }
    private group: Konva.Group
    private rootLayout: IRowAndColLayoutItem
    private linkPointsMap: { [key: string]: { start: Point[], end: Point[] } } = {}

    private linkPointRegister: LinkPointRegister = (key, p, type) => {
        const points = this.linkPointsMap[key]
        if (points) {
            if (Array.isArray(p)) {
                points[type].push(...p)
            } else {
                points[type].push(p)
            }
        } else {
            this.linkPointsMap[key] = Object.assign({
                start: [], end: []
            }, {
                [type]: Array.isArray(p) ? p : [p]
            })
        }
    }
    private getLinkPoints: LinkPointProvider = (key) => {
        if (!key) return
        return this.linkPointsMap[key]
    }
    private link: (g: Konva.Group, p: LinkPointProvider) => { start: Point[], end: Point[] } | void
    build: (opt?: ActualStageInfo) => { start: Point[], end: Point[], ele: Konva.Group } = (opt) => {
        this.rootLayout.constructGroup(this.group, opt, { linkPointRegister: this.linkPointRegister })
        const { start = [], end = [] } = this.link(this.group, this.getLinkPoints) || {}
        return {
            start, end, ele: this.group
        }
    }
}