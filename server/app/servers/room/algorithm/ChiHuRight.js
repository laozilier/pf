
const alg = require("./mahjonghn");

class ChiHuRight {
    constructor() {
        this.rights = {};
    }

     /**
     * 添加操作
     * @param seatId
     * @param opt
     * @param pai
     */
    push(seatId, opt, pai, isset, pai_mask) {
        //todo 针对特定操作的牌的操作掩码（主要是小胡情况）
        if (pai_mask === undefined)
        {
            pai_mask = 0;
        }

        let right = this.rights[seatId];
        if ((isset !== undefined && isset) || right === undefined)
        {
            this.rights[seatId] = {
                opt: opt,                   //todo 注意，在小胡操作时，opt属性值不改变，而是改变 actionPai 的mask值 响应操作
                pai: pai,
                actionPai: {},
                isResponse: false,         //todo 响应的动作，如果过，则是直接删除该动作
                responsePai: 0              //todo 响应的动作牌
            };
            this.rights[seatId].actionPai[pai] = {pai: pai, act: opt, mask: pai_mask};
        }
        else
        {
            right.opt |= opt;

            let action = this.rights[seatId].actionPai[pai];
            if (action === undefined)
            {
                this.rights[seatId].actionPai[pai] = {pai: pai, act: opt, mask: pai_mask};
            }
            else
            {
                this.rights[seatId].actionPai[pai].act = this.rights[seatId].actionPai[pai].act | opt;
                //todo 添加对特定小胡型牌操作多种小胡类型的合并
                this.rights[seatId].actionPai[pai].mask = this.rights[seatId].actionPai[pai].mask | pai_mask;
            }

            right.pai = pai;
            //right.opt_list.push({opt: opt, pai: pai});
            //right.isResponse = false;
            this.rights[seatId] = right;
        }
    }

    /**
     * 比较操作权限的优先级
     * @param a
     * @param b
     * @param prevSeatId
     * @returns {boolean}
     */
    sompareFun(a, b, prevSeatId){
        let aa = alg.GetUserActionRank(this.rights[a].opt);
        let bb = alg.GetUserActionRank(this.rights[b].opt);

        //todo 分数高优先
        if (bb > aa)
        {
            return true;
        }
        else if (bb === aa)
        { //todo 分数相同，座位优先
            //都在该座位下手
            if ((b > prevSeatId) && (a > prevSeatId))
            {
                //优先出牌次序
                return (b < a);
            }
            else if (b >= prevSeatId && a < prevSeatId)     //(b > prevSeatId && a <= prevSeatId)
            {//todo b在当前或下手， a是当前或在上手，优先 b
                return true;
            }
            else if (b < prevSeatId && a >= prevSeatId)
            {
                //todo b在上手， a在当前或下手， 优先 a
                return false;
            }
            else if (b < prevSeatId && a < prevSeatId)
            {
                //todo 都在上手
                return (b < a);
            }
        }
        else
        {
            return false;
        }
    }

    /**
     * 使用指定的操作，即对指定的操作做出响应
     *
     * @param seatId
     * @param opt
     * @param pai
     * @param prevSeatId
     * @returns {boolean}
     */
    use(seatId, action, pai, prevSeatId, is_mul){
        let self = this;
        if (is_mul == null || is_mul === undefined)
        {
            is_mul = false;
        }
        /**
         * 检查操作的有效性
         * @type {string[]}
         */
        let seatOp = self.rights[seatId];
        if (seatOp === undefined)
        {
            console.log("操作有效性检查，您(", seatId , ")没有操作权限，当前操作（", action, "）牌（", pai, "）无效");
            return false;
        }
        else
        {
            //todo 是否已经响应
            if (seatOp.isResponse !== undefined && seatOp.isResponse === true)
            {
                console.log("操作有效性检查，您(", seatId , ") 有操作（", seatOp.opt, "）牌（", seatOp.responsePai, "）在操作等待中，不能再进行（", action,"）操作， （", pai,"）操作");
            }
            else {

                //todo 过操作
                if (action === alg.mj_wik_action.WIK_NULL) {
                    delete this.rights[seatId];
                    if (false === this.hasRight()) {
                        return true;
                    }
                }
                else {
                    if ((seatOp.opt & action) === 0) {
                        console.log("操作有效性检查，您(", seatId, ")当前操作（", action, "）牌（", pai, "）无效");
                        return false;
                    }

                    //todo 修改需要执行的操作
                    seatOp.opt = action;
                    if (pai === 0 && action === alg.mj_wik_action.WIK_CHI_HU)
                    {
                        seatOp.responsePai = self.get_hu_pai(seatId)
                    }
                    else {
                        seatOp.responsePai = pai;
                    }
                    seatOp.isResponse = true;
                }
            }
        }

        let sortedObjKeys = Object.keys(self.rights).sort(function (a, b) {
            return self.sompareFun(a, b, prevSeatId);
        });

        //第一个是有先级最高的操作
        //检查第一个操作位是否为我，否则修改我的操作位
        let maxId = parseInt(sortedObjKeys[0]);

        let curAction = self.rights[maxId];
        if (curAction === undefined)
        {
            console.log("操作有效性检查，您(", seatId , ")当前操作（", action, "）牌（", pai, "）出发座位（", maxId,"）的操作无效");
            return false;
        }

        if (maxId === seatId)
        {
            return true;
            //需要检查操作的有效xiang
        }
        else {
            //todo 报听情况不分座位优先级
            if ((action === alg.mj_wik_action.WIK_BAOTING) || (is_mul && ((curAction.opt & alg.mj_wik_action.WIK_CHI_HU) === alg.mj_wik_action.WIK_CHI_HU )) )
            {
                return true;
            }
        }

        return false;
    }

