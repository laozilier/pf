/**
 *  创建者： THB
 *  日期：2019/12/18
 */


/**
 * 获取一个 n,m之间的随机数，包含n 不包含m
 * @param min 最小数
 * @param max 最大数，不包含
 * @returns {Number}
 */
Math.randomRange = function (min, max) {
    let random = Math.random();
    switch (arguments.length) {
        case 1:
            if (isNaN(min))
                return 0;
            return Math.floor(random * min + min);
        case 2:
            if (isNaN(min) || isNaN(max))
                return 0;
            if (min >= max)
                return min;
            return parseInt(random * (max - min) + min);
        default:
            return 0;
    }
};