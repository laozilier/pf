/**
 *  创建者： THB
 *  日期：2019/12/21
 */
class BaseLasting{
    constructor() {
        this.settleScores = {};
    }

    /**
     * 包装客户端需要的数据
     * <br>当用户掉线重连时，需要调用此函数来包装lasting发送给客户端
     * <br>此函数需子类实现，如果未实现，则返回空对象
     */
    dataRequiredByClient(){
        return {};
    }

    setLeftScore() {
    }
}

module.exports = BaseLasting;