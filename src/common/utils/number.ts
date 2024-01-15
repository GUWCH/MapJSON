/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
if(typeof BigInt === 'function'){
	// @ts-ignore
	BigInt.prototype.toJSON = function () {
		return this.toString();
	};
}

/**
 * 数字中最大值
 * @param arr 
 * @returns 
 */
export const numberArrMax = (arr: number[]) => {
    return arr.reduce((max, v) => max >= v ? max : v, -Infinity);
}

/**
 * 数字中最小值
 * @param arr 
 * @returns 
 */
export const numberArrMin = (arr: number[]) => {
    return arr.reduce((min, v) => min <= v ? min : v, Infinity);
}


/**
 * 数字精度问题始终无法避免, 特别是小数和极数, 如果是数字类型在使用时本身就会丢失精度
 * 极数还有科学计数法问题
 * 这里尽量适配所有数字问题, 但极数在运算(加减乘除)时还是会无法避免精度问题
 * 为了保证解析和运算时的精度,尽量采用以下方式
 * 1、后台接口返回数字时采用字符形式
 * 2、运算处理时也尽量采用字符形式
 */


/**
 * 数字转字符串
 * 包含科学计数法的数字
 * 超过js数字范围的采用字符串, 否则只能得到+-Infinity
 * @reference https://github.com/jtobey/javascript-bignum/blob/master/biginteger.js
 * @param {Number|String} num 
 * @returns {string}
 */
export const toNonExponential = (num?: number | string | null) => {
    if (num === null || num === '' || isNaN(num as number)) return num;

    num = (num as number).toString();
    num = num.replace(/\s*[*xX]\s*10\s*(\^|\*\*)\s*/, "e");

    return num.replace(/^([+\-])?(\d+)\.?(\d*)[eE]([+\-]?\d+)$/, function (x, s, n, f, c) {
        c = +c;
        let l = c < 0;
        let i = n.length + c;
        let length = (l ? n : f).length;
        c = ((c = Math.abs(c)) >= length ? c - length + Number(l) : 0);
        var z = (new Array(c + 1)).join("0");
        var r = n + f;
        return (s || "") + (l ? r = z + r : r += z).substring(0, i += l ? z.length : 0) + (i < r.length ? "." + r.substring(i) : "");
    });
};

/**
 * 是否空
 * @param value 
 * @returns {boolean}
 */
export const isEmpty = (value?: number | string | null) => {
    return (value === null || value === '' || value === undefined);
}

/**
 * 是否有限数字, 极值返回false
 * @param value 
 * @returns {boolean}
 */
export const isFinite = (x) => {
    return !isEmpty(x) && window.isFinite(x);
};


/**
 * 是否有效数字
 * @param value 
 * @returns {boolean}
 */
export const isValidNumber = (value?: number | string | null) => {
    return !(isEmpty(value) || isNaN(value as number));
}

/**
 * 数字保留几位小数
 * @param number 
 * @param decimals 
 * @param truncate 是否直接截断, 不进行四舍五入处理
 * @returns 
 */
export const round = (number: number | string, decimals: number = 0, truncate: boolean = false) => {
    if(!isValidNumber(number)) return number;
    let temp = Number(number);

    if (truncate) {
        const numberStr = temp.toFixed(decimals + 1);
        return parseFloat(numberStr.slice(0, -1));
    }

    var n = Math.pow(10.0, decimals);
    return (Math.round(temp * n) / n).toString();
};

/**
 * 去除数字千分位
 * @param num 
 * @returns 
 */
export const removeCommas = (num: number | string) => {
    let temp = num;
    num = (num === 0 ? 0 : num || '').toString().replace(/\,/g, '');
    if(num && !isNaN(Number(num))){
        num = Number(num);
		if(!isNaN(num) && isFinite(num)){
            return num.toString();
        }
    }
    return temp;
};

/**
 * 添加数字千分位
 * 包含小数
 * @param x 
 * @returns 
 */
