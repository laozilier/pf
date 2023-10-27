/**
 *  创建者： THB
 *  日期：2020/1/3
 */
const BaseHuLogin = require('../BaseHuLogic');

/**
 * @extends {BaseHuLogin}
 */
class ZZHuLogin extends BaseHuLogin{
    /**
     *
     * @param rogue 赖子数量
     */
    constructor(rogue) {
        super("zhuanzhuan", "tbl" + rogue);
    }

    checkHu(holdsDic) {
        let check = super.checkHu(holdsDic);
        //判断其它胡，如七小对，豪华七小对，双豪华七小对，三豪华七小对
        return check;
    }
}

module.exports = ZZHuLogin;
