/**
 * 
 * @param num 生成数量
 * @object options 
 * @property startH 起始色相 0-360
 * @property lightness 明度 0-100
 * @property saturation 饱和度 0-100
 */
export const generateRandomColor = (num: number, options?: {
    /* 起始色相 0-360 */
    startH?: number
    /* 明度 0-100 */
    lightness?: number
    /* 饱和度 0-100 */
    saturation?: number
}): string[] => {
    const hInterval = 360 / num
    const startHue = (options?.startH ?? 0) % 360
    const result: string[] = []
    const saturation = Math.min(Math.max(options?.saturation ?? 75, 0), 100)
    const lightness = Math.min(Math.max(options?.lightness ?? 65, 0), 100)
    for (let i = 0; i < num; i++) {
        const hue = parseFloat(((startHue + hInterval * i) % 360).toFixed(3))
        result.push(`hsl(${hue},${saturation}%,${lightness}%)`)
    }

    return result
}