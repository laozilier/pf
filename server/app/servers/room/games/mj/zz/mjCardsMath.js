/**
 *  创建者： THB
 *  日期：2019/12/23
 *
 *  0~26: 分别为万、条、筒
 */

module.exports = {
    /**
     * 麻将牌花色
     * @param v 万、条、筒
     * @returns {number}
     */
    parseColors: function (v) {
        return Math.floor((v & 0xFF) / 9);
    },
    /**
     * 麻将牌的数据值 0~26
     * <br>0~26，万、条、筒
     * @param v
     * @returns {number}
     */
    parseValue: function (v) {
        return (v & 0xFF);
    },

    /**
     * 麻将牌的面值
     * <br>0~8
     * @param v
     * @returns {number}
     */
    parseFaceValue: function(v){
        return (v & 0xFF) % 9 + 1;
    },
    /**
     * 操作类型
     * <br>吃：0x1000
     * <br>碰：0x2000
     * <br>杠：0x3100=明杠，0x3200=暗杠，0x3300=放杠
     * <br>补张：0x4100=明补，0x4200=暗补，0x4300=放补  (长沙麻将)
     * <br>胡：0x9000
     * @param v
     * @returns {number}
     */
    parseCategory: function (v) {
        return v >> 12;
    },

    /**
     * 吃，杠的类别
     * @param v
     * @returns {number}
     */
    parseOperatorType: function (v) {
        return  v >> 8 & 0xF
    }
};
console.log(module.exports.parseOperatorType(0x3000 + 3));
