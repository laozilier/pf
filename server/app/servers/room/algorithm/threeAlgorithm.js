/**
 *  创建者： THB
 *  日期：2018/7/2 18:46
 */

/**
 *   分为7种牌型
 *    1. 豹子
 *    2.同花顺
 *    3.同花
 *    4.顺子
 *    5.对子
 *    6.单张
 *    7.特殊牌 2、3、5
 */

class threeAlgorithm{
    constructor(){  //保存一副牌
    }

    /**
     *
     * @returns {number[]}
     */
    getPokers() {
        return [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];
    }

    /**
     *   发牌
     * @param {Number} playerNumber  当前游戏玩家数量
     */
    // deal(playerNumber){
    //     let result = [];
    //     let pokers = this.getPokers();
    //     for(let i = 0;i < playerNumber;++i){ //当前玩家数量
    //         let playerCards = [];
    //         for(let j = 0;j < 3;++j){ //每人三张
    //             let index = parseInt(Math.random() * pokers.length);
    //             playerCards.push(pokers.splice(index, 1));
    //         }
    //         result.push(playerCards);
    //     }
    //     return result;
    // }

    /**
     *   发牌
     * @param {Number} playerNumber  当前游戏玩家数量
     */
    deal(playerNumber){
        let result = [];
        let pokers = this.getPokers();
        for(let i = 0;i < playerNumber;++i){ //当前玩家数量
            let playerCards = [];
            for(let j = 0;j < 3;++j){ //每人三张
                // if(i==0)
                // {
                //     if(j==0)
                //         var index = 46;
                //     if(j==1)
                //         var index = 39;
                //     if(j==2)
                //         var index = 33;
                // }
                // else if(i==1)
                // {
                //     if(j==0)
                //         var index = 25;
                //     if(j==1)
                //         var index = 16;
                //     if(j==2)
                //         var index = 3;
                // }
                // else
                // {
                //      var index = parseInt(Math.random() * pokers.length);
                // }
                //playerCards.push(pokers.splice(index, 1));
                var index = parseInt(Math.random() * pokers.length);
                playerCards.push(pokers.splice(index, 1));
            }
            result.push(playerCards);
        }
        return result;
    }

    /***
     *   统计牌的类型
     * @param playerCards
     */
    countType(playerCards){
        this.cardSort(playerCards);
        let countArray = this.countNumber(playerCards);//统计牌的张数
        let result = this.findNumber(countArray);//找个数
        if(result && result.type === 1){  /** 如果是豹子 **/
        console.log(" 豹子！！！ ");
            if(playerCards[0]%13 + 1 == 1) //A的情况
            {
                return {type:1,cards:playerCards,val:100};
            }
            else
            {
                return {type:1,cards:playerCards,val:result.val};
            }

        }else if(result && result.type === 5){  /** 如果是对子 **/
        console.log(" 对子！！！ ");
            if(playerCards[0]%13 + 1 == 1 && playerCards[1]%13 + 1 == 1) //A的情况
            {
                return {type:5,cards:playerCards,val:100,max:result.max};
            }
            else
            {
                return {type:5,cards:playerCards,val:result.val,max:result.max};
            }

        }else{
            /** 如果是同花 **/
            if(parseInt(playerCards[0]/13) === parseInt(playerCards[1]/13) && parseInt(playerCards[2]/13) === parseInt(playerCards[1]/13)){
                if(this.findShunZi(countArray)){  /** 如果是顺子 **/
                console.log(" 同花顺！！！ ");
                    return {type:2,cards:playerCards,max:playerCards[0]%13 + 1};
                }else{  /** 否则不是顺子 **/
                console.log(" 同花！！！ ");
                    if(playerCards[0]%13 + 1 == 1) //A的情况
                    {
                        return {type:3,cards:playerCards,max:100,mid:playerCards[1]%13 + 1,min:playerCards[2]%13 + 1};
                    }
                    else
                    {
                        return {type:3,cards:playerCards,max:playerCards[0]%13 + 1,mid:playerCards[1]%13 + 1,min:playerCards[2]%13 + 1};
                    }

                }
            }else{  /** 不是同花 **/
                if(this.findShunZi(countArray)){  /** 如果是顺子 **/
                console.log(" 顺子！！！ ");
                    return {type:4,cards:playerCards,max:playerCards[0]%13 + 1};
                }else{  /** 否则不是顺子 **/
                console.log(" 单张！！！ ");
                    let bool = this.isSpecial(playerCards);
                    if(playerCards[0]%13 + 1 == 1) //A的情况
                    {
                        return {type:6,cards:playerCards,max:100,mid:playerCards[1]%13 + 1,min:playerCards[2]%13 + 1,isBool:bool};
                    }
                    else
                    {
                        return {type:6,cards:playerCards,max:playerCards[0]%13 + 1,mid:playerCards[1]%13 + 1,min:playerCards[2]%13 + 1,isBool:bool};
                    }
                    //return {type:6,cards:playerCards,max:playerCards[0]%13 + 1,mid:playerCards[1]%13 + 1,min:playerCards[2]%13 + 1,isBool:bool};
                }
            }
        }
    }

