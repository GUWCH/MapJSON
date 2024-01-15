import moment, { Moment } from "moment"
import { useEffect, useRef } from "react"

/**
 * 对比hooks依赖
 */
export const useCompareDeps = (deps: any[], options?: {
    hookName?: string
    nameMark?: string[]
    toStringFn?: ((o: any) => string)[]
}) => {
    const pre = useRef(deps)

    useEffect(() => {
        const preDeps = pre.current

        const differences: {
            index: number,
            pre: any,
            current: any
        }[] = []
        preDeps.forEach((pre, i) => {
            const current = deps[i]
            if (pre !== deps[i]) {
                const toStringFn = options?.toStringFn?.[i]
                differences.push({
                    index: i,
                    pre: toStringFn ? toStringFn(pre) : pre,
                    current: toStringFn ? toStringFn(current) : current
                })
            }
        })
        if (differences.length > 0) {
            console.log((options?.hookName ?? '') + 'deps different:',
                differences.reduce((p, c) => {
                    return {
                        ...p,
                        [options?.nameMark?.[c.index] ?? c.index]: c
                    }
                }, {})
            )
        }

        pre.current = deps
    })
}

export const logTime = (name: string = 'time') => {
    console.log(name + ': ' + moment().format('YYYY-MM-DD HH:mm:ss'));
}

export const momentToLogStr = (m: Moment) => m.format('YYYY-MM-DD HH:mm:ss')

export const parseProxyObj = (obj: object) => JSON.parse(JSON.stringify(obj))