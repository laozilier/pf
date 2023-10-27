/**
 *  创建者： THB
 *  日期：2019/8/12
 */

/**
 * 计算元素总和
 * @returns {*}
 */
Array.prototype.sum = function () {
    return this.reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
    });
};


/**
 * 移除元素
 * @param value  移除的元素
 * @param count  移除数量
 */
Array.prototype.remove = function (value, count) {
    count = count || 1;
    for(let i = 0; i < count; ++i){
        let index = this.indexOf(value);
        if(index < 0) break;
        this.splice(index, 1);
    }
};

/**
 * 移除等于value的所有元素
 * @param value
 */
Array.prototype.removeAll = function (value) {
    let index = this.indexOf(value);
    while (index > -1) {
        this.splice(index, 1);
        index = this.indexOf(value);
    }
};

/**
 * 查找数组中最大的
 * @param cb   回调方法，参数与foreach相同
 * @return {*} 返回最大的那个值
 */
Array.prototype.max = function (cb) {
    if (this.length === 1)
        return this[0];

    if (this.length === 0)
        return undefined;

    if (cb === undefined) {
        return Math.max.apply(Math, this);
    } else {
        let max = 0;
        for (let i = 1; i < this.length; ++i) {
            if (!cb.apply(this, [this[max], this[i], this])) {
                max = i;
            }
        }

        return this[max];
    }
};

/**
 * 查找数组中最小的
 * @param cb   回调方法，参数与foreach相同
 * @return {*} 返回最小的那个值
 */
Array.prototype.min = function (cb) {
    if (this.length === 1)
        return this[0];

    if (this.length === 0)
        return undefined;

    if (cb === undefined) {
        return Math.min.apply(Math, this);
    } else {
        let min = 0;
        for (let i = 1; i < this.length; ++i) {
            if (cb.apply(this, [this[min], this[i], this])) {
                min = i;
            }
        }

        return this[min];
    }
};

/**
 * 去除数组中重复数据
 * @returns {Array} 去重后的数组
 */
Array.prototype.distinct = function () {
    let ra = [];
    for (let i = 0; i < this.length; i++) {
        if (ra.indexOf(this[i]) === -1) {
            ra.push(this[i]);
        }
    }
    return ra;
};

/**
 * 两个数组的差集
 * @param arr
 * @returns {Array|*}
 */
Array.prototype.minus = function (arr) {
    let ab = this.distinct().union(arr);
    let ss = [];
    ab.forEach((o) => {
        (arr.indexOf(o) !== -1 && this.indexOf(o) !== -1) ? 0 : ss.push(o);
    });
    return ss;
};


/**
 * 两个数组的并集
 * @param arr
 * @returns {Array|*}
 */
Array.prototype.union = function(arr){
    return arr.concat(arr).distinct();
};

/**
 * 两个数组的交集
 * @param arr
 * @returns {Array|*}
 */
Array.prototype.intersect = function(arr){
    let ab = this.distinct().union(arr);
    let ss = [];
    ab.forEach((o) => {
        (arr.indexOf(o) !== -1 && this.indexOf(o) !== -1) ? ss.push(o) : 0;
    });
    return ss;
};