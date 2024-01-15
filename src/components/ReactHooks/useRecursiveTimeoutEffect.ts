import React, { DependencyList, EffectCallback, useEffect, useRef } from "react";
import { useDeepCompareEffect } from "react-use";

const isPrimitive = (val: any) => val !== Object(val);

const useRecursiveTimeoutEffect =<Res> (
    callback: (() => [
        /**执行函数,要有返回值 */
        fn: (() => Promise<Res>) | (() => Res),
        /**执行函数结果回调 */
        handler?: (res: Res) => void,
        /**不执行函数也不执行定时器时回调 */
        stopFn?: () => void,
    ] | undefined | null),
    /**定时器时间,<=0时不执行函数也不执行定时器 */
    delay: number,
    /**依赖, 有变化时才会重新执行fn handler stopFn */
    deps: DependencyList, 
    deepCompare?: boolean
) => {
    const timer = useRef<number>();

    (!deepCompare ? useEffect : useDeepCompareEffect)(() => {
        const ret = typeof callback === 'function' ? callback() : null;
        if (!Array.isArray(ret)) return;

        const [fn, handler, stopFn] = ret;
        if (typeof fn !== 'function') return;

        let isClear = false;

        if (!isNaN(delay) && Number(delay) > 0) {
            let tick;
            tick = async () => {
                const res = await fn();

                if (isClear) {
                    return;
                }
                typeof handler === 'function' && handler(res);

                if (isNaN(delay) || Number(delay) <= 0) {
                    return;
                }
                timer.current = window.setTimeout(tick, delay);
            }

            tick();
        } else {
            typeof stopFn === 'function' && stopFn();
        }

        return () => {
            window.clearTimeout(timer.current);
            timer.current = undefined;
            isClear = true;
        };
    }, [delay, ...deps]);
};

export default useRecursiveTimeoutEffect;