    /**
     * 获得第一个动作玩家
     * @returns {number}
     */
    getFirstPlayerSeatId(prevSeatId){
        let self = this;
        let rightArr = Object.keys(this.rights);
        if (rightArr.length === 0)
        {
            //没有响应操作
            return -1;
        }

        let sortedObjKeys = Object.keys(self.rights).sort(function (a, b) {
            return self.sompareFun(a, b, prevSeatId);
        });

        //第一个是有先级最高的操作
        //检查第一个操作位是否为我，否则修改我的操作位
        let maxId = parseInt(sortedObjKeys[0]);

        //console.log("maxId: ", maxId, "rights: ", this.rights, "sortObjKey: ", sortedObjKeys);
        //let seatOp = this.rights[maxId];
        return maxId;
    }

    /**
     * 取得座位胡的牌
     * @param seatId
     * @returns {*}
     */
    get_hu_pai(seatId)
    {
        let rightArr = Object.keys(this.rights);
        if (rightArr.length === 0)
        {
            //没有响应操作
            return 0;
        }

        let action = this.rights[seatId];
        if (action === undefined) return 0;

        for (let key in action.actionPai)
        {
            let item = action.actionPai[key];
            if ((item.act & alg.mj_wik_action.WIK_CHI_HU) > 0)
            {
                return item.pai;
            }
        }

        return 0;
    }

    /**
     * 获得座位动作
     * @param seatId
     * @returns {*}
     */
    getSeatAction(seatId)
    {
        let rightArr = Object.keys(this.rights);
        if (rightArr.length === 0)
        {
            //没有响应操作
            return {};
        }

        return this.rights[seatId];
    }

    /**
     * 取消指定玩家的操作
     * @param seatId
     * @returns {number}
     */
    cancelUseOpt(seatId){
        let rightArr = Object.keys(this.rights);
        if (rightArr.length === 0)
        {
            //没有响应操作
            return -1;
        }

        let seatOp = this.rights[seatId];
        if (seatOp !== undefined)
        {
            delete this.rights[seatId];
        }
        return seatId;
    }

    /**
     * 清空对象
     */
    reset(){
        this.rights = {};
    }

    /**
     * 是否有权限
     * @returns {boolean}
     * @constructor
     */
    hasRight()
    {
        let nums = Object.keys(this.rights).length;

        return (nums > 0);
    }

    /**
     * 检查是否存在的动作，胡、吃、杠、碰、过
     * @param right
     * @param action_mask
     * @returns {number} 返回操作的牌
     */
    check_right(right, action_mask){
        switch (action_mask)
        {
            case alg.right_type.chi:
                //if (right.opt_list.length > 0)
                {
                    for (let key in right.actionPai)
                    {
                        let item = right.actionPai[key];
                    //for (let i = 0; i < right.opt_list.length; ++i)
                    //{
                    //    let item = right.opt_list[i];
                        if ((item.act & (alg.mj_wik_action.WIK_LEFT | alg.mj_wik_action.WIK_RIGHT | alg.mj_wik_action.WIK_CENTER )) > 0)
                        {
                            return item.pai;
                        }
                    }
                }
                break;
            case alg.right_type.chu:
                break;
            case alg.right_type.hu:
                //if (right.opt_list.length > 0)
                {
                    //for (let i = 0; i < right.opt_list.length; ++i)
                    //{
                    //    let item = right.opt_list[i];
                    for (let key in right.actionPai)
                    {
                        let item = right.actionPai[key];
                        if ((item.act & alg.mj_wik_action.WIK_CHI_HU) > 0)
                        {
                            return item.pai;
                        }
                    }
                }
                break;
            case alg.right_type.peng:
                //if (right.opt_list.length > 0)
                {
                    //for (let i = 0; i < right.opt_list.length; ++i)
                    //{
                    //    let item = right.opt_list[i];
                    for (let key in right.actionPai)
                    {
                        let item = right.actionPai[key];
                        if ((item.act & alg.mj_wik_action.WIK_PENG) === alg.mj_wik_action.WIK_PENG)
                        {
                            return item.pai;
                        }
                    }
                }
                break;
            case alg.right_type.gang:
                //if (right.opt_list.length > 0)
                {
                    //for (let i = 0; i < right.opt_list.length; ++i)
                    //{
                    //    let item = right.opt_list[i];
                    for (let key in right.actionPai)
                    {
                        let item = right.actionPai[key];
                        if ((item.act & (alg.mj_wik_action.WIK_ANGANG | alg.mj_wik_action.WIK_MINGGANG | alg.mj_wik_action.WIK_DIANGANG )) > 0)
                        {
                            return item.pai;
                        }
                    }
                }
                break;

        }

        return 0;
    }

