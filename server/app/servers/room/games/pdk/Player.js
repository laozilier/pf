/**
 * Created by apple on 2018/1/16.
 */
const BasePlayer = require('../BasePlayer');
const alg = require('../棋牌算法/pdkAlgorithm');

//黑桃 = spades
//红桃 = hearts
//梅花 = clubs
//方块 = diamonds  在国外叫钻石牌


class Player extends BasePlayer {
    constructor(main) {
        super(main);
        this.holds = [];
        this.counts = {}; //每张牌的数量
        this.uid = 0;
        this.seatId = 0;
        this.isTrusteeship = false;

        this.isBomb = []; //当前手牌中是否有炸弹

        this.folds = []; //已经打出的牌

        this.score = 0; //玩家分数

        this.halfwayScore = 0;  //中途分数，如炸弹得分

        this.isHas = false; //是否有黑桃三

        this.isHearts10 = false; //是否有红桃十

        /***
         * 防作弊
         */
        this.isAntiCheating = false;

        this.initEvent();
    }


    initEvent() {
        this.on('chupai', this.chupai);
        this.on('qieCard', this.qieCard);
    }

    setTrusteeship(isTrusteeship) {
        if (isTrusteeship == this.isTrusteeship) {
            return;
        }

        this.isTrusteeship = isTrusteeship;
        if(this.uid === this._main.uids[this._main.turn]) {
            this._main.startTimeout(this.uid);
        }
    }

    qieCard(index){
        this._main.startQie(index);
    }

    /**
     * 发送牌到前端
     */
    sendHolds() {
        this.send('holds', this.holds);
    }

    /**
     * 计算每张牌的数量
     */
    count() {
        this.holds.forEach((el) => {
            let v = alg.val(el);
            if (this.counts[v] === undefined) {
                this.counts[v] = 1;
            } else {
                this.counts[v]++;
            }
            /** 2018.4.11 修改 保存炸弹牌 **/
            if (this.counts[v] === 4) {
                this.isBomb.push(v);
            }
            /**  2018.4.16修改  **/
            if(el === 35){
                this.isHearts10 = true;
            }
            /**  2018.4.23修改  **/
            if(el === 41){
                this.isHas = true;
            }
        }, this);
    }

