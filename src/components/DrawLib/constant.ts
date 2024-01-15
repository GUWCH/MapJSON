import Konva from "konva"

const COMMON_COLOR = {
    SEPARATE: '#04C766',
    CONNECT: '#FA465C',
    DEFAULT: '#A1B2C2'
}
export const DEFAULT_COLOR = {
    WIRE: '#A1B2C2',
    SAFE: '#04C766',
    SAFE_HOVER: '#10EE7F',
    UNSAFE: '#FA465C',
    UNSAFE_HOVER: '#FF6A7C',
    MISSING: '#A1B2C2',
    WARNING: '#FE9910',
    FONT_VALUE: '#CAD3DB',
    FONT_NAME: '#537C94',

    LINE: '#A1B2C2',
    ACBREAKER: COMMON_COLOR,
    PCS: '#00A7DB',
    COUPLED_SWITCH: COMMON_COLOR,
    FUSE: COMMON_COLOR,
    BANK: '#FFFFFF'
}

export enum SWITCH_STATE {
    SEPARATED = 0, CONNECTED = 1, MISSING = -1
}
export enum CONTROL_STATE {
    LOCAL = 0, REMOTE = 1, BROKEN = -1
}
export enum HEALTH_STATE {
    HEALTHY = 0, WARNING = 1, BROKEN = 2, MISSING = -1
}
export enum RUN_STATE {
    RUNNING = 0, // 运行中
    FAULT = 1, // 故障
    UNDER_MAINTENANCE = 2, // 维护中
    MISSING = -1 // 无值
}

/**
 * 文字自适应容器大小
 */
export const getFontSize = (width: number, text: string, defaultSize: number) => {
    let tempText = new Konva.Text({
        fontSize: defaultSize,
        text: text
    })

    let tempWidth = tempText.width();
    let tempFont = tempText.fontSize();

    const compuFont = tempFont / (tempWidth / width);

    const finalFont = compuFont > defaultSize ? defaultSize : compuFont;

    return finalFont
}

/**
 * 容器适应文字大小
 */
export const getRectWidth = () => {

}