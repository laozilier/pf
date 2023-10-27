class FruitConfig extends require('../../BaseConfig') {
    constructor() {
        super();
        this.playerMax = [50];
        this.autoNextTime = 10;
        this.betTime = 20000;
        this.gameTime = 10000;
    }

    getTax(rule) {
        return Math.ceil(this.getAnte(rule) * 0.01);
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

module.exports = new FruitConfig();