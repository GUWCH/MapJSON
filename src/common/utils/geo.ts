
/**
 * convert WGS84 coordinate to digit
 * @param {Number} wgs 
 * @returns {Number}
 */
export const WGS84_TO_DIGIT = (wgs, decimal=6) => {
    if (!wgs) return 0;
    if (!isNaN(wgs)) return Number(wgs);

    let deg: any = 0, min: any = 0, sec: any = 0;
    const matchs = /((\d+)\°)?((\d+)\')?((\d+)\")?/.exec(wgs);
    if (matchs) {
        deg = matchs[2] || 0;
        min = matchs[4] || 0;
        sec = matchs[6] || 0;
    }

    let ret: any = Number(deg) + Number((min / 60)) + Number((sec / 3600));
    ret = Number(ret).toFixed(decimal);
    ret = Number(ret);

    return ret;
}

/**
 * convert digit WGS84 coordinate to mercator coordinate for web application
 * @param {Number} wgsLonDigit 
 * @param {Number} wgsLatDigit 
 * @returns 
 */
export const WGS84_TO_WEB_MERCATOR = (wgsLonDigit, wgsLatDigit) => {
    let x = wgsLonDigit * 20037508.34 / 180;
    let y = Math.log(Math.tan((90 + wgsLatDigit) * Math.PI / 360)) / (Math.PI / 180);
    y = y * 20037508.34 / 180;
    return { x, y };
}