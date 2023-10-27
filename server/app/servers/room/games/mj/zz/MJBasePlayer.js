/**
 *  创建者： THB
 *  日期：2020/1/3
 */
const BasePlayer = require('../BasePlayer');
const MJOperatorData = require('./MJOperatorData');
const mjConst = require('./mjConst');
const mjCardsMath = require('./mjCardsMath');
const mjEvent = require('./mjEvent');

class MJBasePlayer extends BasePlayer{
    constructor(main) {
        super(main);
        this.huLogin = main.huLogin;

        this.holds = [];  //玩家手牌
        this.holdsDic = new Array(27).fill(0); //手牌字典,方便查找每张牌的数量
        this.uid = 0;     //uid
        this.seatId = 0;  //坐位号
        this.isTrusteeship = false;  //托管
        this.folds = []; //已经打出的牌
        this.score = 0;  //玩家分数

        this.chow = []; // 0x1100=左吃，0x1200=中吃，0x1300=右吃
        this.pong = []; // 0x2000碰，最后两位为麻将牌，最前面一位是操作类型
        this.kong = []; // 0x3100=明杠(碰杠s)，0x3200=暗杠，0x3300=放杠, 最后两位为麻将牌，最前面一位是操作类型，第二位是杠类型
        this.hu = [];   // 0x9000
        this.otherPlayer = undefined;  // 让自己触发吃、碰、杠、胡操作的玩家对象，如果是自摸，暗杠，明杠则此对象为空
        this.robKongHu = false;        // 抢杠胡

        this.disPong = {};     //保存自己碰了的牌, 用于快速查询碰杠
        this.disOperator = []; //保存吃碰杠的牌
        this.isDrawcard = true;  //是否需要摸牌,false=不需要，true=需要; 如果碰牌之后轮到此玩家操作，则此玩家不需要摸牌

        //胡牌详情
        this.huInfo = {
            zm: false, //自摸
            types: []  //胡的类型
        };
        /**
         * 玩家操作将记录为一个对象
         * @type {MJOperatorData}
         * */
        this.recordOperator = undefined;

        this.initEvent();
    }

    initEvent() {
        // 打出一张牌
        this.on(mjEvent.discard, this.onDiscard.bind(this));
        // 碰
        this.on(mjEvent.pong, this.onPong.bind(this));
        // 杠
        this.on(mjEvent.kong, this.onKong.bind(this));
        // 胡
        this.on(mjEvent.hu, this.onHu.bind(this));
        // 过
        this.on(mjEvent.pass, this.onPass.bind(this));
    }

    onDiscard(value){
        console.log("打出的牌:"+value);
        if (this.main.turn !== this.seatId  //1. 必须是自己操作才可以出牌
            || this.main.recordDiscard      //2. 已经出过牌，防止重复发起请求
            || this.isOperator()) {         //3. 可以杠、胡，则必须等待操作完成才能出牌
            return;
        }

        if (!this.removeHolds(value)) {
            return;
        }
        console.log(this.holds);
        this.main.recordDiscard = {uid: this.uid, card: value};
        this.folds.push(value);
        this.sendAll(mjEvent.discard, [this.uid, value]);
        this.main.updateOperator(this, value);
    }

    onPong(id){
        let data = this.pong[id];
        console.log("碰：" + id + "; " + data);
        if(data){
            this.recordOperator = new MJOperatorData(data);
            this.deleteOperator();
            this.send(mjEvent.hideOperator, 1);  //通知客户端，隐藏操作
            this.main.operatorEnd();               //操作完成需要判断是否还有其它玩家也在操作
            this.deleteOtherPlayer();
        }
    }

    onKong(id){
        let data = this.kong[id];
        console.log("杠：" + id + "; " + data);
        if(data){
            this.recordOperator = new MJOperatorData(data);
            console.log(this.recordOperator);
            this.deleteOperator();
            this.send(mjEvent.hideOperator, 1);
            this.main.operatorEnd();
            this.deleteOtherPlayer();
        }
    }

    onHu(id){
        let data = this.hu[id];
        console.log("胡：" + id + "; " + data);
        if(data) {
            this.recordOperator = new MJOperatorData(data);
            this.deleteOperator();
            this.send(mjEvent.hideOperator, 1);
            this.main.operatorEnd();
            this.deleteOtherPlayer();
        }
    }

    onPass(){
        //有操作才能过
        if (!this.isOperator()) {
            return;
        }
        this.pong = [];
        this.kong = [];
        this.hu = [];
        this.recordOperator = undefined;
        this.send(mjEvent.hideOperator, 1);
        this.main.operatorEnd();
    }

    /**
     * 增加一张麻将牌
     * @param value
     */
    addHolds(value) {
        this.holds.push(value);
        this.holdsDic[value]++;
    }

    /**
     * 移除一张牌
     * @param value  需要移除的牌
     * @param count  删除数量
     * @returns {boolean} true=成功，false=失败
     */
    removeHolds(value, count) {
        count = count || 1;
        if (this.holdsDic[value] >= count) {
            this.holdsDic[value] -= count;
            this.holds.remove(value, count);
            return true;
        }
        return false;
    }

    /**
     * 执行碰杠胡
     */
    implementOperator() {
        switch (this.recordOperator.category) {
            case 1:
                break;
            case 2:  // 碰
                this.implementPong();
                break;
            case 3:  // 杠
                this.implementKong();
                break;
            case 9:  // 胡
                this.implementHu();
                break;
        }
    }

