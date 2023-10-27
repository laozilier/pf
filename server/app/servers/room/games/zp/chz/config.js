class ChzConfig extends require('../../BaseConfig') {
    constructor() {
        super();
        this.playerMax = [2,3,4];
        this.autoNextTime = 60;
        this.bandianTime = 10000;
        this.piaofenTime = 15000;
        this.liujuTime = 30000;
        this.actionTime = 60000;        //操作等待时间
    }

    getTax(rule) {
        return Math.ceil(this.getAnte(rule) * 0.05);
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
        return this.getAnte(rule) * 40;
    }

    /**
     * 离场分数
     * @param rule
     */
    leaveScore(rule) {
        return this.entryScore(rule) * 0.8;
    }

}

module.exports = new ChzConfig();