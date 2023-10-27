/**
 *
 * 洗牌算法
 *
 * Created by THB on 2019/9/18
 */

/**
 * Knuth-Durstenfeld Shuffle 随机洗牌算法
 * <br>参考文档：https://blog.csdn.net/codesquare/article/details/99288692
 * @param {Array} array
 * @constructor
 */
exports.knuthDurstenfeldShuffle = function (array) {
    for(let i = array.length - 1; i >= 0; --i){
        let k = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[k];
        array[k] = temp;
    }
};
