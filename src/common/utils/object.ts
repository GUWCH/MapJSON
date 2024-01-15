export function isObject(item: any): item is object {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * 同种对象深度合并
 */
export function mergeDeep<T>(target: T, ...sources: (RecursivePartial<T> | undefined)[]) {
    const source = sources.shift();
    if (!source) return target

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            const valueToMerge = source[key]
            if (isObject(valueToMerge)) {
                if (!target[key]) {
                    Object.assign(target, { [key]: {} });
                } else {
                    target[key] = Object.assign({}, target[key])
                }
                mergeDeep(target[key], valueToMerge);
            } else {
                Object.assign(target, { [key]: valueToMerge });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

export const getPropertyIfExist = <O extends object, K extends UnionKey<O>>(o: O | undefined, k: K): unknown | undefined => {
    if (o === undefined) {
        return undefined
    }
    if (k in o) {
        return o[k]
    }
    return undefined
}