    //执行碰
    implementPong() {
        let value = this.recordOperator.value;
        let data = this.recordOperator.data;
        this.removeHolds(value, 2);
        this.disOperator.push(data);
        this.disPong[value] = true;
        this.otherPlayer.folds.pop();
        this.sendAll(mjEvent.pong, [this.uid, data]);
        this.isDrawcard = false;

        console.log("碰成功：" + this.holds);
        console.log(this.disOperator);
    }

    //执行杠
    implementKong() {
        switch (this.recordOperator.operatorType) {
            case mjConst.SHOWING_KONG:  // 明杠
                for (let i = 0; i < this.disOperator.length; ++i) {
                    let value = mjCardsMath.parseValue(this.disOperator[i]);
                    //找出碰的那张牌
                    if (this.recordOperator.value === value) {
                        this.removeHolds(value);
                        this.disOperator[i] = this.recordOperator.data;
                        delete this.disPong[value];  //删除碰
                        this.isDrawcard = true;      //杠牌之后需要摸牌
                        this.sendAll(mjEvent.kong, [this.uid, this.recordOperator.data]);
                        break;
                    }
                }
                break;
            case mjConst.HIDDEN_KONG:  // 暗杠
            case mjConst.RELEASE_KONG:  // 放杠
                // 暗杠删除4张，放杠删除3张
                if(this.recordOperator.operatorType === mjConst.HIDDEN_KONG){
                    this.removeHolds(this.recordOperator.value, 4)
                } else { //放杠，删除自己的三张牌，删除别人打出的牌
                    this.removeHolds(this.recordOperator.value, 3);
                    this.otherPlayer.folds.pop();
                }
                this.disOperator.push(this.recordOperator.data);
                this.sendAll(mjEvent.kong, [this.uid, this.recordOperator.data]);
                this.isDrawcard = true;
                break;
        }
        console.log("杠成功：" + this.holds);
        console.log(this.disOperator);
    }

    //执行胡
    implementHu() {
        if(!this.otherPlayer){
            this.huInfo.zm = true;
        } else if(this.robKongHu){
            this.huInfo.types.push(mjConst.HU_QIANG_GANG_HU);
        }

        //保存胡牌玩家与放炮玩家，自摸无放炮玩家
        this.main.huPlayers.push(this);
        this.main.paoPlayer = this.otherPlayer;

        //调用main的over函数，计算结果
        this.main.over();
    }

    /**
     * 更新碰
     * @param value
     * @param otherPlayer  出牌玩家
     */
    updatePong(value, otherPlayer) {
        if (this.holdsDic[value] >= 2) {
            this.pong.push(0x2000 + value);
            this.otherPlayer = otherPlayer;
        }
    }

    /**
     * 更新杠
     * @param value
     * @param type 1=明杠，2=暗杠，3=放杠
     * @param otherPlayer 出牌玩家
     */
    updateKong(value, type, otherPlayer) {
        switch (type) {
            case 1:
                for(let key in this.disPong){
                    if(this.holdsDic[key] === 1){
                        this.kong.push(0x3100 + parseInt(key));
                    }
                }
                break;
            case 2:
                this.holdsDic.forEach((count, i) => {
                    if(count === 4){
                        this.kong.push(0x3200 + i);
                    }
                });
                break;
            case 3:
                if (this.holdsDic[value] === 3) {
                    this.kong.push(0x3300 + value);
                    this.otherPlayer = otherPlayer;
                }
                break;
        }
    }

    /**
     * 更新胡
     * @param value 打出的牌,省略则说明自己有牌
     */
    updateHu(value) {}

    /**
     * 返回优先级最高的操作
     */
    getMaxOperator(){
        if(this.hu.length > 0){
            return 9;
        }

        if (this.kong.length > 0){
            return 3;
        }

        if(this.pong.length > 0){
            return 2;
        }

        if (this.chow.length > 0)
            return 1;
    }

    /**
     * 删除所有操作
     */
    deleteOperator(){
        this.chow = [];
        this.pong = [];
        this.kong = [];
        this.hu = [];
    }

    deleteOtherPlayer(){
        this.otherPlayer = undefined;
        this.robKongHu = false;
    }

    /**
     * 判断是否有操作
     * @returns {boolean}
     */
    isOperator() {
        return (this.pong.length > 0 || this.kong.length > 0 || this.hu.length > 0 || this.chow.length > 0);
    }

    /**
     * 发送操作项给客户端
     */
    sendOperator() {
        let operator = {};
        if(this.chow.length > 0)
            operator.chow = this.chow;
        if (this.pong.length > 0)
            operator.pong = this.pong;
        if (this.kong.length > 0)
            operator.kong = this.kong;
        if (this.hu.length > 0)
            operator.hu = this.hu;
        console.log("操作：", operator);
        console.log("牌数量:" + this.holdsDic);
        if (Object.keys(operator).length > 0) {
            this.send(mjEvent.operator, operator);
            return true;
        }
    }

    /**
     * 客户端需要的全部数据
     * 玩家中途加入房间
     *@param isSelf true:请求自己的数据，false:请求其它玩家的数据
     * @returns
     */
    dataRequiredByClient(isSelf) {
        let data = {
            holds: isSelf ? this.holds : this.holds.length, //如果是自己请求，返回手牌，否则返回牌的数量
            seatId: this.seatId,
            folds: this.folds,
            disOperator: this.disOperator,
        };

        //当请求自己的数据时需要把自己的操作项发送给客户端
        if(isSelf){
            data.holds = this.holds;
            data.operator = {
                pong: this.pong,
                kong: this.kong,
                hu: this.hu
            };
        } else {
            data.holds = this.holds.length;
        }

        return data;
    }
}

module.exports = MJBasePlayer;