export const addCommas = (x?: number | string | null) => {
    if(x === 0 || (typeof x === 'string' && x.indexOf(',') > -1)) return x;
    if(x && !isNaN(x as number)){
        return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
    return x;
}

export const great = (a, b) => {
    
}

export const less = (a, b) => {

}

/**
 * 通用数字按系数、小数位数和千分位进行格式化
 * @param value 
 * @param factor 
 * @param decimal 
 * @param thousand 
 * @returns 
 */
export const format = (
    value?: number | string | null, 
    factor?: number | string | null, 
    decimal?: number | string | null, 
    thousand=false
) => {
    if (isEmpty(value)) return value;

    let temp = removeCommas(value);
    if(!isValidNumber(temp)) return value;

    if(!isValidNumber(factor)){
        if(!isValidNumber(decimal)){
            return thousand ? addCommas(temp) : temp;
        }else{
			temp = Math.round(Number(temp) * (10 ** Number(decimal)))/(10 ** Number(decimal));
            return thousand ? addCommas(temp) : temp;
        }
    }

    temp = multiply(
        temp, 
        isValidNumber(factor) ? Number(factor) : 1, 
        isValidNumber(decimal) ? Number(decimal) : undefined, 
    );

    return thousand ? addCommas(temp) : temp;
};

const isInteger = (obj) => {
	return Math.floor(obj) === Number(obj);
}

const toInteger = (floatNum) => {
	let ret = {
		times: 1, num: 0
	};
	if (isInteger(floatNum)) {
		ret.num = floatNum;
		return ret;
	}
	const strfi = toNonExponential(floatNum) + '';
	const dotPos = strfi.indexOf('.');
	const len = dotPos === -1 ? 0 : strfi.substring(dotPos + 1).length;
	const times = Math.pow(10, len);
	let intNum = Number(strfi.replace(/\./g, ''));
	ret.times = times;
	ret.num = intNum;
	return ret;
}

export const toFixedDigits = (num, digits) => {
	if (isNaN(num)) return num;
	let s = toNonExponential(num) + "";
	if (!digits) digits = 0;
	if (s.indexOf(".") === -1) s += ".";
	s += new Array(digits + 1).join("0");

	const matchs = s.match(new RegExp("^(-|\\+)?(\\d+(\\.\\d{0," + (digits + 1) + "})?)\\d*$"));
	if(matchs){
		let sign = matchs[1] || '';
		let str = '0' + matchs[2];
		let fractionalLength: any = (matchs[3] || '').length;
		let b = true;

		if(fractionalLength == digits + 2){
			let strNums: any[] = str.match(/\d/g) || [];
			// 四舍五入处理
			if(parseInt(strNums[strNums.length - 1]) > 4){
				for (let i = strNums.length - 2; i >= 0; i--) {
					strNums[i] = parseInt(strNums[i]) + 1;
					if (strNums[i] == 10) {
						strNums[i] = 0;
						b = i !== 1;
					} else break;
				}
			}
			str = strNums.join("").replace(new RegExp("(\\d+)(\\d{" + digits + "})\\d$"), "$1.$2");
		}

		if (b) str = str.substring(1);
		return (sign + str).replace(/\.$/, "");
	}

	return num + "";
}

// eslint-disable-next-line complexity
function operation(a, b, digits, op) {
	let o1 = toInteger(a);
	let o2 = toInteger(b);
	let n1 = o1.num;
	let n2 = o2.num;
	let t1 = o1.times;
	let t2 = o2.times;
	let max = t1 > t2 ? t1 : t2;
	let result: any = null;

	switch (op) {
		case 'add':
			if (t1 === t2) { // The two decimal places are the same
				result = n1 + n2;
			} else if (t1 > t2) { // o1 decimal places greater than o2
				result = n1 + n2 * (t1 / t2);
			} else { // o1 decimal place is less than o2
				result = n1 * (t2 / t1) + n2;
			}
			if (typeof digits === 'number' && digits >= 0) {
				return toFixedDigits(result / max, digits);
			}
			return result / max;
		case 'subtract':
			if (t1 === t2) {
				result = n1 - n2;
			} else if (t1 > t2) {
				result = n1 - n2 * (t1 / t2);
			} else {
				result = n1 * (t2 / t1) - n2;
			}
			if (typeof digits === 'number' && digits >= 0) {
				return toFixedDigits(result / max, digits);
			}
			return result / max;
		case 'multiply':
			result = (n1 * n2) / (t1 * t2);
			if (typeof digits === 'number' && digits >= 0) {
				return toFixedDigits(result, digits);
			}
			return result;
		case 'divide':
			result = (n1 / n2) * (t2 / t1);
			if (typeof digits === 'number' && digits >= 0) {
				return toFixedDigits(result, digits);
			}
			return result;
	}

	return result;
}

export function add(a, b, digits?) {
	return operation(a, b, digits, 'add')
}
export function subtract(a, b, digits?) {
	return operation(a, b, digits, 'subtract')
}
export function multiply(a, b, digits?) {
	return operation(a, b, digits, 'multiply')
}
export function divide(a, b, digits?) {
	return operation(a, b, digits, 'divide')
}