    /***
     *     是否拆了炸弹   2018.4.11 添加
     * @param {Object} obj 选中的牌
     * @returns {boolean}  true 表示拆了炸弹，反之则反
     */
    isSplitBomb(obj) {
        if (obj.type === 4) {
            return false;
        }
        for (let i = 0; i < obj.cards.length; ++i) {
            let a = obj.cards[i];
            if(!Array.isArray(a)){
                let value = a%13+1;
                if (this.isBomb.indexOf(value) !== -1) {
                    return true;
                }
            } else {
                for (let j = 0; j < a.length; ++j) {
                    let b = a[j];
                    if(!Array.isArray(b)){
                        let value = b%13+1;
                        if (this.isBomb.indexOf(value) !== -1) {
                            return true;
                        }
                    } else {
                        for (let k = 0; k < b.length; ++k) {
                            let value = b[k]%13+1;
                            if (this.isBomb.indexOf(value) !== -1) {
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * 计算炸弹分
     */
    bombReduceScore(){

    }

    /**
     * 获取一手比传入牌型更大的牌
     */
    getGreaterCards(typeObj){
        let getArray = [0, alg.getType1, alg.getType2, alg.getType3, alg.getType4, alg.getType5, alg.getType6, alg.getType7,
            alg.getType8, alg.getType9];
        let cards = getArray[typeObj.type].apply(alg, [typeObj, this.holds, this.counts]);

        //如果找不到更大的牌，则查找炸弹,如果拆了炸弹,
        if(typeObj.type !== 4 && cards.length === 0){
            cards = [];
            let keys = Object.keys(this.counts);
            keys = alg.sort(keys);
            for(let i = 0; i < keys.length; ++i){
                let val = keys[i];
                if(this.counts[val] === 4){
                    for(let j = 0; j < this.holds.length; ++j){
                        let el = this.holds[j];
                        if(alg.val(el) === parseInt(val))
                            cards.push(el);
                        if(cards.length === 4){
                            return cards;
                        }
                    }
                }
            }
        }

        return cards;
    }

    /**
     * 获取最大的单张牌
     * 如果下家报单，则出最大的牌
     */
    getMaxCards(){
        let keys = Object.keys(this.counts);
        let cards = [];
        keys = alg.sort(keys);
        for(let i = keys.length - 1; i >= 0; --i){
            let val = parseInt(keys[i]);  //牌的面值
            let num = this.counts[val];  //牌的数量
            //如果最大牌是一个炸弹，则直接出炸弹
            if(num === 4 && cards.length === 0){
                //保存一手炸弹
                this.holds.forEach((el) => {
                    if(alg.val(el) === val){
                        cards.push(el);
                    }
                });
                return cards;
            }
            for(let i = 0; i < this.holds.length; ++i){
                let el = this.holds[i];
                if(alg.val(el) === val){
                    return [el];
                }
            }
        }
        return cards;
    }

    /**
     * 获取一张当前最小的牌型
     * 如果那张牌是炸弹，则不返回
     */
    getMinCards(){
        let keys = Object.keys(this.counts);
        let cards = [];
        keys = alg.sort(keys);
        for(let i = 0; i < keys.length; ++i){
            let val = parseInt(keys[i]);  //牌的面值
            let num = this.counts[val];  //牌的数量
            if(num === 4 && cards.length === 0){
                //保存一手炸弹
                this.holds.forEach((el) => {
                    if(alg.val(el) === val){
                        cards.push(el);
                    }
                });
                continue;
            }
            if(num === 0){
                continue;
            }
            for(let i = 0; i < this.holds.length; ++i){
                let el = this.holds[i];
                if(alg.val(el) === val){
                    return [el];
                }
            }
        }
        return cards;
    }

    /**
     * 判断手牌是否包含打出的牌
     * @param {*} cards 
     */
    hasCards(cards) {
        if (!Array.isArray(cards) || cards.length == 0) {
            return false;
        }
        
        let tempCards = [].concat(cards);
        this.holds.forEach(el => {
            let idx = tempCards.indexOf(el);
            if (idx > -1) {
                tempCards.splice(idx, 1);
            }
        });

        return tempCards.length == 0;
    }
    /**
     * 玩家出牌
     * @param cards
     */
    chupai(cards) {
        if (this.main.turn === this.seatId) {
            if (!this.hasCards(cards)) {
                return;
            }
            if (this.main.currentPoker === undefined) {
                let res = alg.parseType(cards);
                if (res !== undefined) {
                    //下家是否报警
                    if (this._main.nextAlert() && !this.isMax(res)) {
                        console.log("不是最大的牌");
                        this.send("notMax");
                        return;
                    }
                    /** 黑桃三先出 且  抓到黑桃三  且 是第一局  且 是第一手牌**/
                    if(this.main.foldsList.length === 0 && this.main.heitao3){
                        if(!cards.includes(41)){
                            console.log(" 必须黑桃三先出！！！ ");
                            this.send("mustHeitao3");
                            return;
                        }
                    }

                    /**  2018.4.9 修改  添加出牌判断 **/
                    /***
                     *   找炸弹
                     */
                    let canThrow = this.isSplitBomb(res);
                    if (!this._main.dismantleBomb && canThrow && (res.type !== 7 && res.type !== 4 && res.type !== 9)) {
                        this.send("cannotOut");
                        return undefined;
                    } else if (!this._main.fourBandTwo && res.type === 7 && res.cards[1].length === 2) {
                        this.send("cannotOut");
                        return undefined;
                    } else if (!this._main.fourBandThree && res.type === 9 && res.cards[1].length === 3) {
                        this.send("cannotOut");
                        return undefined;
                    } else if (!this._main.sanzhangchuwan && res.type === 3 && res.cards[1].length < 2) {
                        this.send("cannotOut");
                        return undefined;
                    } else if (!this._main.feijichuwan && res.type === 8 && res.cards[1].length < res.cards[0].length * 2) {
                        this.send("cannotOut");
                        return undefined;
                    } else {
                        res.uid = this.uid;
                        this._main.currentPoker = res;

                        //打出的牌推送到已出列表
                        this._main.foldsList.push(res);

                        this.delHolds(cards);
                        this.sendAll("chupai", res);
                        this.antiCheating = true;

                        /**
                         *  2018.4.11 添加
                         * 给前端发送当前玩家的牌数
                         * **/
                        if (this._main.numVisibles) {
                            let cardNum = {};
                            this._main.players.forEach((el) => {
                                cardNum[el.uid] = el.holds.length;
                            });
                            this.sendAll("localCardNum", cardNum);
                        }

                        //判断是否报单
                        this.isAlert();

                        if(res.type === 4){
                            let self = this;
                            this.setTimeout(function () {
                                self._main.nextTurn();
                            },1000);
                        }else{
                            this._main.nextTurn();
                        }

                        return undefined;
                    }
                }
            } else {
                let type = this._main.currentPoker.type;
                let func = ["", alg.checkType1, alg.checkType2, alg.checkType3, alg.checkType4, alg.checkType5,
                    alg.checkType6, alg.checkType7, alg.checkType8, alg.checkType9];
                let length = this._main.currentPoker.length;
                let res = func[type](cards, length);
                if (res !== undefined) {
                    console.log("报单 = ", this._main.nextAlert(), "是否最大 ", this.isMax(res));
                    //下家已经报警并且当前出的牌不是最大牌，则提示前端不能出
                    if (this._main.nextAlert() && !this.isMax(res)) {
                        console.log("不是最大的牌");
                        this.send("notMax");
                        return;
                    }
                    //类型相同
                    if (alg.compareType(this._main.currentPoker, res)) {
                        if (!alg.compare(this._main.currentPoker, res)) {
                            let canThrow = this.isSplitBomb(res);
                            if (!this._main.dismantleBomb && canThrow && (res.type !== 7 && res.type !== 4 && res.type !== 9)) {
                                this.send("cannotOut");
                                return undefined;
                            } else if (!this._main.sanzhangjiewan && res.type === 3 && res.cards[1].length < 2) {
                                this.send("cannotOut");
                                return undefined;
                            } else if (!this._main.feijijiewan && res.type === 8 && res.cards[1].length < res.cards[0].length * 2) {
                                this.send("cannotOut");
                                return undefined;
                            } else {
                                res.uid = this.uid;
                                this._main.currentPoker = res;

                                //打出的牌推送到已出列表
                                this._main.foldsList.push(res);

                                this.delHolds(cards);
                                this.sendAll("chupai", res);

                                /**
                                 *  2018.4.16 添加
                                 * 给前端发送当前玩家的牌数
                                 * **/
                                if (this._main.numVisibles) {
                                    let cardNum = {};
                                    this._main.players.forEach((el) => {
                                        cardNum[el.uid] = el.holds.length;
                                    });
                                    this.sendAll("localCardNum", cardNum);
                                }

                                //判断是否报单
                                this.isAlert();

                                if(res.type === 4){
                                    this.setTimeout( () => {
                                        this._main.nextTurn();
                                        console.log(" 炸弹延迟！！！ ");
                                    },1000);
                                }else{
                                    this._main.nextTurn();
                                }

                                return undefined;
                            }
                        }
                    }
                }

                //判断炸弹
                res = alg.checkType4(cards);
                if (res !== undefined) {
                    console.log(this.uid + "出牌： ", res);
                    if (alg.compare(res, this._main.currentPoker)) {
                        res.uid = this.uid;
                        this._main.currentPoker = res;

                        //打出的牌推送到已出列表
                        this._main.foldsList.push(res);

                        this.delHolds(cards);
                        this.sendAll("chupai", res);

                        /**
                         *  2018.4.16 添加
                         * 给前端发送当前玩家的牌数
                         * **/
                        if (this._main.numVisibles) {
                            let cardNum = {};
                            this._main.players.forEach((el) => {
                                cardNum[el.uid] = el.holds.length;
                            });
                            this.sendAll("localCardNum", cardNum);
                        }

                        //判断是否报单
                        this.isAlert();
                        if(res.type === 4){
                            let self = this;
                            this.setTimeout(function () {
                                console.log(" 炸弹延迟！！！ ");
                                self._main.nextTurn();
                            },0);
                        }else{
                            this._main.nextTurn();
                        }

                        return undefined;
                    }
                }
            }
            //this.send("gameTips", {code: Code.cardsError});
            this.send("cannotOut");
        }
          //  this.send("gameTips", {code: Code.notYou});
    }

    buyao() {
        if (this._main.turn === this.seatId) {
            //不要也需要记录一次
            this._main.foldsList.push({uid: this.uid});

            this.sendAll("buyao", {uid: this.uid});
            this._main.nextTurn();
        }
    }

    /**
     * 判断当前这手牌是否最大
     * @return {boolean} true 是出的最大牌
     */
    isMax(obj) {
        if (obj.type === 1) {
            let keys = Object.keys(this.counts);
            alg.sort(keys);
            if (alg.transform(obj.val) === alg.transform(keys[keys.length - 1])) {
                return true;
            }
        } else {
            return true;
        }
    }

    /**
     * 是否报警
     */
    isAlert() {
        if (this.holds.length === 1) {
            this.sendAll("alert", {uid: this.uid});
        }
    }

    /**
     * 删除指定的牌
     * @param cards
     */
    delHolds(cards) {
        cards.forEach(el => {
            let index = this.holds.indexOf(el);
            if (index !== -1) {
                let el = this.holds.splice(index, 1);
                let card = alg.val(el);
                if (this.counts[card] === 1) {
                    delete this.counts[card];
                } else {
                    --this.counts[card];
                }
            }
        }, this);
        this.folds.push(cards);
    }

    /**
     * 发送给自己
     */
    getInfos() {
        let data = {};
        //防作弊
        if(this.main.antiCheating && !this.isAntiCheating){
            data.holds = new Array(this.main.model ? 16 : 15);
        } else {
            data.holds = this.holds;
        }

        data.isAntiCheating = this.isAntiCheating;
        data.cardsNumber = data.holds.length;
        data.isTrusteeship = this.isTrusteeship;
        return data;
    }

    /**
     * 发送给其它玩家的信息
     */
    getOtherInfos() {
        return {
            isTrusteeship: this.isTrusteeship, //托管状态
            cardsNumber : this.holds.length,
            isAntiCheating : this.isAntiCheating
        };
    }
}

module.exports = Player;