import _ from 'lodash';

export const isArrayEqual = (x, y) => {
    return _(x).differenceWith(y, _.isEqual).isEmpty();
};

export const isArrayEqualErase = (x, y) => {
    return _(x).xorWith(y, (a,b) => {
        return _.isEqualWith(a,b, function(c, d){
            if(Array.isArray(c) && Array.isArray(d)){
                return isArrayEqualErase(c, d);
            }
        });
    }).isEmpty();
};

/**
 * 适合少量比对, 大数据或复杂数据对比性能低
 * 建议使用lodash本身方法isEqual
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
export const isEqual = (x, y) => {
    if(Array.isArray(x) && Array.isArray(y)){
        return isArrayEqualErase(x, y);
    }else if(Object.prototype.toString.call(x) === '[object Object]' && 
    Object.prototype.toString.call(y) === '[object Object]'){
        if(Object.keys(x).length === Object.keys(y).length){
            return Object.keys(x).filter(key => !isEqual(x[key], y[key])).length === 0;
        }else{
            return false;
        }
    }else{
        return _.isEqual(x, y);
    }
};

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export const difference = (object, base) => {
	return _.transform(object, (result: any, value, key) => {
		if (!_.isEqualWith(value, base[key], (objValue, othValue) => {
            if(objValue !== '' && 
                othValue !== '' && 
                !isNaN(objValue) && 
                !isNaN(othValue) && 
                Number(objValue) === Number(othValue)){
                return true;
            }
            if(_.isArray(objValue) && _.isArray(othValue)){
                return isArrayEqualErase(objValue, othValue);
            }
        })) {
			result[key] = _.isObject(value) && _.isObject(base[key]) ? difference(value, base[key]) : value;
		}
	});
};