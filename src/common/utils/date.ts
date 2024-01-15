/**
 * YYYY-MM-dd hh:mm:ss.sss形式转化为UTC毫秒，修正了夏令时造成的跳变处毫秒数不准确
 * @param {string} date 
 */
export const getUTCTime = (date: string) => {
    if(!date || typeof date !== 'string'){
        return 0;
    }

    var actualTime = date.split(/\s+/)[1];
    if(!actualTime){
        actualTime = '00:00:00';
    }
    var actualHour = Number(actualTime.split(':')[0]);
    var actualMinute = Number(actualTime.split(':')[1]);

    var pattern = /\.(\d{1,3})/g,
        isoDate = date.replace(pattern, '').replace(/-/g, "/"), // replace 适配ie
        matchMillisecond = date.match(pattern),
        millisecond = '0';
        
    if(matchMillisecond){
        millisecond = matchMillisecond[0].replace(/\./g, '');
    }

    var localTime = new Date(isoDate);
    
    return Date.parse(isoDate)
        + parseInt(millisecond)
        + ((localTime.getTimezoneOffset() / 60) * -1 * 3600000)
        + ((actualHour - localTime.getHours()) + (actualMinute - localTime.getMinutes())/60)*3600000;
};

/** UTC毫秒转成标准时间 */
export const getStdFromUTCTime = (UTCMilliseconds: number, timeStamp?: number) => {
    return format(UTCMilliseconds, timeStamp, 'yyyy-MM-dd hhh:mm:ss');
};

/**
 * 格式化时间,消除夏令时影响
 * @param {object} stdDatetime Date | String['yyyy-MM-dd hh:mm:ss'] | Number[UTC毫秒]
 * @param {number | string} timeStamp 毫秒偏移量
 * @param {string} format 时间格式 'yyyy-MM-dd hh:mm:ss'
 */
export const format = (stdDatetime: Date | string | number, timeStamp?: number, format?: string) => {
    format = format || 'yyyy-MM-dd hh:mm:ss';

    if(!!!timeStamp || isNaN(timeStamp)){
        timeStamp = 0;
    }

    stdDatetime = stdDatetime instanceof Date 
                ? getStdFromDate(stdDatetime) 
                : stdDatetime;

    var D = new Date((isNaN(stdDatetime as any) ? getUTCTime(stdDatetime as string) : Number(stdDatetime)) + Number(timeStamp));

    var o = {
        "M+" : D.getUTCMonth() + 1,
        "d+" : D.getUTCDate(),
        "D+" : D.getUTCDate(),
        "h+" : D.getUTCHours(),
        "H+" : D.getUTCHours(),
        "m+" : D.getUTCMinutes(),
        "s+" : D.getUTCSeconds(),
        "S+" : D.getUTCSeconds()
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (D.getUTCFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]: ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

// 将格式化后的日期时间变成标准格式
// 消除夏令时影响
export const stdFormat = (formattedDatetime: string, format?: string) => {
    format = format || 'yyyy-MM-dd hh:mm:ss';

    let val: any[] = [];
    let dateArr = formattedDatetime.split(/\s+/gi);
    let o = {
        "yy" : 'yy', // second
        "M+" : 'MM', // month
        "d+" : 'dd', // day
        "D+" : 'DD', // day
        "h+" : 'hh', // hour
        "H+" : 'HH', // hour
        "m+" : 'mm', // minute
        "s+" : 'ss', // second
        "S+" : 'SS' // second
    };
    if (new RegExp("(yyyy)").test(format)) {
        val.push(formattedDatetime.substr(format.indexOf("yyyy"), 4));
        formattedDatetime = formattedDatetime.replace(formattedDatetime.substr(format.indexOf("yyyy"), 4), '');
        format = format.replace("yyyy", '');
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(format)) {
            val.push("" + formattedDatetime.substr(format.indexOf(o[k]), 2));
        }
    }
    return (val[0].length > 2 ? val[0] : '20' + val[0])
        + '-'
        + val[1]
        + '-'
        + val[2]
        + (dateArr[1] ? (' ' + val[3] + ':' + val[4] + ':' + val[5]) : '');
}

const convert = function (digit) {
    return digit > 9 ? digit : '0' + digit;
};

/**
 * 日期对象转标准日期时间yyyy-mm-dd hh:mm:ss字符串
 * @param {Date} d 
 * @returns 
 */
export const getStdFromDate = function (d: Date) {
    if (d && d instanceof Date) {
        var Y = d.getFullYear(),
            M = d.getMonth() + 1,
            D = d.getDate(),
            h = d.getHours(),
            m = d.getMinutes(),
            s = d.getSeconds();
        return Y + '-'
            + convert(M) + '-'
            + convert(D) + ' '
            + convert(h) + ':'
            + convert(m) + ':'
            + convert(s);
    }
    return '';
};

/**
 * 获取当前日期的标准时间yyyy-mm-dd hh:mm:ss字符串
 * @param {boolean} zero 是否是零点时刻
 * @returns 
 */
export const getStdNowTime = function (zero?) {
    var nowDate = new Date(),
        Y = nowDate.getFullYear(),
        M = nowDate.getMonth() + 1,
        D = nowDate.getDate(),
        h = nowDate.getHours(),
        m = nowDate.getMinutes(),
        s = nowDate.getSeconds();
    return Y + '-' + convert(M) + '-' + convert(D) + ' '
        + (!zero ? convert(h) : '00') + ':'
        + (!zero ? convert(m) : '00') + ':'
        + (!zero ? convert(s) : '00');
};
