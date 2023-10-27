/** * Created by apple on 2018/1/16. */const BasePlayer = require('../BasePlayer');const alg = require('../棋牌算法/13shuiAlgorithm');const Status = require('../Status').shisanshui;const Event = require('./Event');//黑桃 = spades//红桃 = hearts//梅花 = clubs//方块 = diamonds  在国外叫钻石牌class Player extends BasePlayer {    constructor(main) {        super(main);        this.seatId = 0;        this.isTrusteeship = false;        this.winScore = 0; // 本局赢分，不包括喜分        this.isAuto = false; //自动出牌        this.status = 0;// 0初始状态，1 已抢庄 2 已下注 3 已出牌        this.hasMaCard = false;// 是否有马牌        this.recommendations = []; // 推荐牌序列        this.bets = []; // 保存下注列表        this.bet = 0;        this.chuPaiPattern = []; // 出牌牌型        this.hasMaCard = false;// 手牌中是否有马牌        this.autoCards = null;// 自动出牌的牌组合        this.specialPattern = null;        this.patternCards = null;        this.roundWinFen = 0;        this.roundWinFenExt = 0;        this.rest = [];        this.initEvent();    }    initEvent() {        this.on('setMultiple', this.banker);        this.on('bet', this.setBet);        this.on('chupai', this.chupai);        this.on('biPaiOver', this.biPaiOver);    }    setTrusteeship(isTrusteeship) {        this.isTrusteeship = isTrusteeship;    }    /**     * 是否为庄家     * @return {boolean}     */    isBanker(){        return (parseInt(this._main.zuid) === parseInt(this.uid));    }    /**     * 抢庄     */    banker(bankerParam){        if (isNaN(parseInt(bankerParam))) {            console.log('<banker> 抢庄参数错误', bankerParam);            return;        }        let b = parseInt(bankerParam);        // console.log('<banker> ', bankerParam);        if(this._main.hasBanker && this.status == 0 && this._main.isStatus(Status.WAIT_BANKER)){            // this._rob = parseInt(id);            this.isRob = b;            this.status = 1;            // 有人抢庄则结束抢庄状态            this.sendAll(Event.rob, [this.uid, b]);            this._main.bankerEnd(b ? this.uid : null);        }    }    /**     * 下注     * @param id     */    setBet(id){        if(this._main.hasBanker && this.status == 1 && this._main.isStatus(Status.WAIT_BETS) && !this.isBanker()){            id = parseInt(id);            //判断id是否越界            if(isNaN(id) || (id < 0 || id >= this.bets.length)){                id = 0            }            //可以推注            // if(this.canTuizhu && id === 2){            //     this.isTuiZhu = true; //如果为2则是推注            // }            this.bet = this.bets[id];            // this.isBet = true;            this.status = 2;            this.sendAll(Event.bet, [this.uid, this.bet]);            //下注结束            this._main.betEnd();        }    }    /**     * 发送牌到前端     */    sendHolds() {        // todo: 获取推荐类型        // this.recommendations = alg.getRecommendations(this.holds, this.main.algRule);        // this.send('holds', this.holds);        this.send(Event.holds, {            holds: this.holds,            specialPattern: this.specialPattern,            hasSpecial: this.specialPattern ? true : false,            renShu: this.main.uids.length        });        // todo: 设置定时器，超时自动选择推荐类型的第一个出牌        // this.setTimeout(() => {        //     if (Array.isArray(this.recommendations) && this.recommendations.length) {        //         let cardsList = [];        //         this.recommendations[0].forEach((pattern) => {        //             cardsList.push(pattern.cards.concat());        //         });        //         this.chupai(cardsList);        //     }        // });    }    /**     * 玩家出牌     * @param cards     */    chupai(cardsList) {        if (this.main.status != Status.CHU_PAI) {            console.log(`<chupai> status: ${this.main.status}`);            return;        }        if (this.status == 3) {            console.log(`<chupai> 已经出过牌的不允许再出牌 status: ${this.status}`);            return;        }        if (this.main.hasBanker && this.status != 2) {            console.log(`<chupai> 抢庄模式玩家当前状态不允许出牌: ${this.status}`);            return;        }        if (!this.main.hasBanker && this.status != 0) {            console.log(`<chupai> 非抢庄模式玩家当前状态不允许出牌: ${this.status}`);            return;        }        if (!cardsList || !Array.isArray(cardsList)) {            console.log(`<chupai> 参数错误 cardsList: ${cardsList}`);            this.send(Event.cannotOut);            return;        }        // 判断出的牌是不是都在手牌中        for (let cards of cardsList) {            for (let c of cards) {                if (this.holds.indexOf(c) == -1) {                    console.log(`<chupai> 不存在的牌 cardsList: ${cardsList} card: ${c}`);                    this.send(Event.cannotOut);                    return;                }            }        }        if (cardsList.length == 1) {            //特殊牌            let special = alg.checkPattern(cardsList[0], 0, this.main.algRule);            if (special) {                this.chuPaiPattern.push(special);                special.uid = this.uid;                special.seatId = this.seatId;                this.main.teShuPais.push(special);                // return true;            } else {                //不是特殊牌,理牌失败                console.log('<chupai> 不是特殊牌');                this.send(Event.cannotOut);                return;            }        } else {            //普通牌            if (cardsList.length != 3) {                console.log('<chupai> 出牌不符合规定');                this.send(Event.cannotOut);                return;            }            let paiType_tou = alg.checkPattern(cardsList[0], 1, this.main.algRule);            let paiType_zhong = alg.checkPattern(cardsList[1], 2, this.main.algRule);            let paiType_wei = alg.checkPattern(cardsList[2], 3, this.main.algRule);            if (!paiType_tou || !paiType_zhong || !paiType_wei) {                //理牌失败                this.send(Event.cannotOut);                console.log('<chupai> 理牌失败', paiType_tou, paiType_zhong, paiType_wei);                return;            }            if (paiType_tou.value > paiType_zhong.value || paiType_zhong.value > paiType_wei.value) {                //倒水了                this.send(Event.cannotOut, (paiType_tou.value > paiType_zhong.value) ? 1 : 2);                console.log('<chupai> 倒水了', paiType_tou, paiType_zhong, paiType_wei);                return;            } else {                this.chuPaiPattern.push(paiType_tou, paiType_zhong, paiType_wei);                paiType_tou.uid = this.uid;                paiType_tou.seatId = this.seatId;                this.main.touDaoPais.push(paiType_tou);                paiType_zhong.uid = this.uid;                paiType_zhong.seatId = this.seatId;                this.main.zhongDaoPais.push(paiType_zhong);                paiType_wei.uid = this.uid;                paiType_wei.seatId = this.seatId;                this.main.weiDaoPais.push(paiType_wei);                // return true;            }        }        this.status = 3; // 已经出牌        this.patternCards = cardsList.concat();        this.main.foldsList.push({uid: this.uid, chuPaiPattern: this.chuPaiPattern});        console.log('<chupai> cards: ' ,cardsList);        this.sendAll(Event.chupai, {uid: this.uid});        // this.send("chuPaiPattern", this.chuPaiPattern);        this.main.doBiPai();    }    biPaiOver() {        this.main.calculateResult();    }    /**     * 发送给自己     */    getInfos() {        let data = {};        data.holds = (this._main.status == 3 ? this.holds : []);        data.status = this.status;        data.chuPaiPattern = this.chuPaiPattern;        // todo: 出牌之后才有isSpecial属性        data.isSpecial = (this.chuPaiPattern && this.chuPaiPattern.length == 1) ? true : false;        data.hasSpecial = this.specialPattern ? true : false;        data.specialPattern = this.specialPattern;        // data.isRob = (this.status == 2 && this._main.robbers.indexOf(this.uid) > -1) ? 1 : 0;        data.isRob = this.isRob;        data.bet = this.bet;        data.bets = this.bets;        return data;    }    /**     * 发送给其它玩家的信息     */    getOtherInfos() {        return {            status: this.status,// todo: 根据status判断展示给其他玩家的信息            isSpecial: (this.chuPaiPattern && this.chuPaiPattern.length == 1) ? true : false,            hasSpecial: this.specialPattern ? true : false,            isRob: this.isRob,            bet: this.bet        };    }}module.exports = Player;