    /***
     *   找个数
     * @param {Array} numberArray 手牌数量数组
     */
    findNumber(numberArray){
        let max = -1;
        let val = -1;
        for(let i = 1;i < numberArray.length;++i){
            if(3 === numberArray[i]) {  /** 如果是三张（豹子） **/
                return {type:1,val:i};
            }else if(2 === numberArray[i]){ /** 如果是两张（对子） **/
            val = i;
            }else if(1 === numberArray[i]){
                max = i;
            }
        }
        if(val !== -1){
            return {type:5,val:val,max:max};
        }
        return undefined;
    }

    /**
     *
     * @param numberArray
     * @returns {*}
     */
    findShunZi(numberArray){
        for(let i = 1;i < numberArray.length;++i){
            if(numberArray[1] === 1){ /** 是 Q、K、A 或者 A、2、3 **/
                if((numberArray[2] === 1 && numberArray[3] === 1) || (numberArray[12] === 1 && numberArray[13] === 1)){
                    console.log(" 找到顺子 ");
                    return true;
                }
            }else if(i > 2){
                if(i + 1 < numberArray.length){
                    if(numberArray[i] === 1 && 1 === numberArray[i - 1] && 1 === numberArray[i + 1]){
                        console.log(" 找到顺子 ",i - 1,i,i + 1);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     *   统计牌的张数
     * @param playerCards
     */
    countNumber(playerCards){
        let val = [0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        playerCards.forEach((el)=>{
            ++val[el%13 + 1];
        });
        return val;
    }

    /**
     *   手牌排序 （从大到小）
     * @param {Array} playerCards 手牌
     */
    cardSort(playerCards){
        playerCards.sort(function (a,b) {
            let aa = a % 13;
            let bb = b % 13;
            if(aa%13 === 0){
                aa = 100;
            }
            if(bb%13 === 0){
                bb = 100;
            }
            return bb - aa;
        });
    }

    /**
     *   判断特殊牌
     * @param {Array} playerCards 玩家手牌
     * @returns Boolean
     */
    isSpecial(playerCards){  /** 是不是特殊牌2、3、5 **/
        if(playerCards[0]%13 === 4 && playerCards[1]%13 === 2 && playerCards[2]%13 === 1){
            return true;
        }
        return false;
    }

    /***
     *   比较两手牌的大小，true表示发起比牌玩家的牌大，反之则反
     * @param {Array} playerA  发起比牌玩家手牌
     * @param {Array} playerB  比牌玩家手牌
     * @returns {Boolean}
     */
    compare(playerA,playerB){
        let cardA = this.countType(playerA);
        let cardB = this.countType(playerB);
        /**  如果是相同类型 **/
        if(cardA.type === cardB.type){
            switch(cardA.type){
                case 1: //豹子
                case 4: //顺子
                    if(cardA.val > cardB.val){
                        return true;
                    }else{
                        return false;
                    }
                    break;
                case 3: //同花
                case 6: //散牌
                    if(cardA.max > cardB.max){  //比第一张
                        return true;
                    }else if(cardA.max < cardB.max){
                        return false;
                    }
                    else{  //第一张相等
                        if(cardA.mid > cardB.mid){ //比第二张
                            return true;
                        }else if(cardA.mid < cardB.mid){
                            return false;
                        }else{
                            if(cardA.min > cardB.min){ //比第三张
                                return true;
                            }else{
                                return false;
                            }
                        }
                    }
                    break;
                case 2: //同花顺
                    if(cardA.val > cardB.val){
                        return true;
                    }else if(cardA.val < cardB.val){
                        return false;
                    }else{
                        if(parseInt(cardA.cards[0]/13) > parseInt(cardB.cards[0]/13)){
                            return true;
                        }else{
                            return false;
                        }
                    }
                    break;
                case 5: //对子
                    console.log("都是对子来比较")
                    console.log(cardA.val)
                    console.log(cardB.val)
                    if(cardA.val > cardB.val){
                        return true;
                    }else if(cardA.val < cardB.val){
                        return false;
                    }else{
                        if(cardA.max > cardB.max){
                            return true;
                        }else{
                            return false;
                        }
                    }
                    break;
            }
        }else{ /** 不是相同类型 **/
            if(cardA.isBool || cardB.isBool){ /** 如果是特殊牌 **/
                if(cardA.isBool){
                    if(cardB.type === 1 && cardB.val === 1){
                        return true;
                    }else{
                        return true;
                    }
                }else{
                    if(cardA.type === 1 && cardA.val === 1){
                        return false;
                    }else{
                        return true;
                    }
                }
            }else{
                if(cardA.type < cardB.type){
                    return true;
                }else{
                    return false;
                }
            }
        }
    }
}

module.exports = new threeAlgorithm();