    /**
     * 获得可胡牌的座位号列表
     * @returns {Array}
     */
    get_hu_seatIds(){
        let huSeatList = [];
        let self = this;
        let rightArr = Object.keys(this.rights);
        let len = rightArr.length;
        if (len === 0)
        {
            //没有响应操作
            return huSeatList;
        }

        //todo 遍历对象列表，检查可以胡的玩家
        for (let i = 0; i< len; i++)
        {
            let seatId = parseInt(rightArr[i]);
            let action = this.rights[seatId];
            let mask = alg.mj_wik_action.WIK_CHI_HU;
            if ((action.opt & mask) > 0)
            {
                huSeatList.push(seatId);
            }
        }

        return huSeatList;
    }

    /**
     *
     * @param seatId
     * @param xiao_hu_mask
     * @param pai
     */
    useXiaoHu(seatId, xiao_hu_mask, pai, cb) {

        //todo 小胡完成后可能还有其他动作(另外的小胡， 自摸、杠（对于不是自己持牌的操作，不可能有（如：吃，碰））)
        //todo 如果还有其他操作，重新给自己发再发一次( 是否需要？)
        let self = this;
        /**
         * 检查操作的有效性
         * @type {string[]}
         */
        let hasRight = false;
        let hasOtherRight = false;

        let cbAction = self.rights[seatId];
        if (cbAction === undefined)
        {
            console.log("操作有效性检查，您(", seatId , ")没有操作权限，当前操作（", xiao_hu_mask, "）牌（", pai, "）无效");
            cb(hasRight, hasOtherRight);
        }
        else
        {
            //todo 检查是否有小胡操作
            if ((cbAction.opt & alg.mj_wik_action.WIK_XIAO_HU) === alg.mj_wik_action.WIK_XIAO_HU)
            {
                //todo 检查指定的牌是否有小胡操作
                {
                    let itemAction = cbAction.actionPai[pai];
                    if (itemAction !== undefined) {
                        if ((itemAction.act & alg.mj_wik_action.WIK_XIAO_HU) === alg.mj_wik_action.WIK_XIAO_HU) {
                            if ((itemAction.mask & xiao_hu_mask) === xiao_hu_mask) {
                                //todo 去掉当前牌小胡牌的所胡翻型
                                itemAction.mask = itemAction.mask ^ xiao_hu_mask;
                                if (itemAction.mask === 0) {
                                    //todo 如果当前牌所有小胡翻型都使用过，，则去除该牌的小胡权限
                                    itemAction.act = itemAction.act ^ alg.mj_wik_action.WIK_XIAO_HU;
                                }

                                hasRight = true;
                            }
                        }
                    }
                }

                //todo 检查动作列表
                let has_xiaohu = false;
                for (let key in cbAction.actionPai) {
                    let itemAction = cbAction.actionPai[key];
                    if ((itemAction.act & alg.mj_wik_action.WIK_XIAO_HU) === alg.mj_wik_action.WIK_XIAO_HU) {
                        has_xiaohu = true;
                        break;
                    }
                }
                if (false === has_xiaohu)
                {
                    cbAction.opt = cbAction.opt ^ alg.mj_wik_action.WIK_XIAO_HU;
                }

                //todo 如果没有可操作权限了，这里将删除
                if (cbAction.opt === 0)
                {
                    delete this.rights[seatId];
                }
                else
                {
                    hasOtherRight = true;
                }
            }
        }

        cb(hasRight, hasOtherRight);
    }
}

module.exports = ChiHuRight;

//todo 测试
/**
let testHu = function () {
    let right = new ChiHuRight();
    right.push(0, alg.mj_wik_action.WIK_PENG, 25);
    right.push(1, alg.mj_wik_action.WIK_ANGANG, 25);
    //right.push(2, alg.mj_wik_action.WIK_CHI_HU, 25);
    right.push(3, alg.mj_wik_action.WIK_LEFT, 25);
    right.push(4, alg.mj_wik_action.WIK_RIGHT, 25);

    let huList = right.get_hu_seatIds();

    console.log("right", right);
    console.log("right hu list", huList, ", hulist len: ", huList.length);

    let hasHu = huList.length;
    if (hasHu > 0)
    {
        huList.forEach(function(id, idx){
            console.log("chiHuRight HU seat", id, ", idx: ", idx);
        });
    }

};

testHu();
*/