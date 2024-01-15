export const randomHex = (bit: number, autoComplete?: boolean) => {
    if (bit <= 0) return '0'
    let result = 0
    for (let i = 1; i <= bit; i++) {
        result += Math.pow(16, i)
    }
    let str = result.toString(16)
    if (autoComplete) {
        while (str.length < bit) {
            str = '0' + str
        }
    }
    return str
}

export const randomColor = () => '#' + randomHex(6, true)
export const randomHslColor = () => "hsl(" + 360 * Math.random() + ',' +
    (75) + '%,' +
    (65) + '%)'