/**
 *  创建者： THB
 *  日期：2018/6/29 16:14
 *
 *
 *  游戏配置信息
 */

class GuodiConfig extends require('../../BaseConfig') {
    constructor() {
        super();
        this.autoNextTime = 5;
        this.playerMax = [6, 8, 10];

        //机器人概率
        this.robotAlias = [{}, {},
            {data: [0.7, 0.3], prob: [1, 0.6], alias: [null, 0]},
            {data: [0.5, 0.3, 0.2], prob: [1, 0.9, 0.6], alias: [null, 0, 0]},
            {data: [0.5, 0.2, 0.2, 0.1], prob: [1, 0.8, 0.8, 0.4], alias: [null, 0, 0, 0]},
            {data: [0.30, 0.24, 0.23, 0.15, 0.08], prob: [1, 0.75, 0.55, 0.75, 0.4], alias: [null, 0, 1, 0, 2]},
            {data: [0.30, 0.20, 0.20, 0.13, 0.08, 0.09], prob: [1, 0.94, 0.74, 0.78, 0.48, 0.54], alias: [null, 0, 1, 0, 0, 2]},
            {data: [0.28, 0.16, 0.16, 0.15, 0.12, 0.07, 0.06], prob: [1, 0.71, 0.59, 0.47, 0.84, 0.49, 0.42], alias: [null, 0, 1, 2, 0, 0, 3]},
            {data: [0.24, 0.17, 0.17, 0.13, 0.1, 0.1, 0.05, 0.04], prob: [1, 0.48, 0.72, 0.36, 0.8, 0.8, 0.4, 0.32], alias: [null, 0, 1, 2, 0, 0, 1, 3],},
            {data: [0.20, 0.14, 0.13, 0.1, 0.1, 0.09, 0.09, 0.08, 0.07], prob: [1, 0.78, 0.8, 0.9, 0.9, 0.81, 0.81, 0.72, 0.63], alias: [null, 0, 1, 0, 0, 0, 0, 1, 2]},
            {data: [0.2, 0.12, 0.11, 0.11, 0.09, 0.09, 0.08, 0.08, 0.07, 0.05], prob: [1, 0.9, 0.7, 0.6, 0.9, 0.9, 0.8, 0.8, 0.7, 0.5], alias: [null, 0, 1, 2, 0, 0, 0, 0, 0, 3]},
        ];
        //幸运概率
        this.alias = [{}, {},
            {data: [0.6, 0.4], prob: [1, 0.8], alias: [null, 0]},
            {data: [0.36, 0.34, 0.30], prob: [1, 0.92, 0.9], alias: [null, 0, 1]},
            {data: [0.28, 0.26, 0.26, 0.2], prob: [1, 0.88, 0.84, 0.8], alias: [null, 0, 1, 2]},
            {data: [0.23, 0.23, 0.21, 0.18, 0.15], prob: [1, 0.95, 0.8, 0.9, 0.75], alias: [null, 0, 1, 0, 2]},
            {data: [0.18, 0.19, 0.19, 0.17, 0.14, 0.13], prob: [1, 0.92, 0.94, 0.8, 0.84, 0.78], alias: [null, 0, 1, 2, 1, 3]},
            {data: [0.16, 0.17, 0.17, 0.15, 0.13, 0.12, 0.1], prob: [1, 0.97, 0.94, 0.75, 0.91, 0.84, 0.7], alias: [null, 0, 1, 2, 0, 1, 3]},
            {data: [0.15, 0.16, 0.16, 0.14, 0.11, 0.11, 0.09, 0.08], prob: [1, 0.92, 0.76, 0.76, 0.88, 0.88, 0.72, 0.64], alias: [null, 0, 1, 2, 0, 1, 2, 3],},
            {data: [0.13, 0.15, 0.15, 0.13, 0.1, 0.1, 0.09, 0.08, 0.07], prob: [1, 0.93, 0.87, 0.8, 0.9, 0.9, 0.81, 0.72, 0.63], alias: [null, 0, 1, 2, 0, 1, 1, 2, 3]},
            {data: [0.15, 0.14, 0.14, 0.13, 0.1, 0.08, 0.07, 0.07, 0.07, 0.05], prob: [1, 0.7, 0.9, 0.8, 0.5, 0.8, 0.7, 0.7, 0.7, 0.5], alias: [null, 0, 1, 2, 3, 0, 1, 1, 2, 4]}
        ];

        //负幸运概率
        this.negativeAlias = [{}, {},
            {data: [0.4, 0.6], prob:[0.8,1], alias:[1,null]},
            {data: [0.3, 0.34, 0.36], prob:[0.9,1,0.98], alias:[2,null,1]},
            {data: [0.2, 0.26, 0.26, 0.28], prob:[0.8,1,0.96,0.92], alias:[3,null,1,2]},
            {data: [0.15, 0.18, 0.21, 0.23, 0.23], prob:[0.75,0.9,1,0.95,0.8], alias:[4,4,null,2,3]},
            {data: [0.13, 0.14, 0.17, 0.19, 0.19, 0.18], prob:[0.78,0.84,1,0.98,0.84,0.92], alias:[4,5,null,2,3,4]},
            {data: [0.1, 0.12, 0.13, 0.15, 0.17, 0.17, 0.16], prob:[0.7,0.84,0.91,1,0.95,0.76,0.87], alias:[5,6,6,null,3,4,5]},
            {data: [0.08, 0.09, 0.11, 0.11, 0.14, 0.16, 0.16, 0.15], prob:[0.64,0.72,0.88,0.88,1,0.88,0.96,0.96], alias:[5,6,7,7,null,4,5,6]},
            {data: [0.07, 0.08, 0.09, 0.1, 0.1, 0.13, 0.15, 0.15, 0.13], prob:[0.63,0.72,0.81,0.9,0.9,1,0.83,0.85,0.97], alias:[6,7,7,8,8,null,5,6,7]},
            {data: [0.05, 0.07, 0.07, 0.07, 0.08, 0.1, 0.13, 0.14, 0.14, 0.15], prob:[0.5,0.7,0.7,0.7,0.8,1,1,0.7,0.8,0.7], alias:[7,8,9,9,9,null,null,6,7,8]}
        ];

        //正常概率
        this.normalAlias = [{},{},
            {prob:[1,1], alias:[]},
            {prob:[1,1,1], alias:[]},
            {prob:[1,1,1,1], alias:[]},
            {prob:[1,1,1,1,1], alias:[]},
            {prob:[1,1,1,1,1,1], alias:[]},
            {prob:[1,1,1,1,1,1,1], alias:[]},
            {prob:[1,1,1,1,1,1,1,1], alias:[]},
            {prob:[1,1,1,1,1,1,1,1,1], alias:[]},
            {prob:[1,1,1,1,1,1,1,1,1,1], alias:[]},
        ];
    }

    getTax(rule) {
        return Math.ceil(this.getAnte(rule) * 0.03);
    }

    /**
     * 获取底注分数
     * @param rule
     * @returns {number}
     */
    getAnte(rule) {
        return rule.ante;
    }

    /**
     * 入场分数
     * @param rule
     */
    entryScore(rule) {
        // return 0;
        return this.getAnte(rule)*1.2;
    }

    /**
     * 离场分数
     * @param rule
     */
    leaveScore(rule) {
        // return 0;
        return this.getAnte(rule);
    }

    /**
     * 最大离场分数
     * @param rule
     * @returns {number}
     */
    maxLeaveScore(rule) {
        if (rule.ante == 10) {
            return 150000;
        }

        if (rule.ante == 100000) {
            return 999999999999;
        }

        return 99999999999999;
        // return this.entryScore(rule) * 20;
    }
}

module.exports = new GuodiConfig();