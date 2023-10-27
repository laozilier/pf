/**
 *  创建者： THB
 *  日期：2019/12/24
 */

const mahjongCardsMath = require('./mjCardsMath');

class MJOperatorData {
    constructor(data) {
        /**
         * 操作类型
         * <br>吃：  0x1000
         * <br>碰：  0x2000
         * <br>杠：  0x3100=明杠，0x3200=暗杠，0x3300=放杠
         * <br>补张：0x4100=明补，0x4200=暗补，0x4300=放补  (长沙麻将)
         * <br>胡：  0x9000
         * @type {number}
         */
        this.category = mahjongCardsMath.parseCategory(data);

        //吃，杠的类型，
        this.operatorType = mahjongCardsMath.parseOperatorType(data);
        /**
         * 原始数据
         */
        this.data = data;

        /**
         * 麻将牌的面值 1-9万，1-9条
         * @type {number}
         */
        this.faceValue = mahjongCardsMath.parseFaceValue(data);

        /**
         * 麻将牌的值
         * <br>0~26，万、条、筒
         * @type {number}
         */
        this.value = mahjongCardsMath.parseValue(data);
        /**
         * 麻将牌花色; 0=万、1=条、2=筒
         * @type {number}
         */
        this.colors = mahjongCardsMath.parseColors(data);
    }
}

module.exports = MJOperatorData;