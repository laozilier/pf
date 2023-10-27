/** * Created by apple on 2017/11/1. */let BasePlayer = require('../BasePlayer');const Status = require('../Status').niuniu;const Event = require('../niuniu/nnEvent');class Player extends BasePlayer{    constructor(main, uid){        super(main);        this.uid = uid;        this.holds = new Array(5);  //手持的牌        this.checkPattern = {};       //手上牌的三公值        this.jinhuaPattern = undefined;       //手上牌的金花值        this.bet = 0;               //下注数量        this.score = 0;             //分数        this._rob = 0;              //抢庄倍数        // this.balance = 0;          // 本局进出        this.tuizhu = 0;           //推注的分数,0分不能推注        this.isBet = false;        this.isShowHolds = false; //是否亮牌        this.isRob = false;      //是否抢完庄        this.isTuiZhu = false;   //是否推注        this.anteList = [];       //保存下注列表        this.canTuizhu = false;  //是否可推注        this.timeoutId = -1;        //四张牌的牛数        this.fourCardsValue = 0;        this.initEvent();    }    initEvent(){        this.on(Event.bet, this.setBet);        this.on(Event.showHolds, this.showHolds);        this.on(Event.setMultiple, this.setMultiple);    }    /**     * 设置托管状态     * @param has     */    setTrusteeship(has) {        this.isTrusteeship = has;        // 如果进入托管状态，则判断这一把是否需要自动操作        if(has){            switch (this._main.status){                case Status.WAIT_ROBS_OPEN:                    if(!this.isRob){                        this.setMultiple(0);                    }                    break;                case Status.WAIT_BETS:                    if(!this.isBet){                        this.setBet(0);                    }                    break;                case Status.CUOPAI_ONE:                    if(!this.isShowHolds){                        this.showHolds();                    }                    break;            }        }    }    /**     * 抢庄     */    setMultiple(id){        if(!this.isRob && this._main.isStatus(Status.WAIT_ROBS_OPEN)){            this._rob = parseInt(id);            this.isRob = true;            this.sendAll("rob", [this.uid, id]);            this._main.robEnd();        }    }    /**     * 是否为庄家     * @return {boolean}     */    isBanker(){        return (parseInt(this._main.zuid) === parseInt(this.uid));    }    /**     * 发送给自己     */    getInfo(){        let data = {            isTrusteeship: false        };        switch (this._main.status) {            case Status.WAIT_ROBS_OPEN:                if(this.isRob){                    data.rob = this._rob;                } else {                    data._robs = this._main._robs;                }                data.holds = this.holds.slice(0, 2);                break;            case Status.WAIT_BETS:                //不是庄家                if (!this.isBanker()) {                    if (this.isBet) {                        data.bet = this.bet;                    } else {                        //下注列表                        // data.bets = this.getBets();                        data.bets = this.anteList;                    }                } else {                    //庄家抢的倍数                    data.rob = this._rob;                }                data.holds = this.holds.slice(0, 2);                break;            case Status.CUOPAI_ONE:                if(this.isBanker()){                    data.rob = this._rob;                } else {                    data.bet = this.bet;                }                data.holds = this.holds;                if(this.isShowHolds){                    data.type = [this.checkPattern.pattern];                    if (!!this.jinhuaPattern) {                        data.type.push(this.jinhuaPattern.pattern);                    }                }                break;        }        return data;    }    /**     * 发送给其它玩家的信息     */    getOtherInfo(){        let data = {            holds : 2,            isTrusteeship: false        };        switch (this._main.status) {            case Status.WAIT_ROBS_OPEN:                if(this.isRob){                    data.rob = this._rob;                }                break;            case Status.WAIT_BETS:                if (this.isBanker()) {                    data.rob = this._rob; //庄家倍数                } else if(this.isBet){                    data.bet = this.bet; //闲家注数                }                break;            case Status.CUOPAI_ONE:                if(this.isBanker()){                    data.rob = this._rob;                } else {                    data.bet = this.bet;                }                if(this.isShowHolds) {                    data.holds = this.holds; //牌                    data.type = [this.checkPattern.pattern];                    if (!!this.jinhuaPattern) {                        data.type.push(this.jinhuaPattern.pattern);                    }                } else {                    data.holds = 3;                }                break;        }        return data;    }    /**     * 亮牌     */    showHolds(){        //只有搓牌状态，和未亮牌的情况下才能亮牌        if(!this.isShowHolds && this._main.isStatus(Status.CUOPAI_ONE)){            let type = [this.checkPattern.pattern];            if (!!this.jinhuaPattern) {                type.push(this.jinhuaPattern.pattern);            }            this.sendAll("showHolds", [this.uid, this.holds, {type:type}]);            this.isShowHolds = true;            this._main.showHoldsEnd();        }    }    /**     * 下注     * @param id     */    setBet(id){        //判断id是否越界        if(id === undefined || id < 0 || id >= this.anteList.length){            id = 0        }        if(!this.isBet && this._main.isStatus(Status.WAIT_BETS) && !this.isBanker()){            id = parseInt(id);            //可以推注            if(this.canTuizhu && id === 2){                this.isTuiZhu = true; //如果为2则是推注            }            this.bet = this.anteList[id];            this.isBet = true;            this.sendAll("bet", [this.uid, this.bet]);            //下注结束            this._main.betEnd();        }    }    /**     * 发送四张牌给前端     */    sendHolds2(){        this.send('holds2', this.holds.slice(0,2));    }    /**     * 发送最后一张牌给前端     */    sendHolds1(){        this.send("holds1", {v:this.holds[2]});    }    /**     * 发送所有手牌     */    sendHolds() {        this.send('holds', this.holds);    }    /**     * 推送下注列表     */    sendStartBets(){        this.send("startBet", {bets:this.anteList, uid:this._main.zuid});    }    /**     * 通知前端可以搓牌     */    sendCuoPai(){        if(!this.isShowHolds){            this.send("startCuoPai");        }    }}module.exports = Player;