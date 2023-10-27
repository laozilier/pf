/** * Created by apple on 2017/11/1. */let BasePlayer = require('../../BasePlayer');const nnConst = require('../nnConst');const Event = require('../nnEvent');class Player extends BasePlayer{    constructor(main, uid){        super(main);        this.uid = uid;        this.holds = new Array(5);  //手持的牌        this.holdsValue = {};       //手上牌的值        this.bet = 0;               //下注数量        this.score = 0;             //分数        this._rob = 0;              //抢庄倍数        this.tuizhu = 0;           //推注的分数,0分不能推注        this.isBet = false;        this.isShowHolds = false; //是否亮牌        this.isRob = false;      //是否抢完庄        this.anteList = [];       //保存下注列表        this.timeoutId = -1;        //四张牌的牛数        this.fourCardsValue = 0;        this._isShemen = false;        this.initEvent();    }    initEvent(){        this.on(Event.bet, this.setBet);        this.on(Event.customBet, this.setCustomBet);        this.on(Event.showHolds, this.showHolds);        this.on(Event.setMultiple, this.setMultiple);        this.on(Event.res_dangzhuang, this.res_dangzhuang);        this.on(Event.res_lianzhuang, this.res_lianzhuang);    }    res_dangzhuang(data) {        this.main.res_dangzhuang(this.uid, data);    }    res_lianzhuang(data) {        this.main.res_lianzhuang(this.uid, data);    }    /**     * 设置托管状态     * @param has     */    setTrusteeship(has) {        this.isTrusteeship = has;        // 如果进入托管状态，则判断这一把是否需要自动操作        if(has){            switch (this._main.status){                case nnConst.WAIT_ROBS_OPEN:                    if(!this.isRob){                        this.setMultiple(0);                    }                    break;                case nnConst.WAIT_BETS:                    if(!this.isBet){                        this.setBet(0);                    }                    break;                case nnConst.CUOPAI_ONE:                    if(!this.isShowHolds){                        this.showHolds();                    }                    break;            }        }    }    /**     * 抢庄     */    setMultiple(id){        if(!this.isRob && this._main.isStatus(nnConst.WAIT_ROBS_OPEN)){            this._rob = parseInt(id);            this.isRob = true;            this.sendAll(Event.rob, [this.uid, id]);            this._main.robEnd();        }    }    /**     * 是否为庄家     * @return {boolean}     */    isBanker(){        return (parseInt(this._main.zuid) === parseInt(this.uid));    }    /**     * 发送给自己     */    getInfo(){        let data = {            isTrusteeship: false        };        switch (this._main.status) {            case nnConst.BEGIN:                data.holds = this.holds.slice(0, 4);                break;            case nnConst.WAIT_ROBS_OPEN:                if(this.isRob){                    data.rob = this._rob;                } else {                    data._robs = this._main._robs;                }                break;            case nnConst.WAIT_BETS:                //不是庄家                if (!this.isBanker()) {                    if (this.isBet) {                        data.bet = this.bet;                        data.shemen = this._isShemen;                    } else {                        //下注列表                        // data.bets = this.getBets();                        data.bets = this.anteList;                        data.maxBet = this.maxBet;                    }                } else {                    //庄家抢的倍数                    data.rob = this._rob;                }                if (this.main.mpHolds) {                    data.holds = this.holds.slice(0, 4);                }                break;            case nnConst.CUOPAI_ONE:                if(this.isBanker()){                    data.rob = this._rob;                } else {                    data.bet = this.bet;                    data.shemen = this._isShemen;                }                data.holds = this.holds;                if(this.isShowHolds){                    data.holdsValue = this.holdsValue;                }                break;        }        return data;    }    /**     * 发送给其它玩家的信息     */    getOtherInfo(){        let data = {            holds : 4,            isTrusteeship: false        };        switch (this._main.status) {            case nnConst.WAIT_ROBS_OPEN:                if(this.isRob){                    data.rob = this._rob;                }                break;            case nnConst.WAIT_BETS:                if (this.isBanker()) {                    data.rob = this._rob; //庄家倍数                } else if(this.isBet){                    data.bet = this.bet; //闲家注数                    data.shemen = this._isShemen;                }                break;            case nnConst.CUOPAI_ONE:                if(this.isBanker()){                    data.rob = this._rob;                } else {                    data.bet = this.bet;                    data.shemen = this._isShemen;                }                if(this.isShowHolds) {                    data.holds = this.holds; //牌                    data.holdsValue = this.holdsValue;  //结果                } else {                    data.holds = 5;                }                break;        }        return data;    }    /**     * 亮牌     */    showHolds(){        //只有搓牌状态，和未亮牌的情况下才能亮牌        if(!this.isShowHolds && this._main.isStatus(nnConst.CUOPAI_ONE)){            this.sendAll(Event.showHolds, [this.uid, this.holds, this.holdsValue]);            this.isShowHolds = true;            this._main.showHoldsEnd();        }    }    /**     * 下注     * @param id     */    setBet(id){        //判断id是否越界        if(id === undefined || id < 0 || id >= this.anteList.length){            id = 0        }        if(!this.isBet && this._main.isStatus(nnConst.WAIT_BETS) && !this.isBanker()){            id = parseInt(id);            if(id === 2) {                this._isShemen = true; //如果为2则是射门            }            this.bet = this.anteList[id];            this.isBet = true;            this.sendAll(Event.bet, [this.uid, this.bet, this._isShemen]);            //下注结束            this._main.betEnd();        }    }    setCustomBet(bet) {        if(this.isBet || !this._main.isStatus(nnConst.WAIT_BETS) || this.isBanker()){            return;        }        if (isNaN(bet)) {            return;        }        if (bet > this.maxBet) {            return;        }        if (!!this.anteList[2]) {            if (bet >= this.anteList[2]) {                this._isShemen = true;            }        }        this.bet = bet;        this.isBet = true;        this.sendAll(Event.bet, [this.uid, this.bet, this._isShemen]);        //下注结束        this._main.betEnd();    }    /**     * 发送牌给前端     */    sendHolds5(){        this.send(Event.holds5, this.holds);    }    /**     * 发送四张牌给前端     */    sendHolds4(){        this.send(Event.holds4, this.holds.slice(0,4));    }    /**     * 发送最后一张牌给前端     */    sendHolds1(){        this.send(Event.holds1, {v:this.holds[4]});    }    /**     * 推送下注列表     */    sendStartBets(guodi) {        /** 射门规则 锅底1/4 必须大于最小注 去掉100以内的多余的 **/        this.maxBet = 0;        let smBet = Math.ceil(guodi/4);        let first = this.anteList[0];        if (smBet > first) {            smBet -= smBet%100;            this.anteList.push(smBet);            /** 自定义下注规则 最大为射门的注值 */            this.maxBet = smBet;        }        this.send(Event.startBet, {            bets:this.anteList,            uid:this._main.zuid,            maxBet: this.maxBet        });    }}module.exports = Player;