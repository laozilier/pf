class DDZConfig extends require('../../BaseConfig') {
    constructor() {
        super();
        this.playerMax = [2, 3];
        this.autoNextTime = 7;
        this.actionTime = 30000;        //操作等待时间
    }

    /**
     * 游戏税收
     * @param rule  游戏规则
     * @returns {number}
     */
    getTax(rule) {
        return Math.ceil(this.getAnte(rule) * 0.05);
    }

    /**
     * 获取底注分数
     * @param rule
     * @returns {number}
     */
    getAnte(rule){
        return rule.ante;
    }

    /**
     * 入场分数
     * @param rule
     */
    entryScore(rule) {
        return this.getAnte(rule) * 64;
    }

    /**
     * 离场分数
     * @param rule
     */
    leaveScore(rule) {
        return this.entryScore(rule) * 0.2;
    }

}

module.exports = new DDZConfig();