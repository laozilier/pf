let mjutils = require("./mjutils");
let alg = require("./mahjongjx");

class split_result{
    constructor(){
        this.data = [];
    }

    //todo 压入数据
    push(card, type) {
        if (Array.isArray(card))
        {
            //todo 从小到大次序排列
            let ary = card.sort((a, b) =>{
               if (a > b)
               {
                   return true;
               }
               return false;
            });
            this.data.push({cards: ary.concat(), type: type});
        }
        else
        {
            this.data.push({cards: [card], type: type});
        }
    }

    /**
     * 清除数据
     */
    clearAll(){
        this.data = [];
    }

    //todo 清除指定色
    clear(color) {
        let len = this.data.length;
        if (len > 0)
        {
            for (let i = len -1; i >= 0; i--)
            {
                let item = this.data[i];
                let card = parseInt(item.cards[0]);
                let clr = mjutils.card_type(card);

                if (color === 4)
                {
                    if ((card > 34) && (card < 38))
                    {
                        this.data.splice(i, 1);
                    }
                }
                else if (color === 3)
                {
                    if ((card > 30) && (card < 35))
                    {
                        this.data.splice(i, 1);
                    }
                }
                else
                {
                    if (clr === color)
                    {
                        this.data.splice(i, 1);
                    }
                }
            }
        }
    }

    add(other_split){
        let len = this.data.length;

        this.data.splice(len, 0, ...other_split.data);
    }

    //todo 取得听牌的类型（边字、卡牌、单调）
    analyseTingPaiSpecical(tingPai){
        //todo 听牌的处理
        tingPai = parseInt(tingPai);
        let ting_clr = mjutils.card_type(tingPai);
        let ting_val = mjutils.card_val(tingPai);

        let len = this.data.length;
        for (let i = 0; i < len; i++)
        {
            let item = this.data[i];
            let card = parseInt(item.cards[0]);
            let clr = mjutils.card_type(card);
            let val = mjutils.card_val(card);
            //todo 单吊及卡牌、边子,
            //todo 单吊（需要检查 首尾吊将的情况）
            if (item.type === alg.mj_type.type_eye)
            {
                if (tingPai === card)
                {
                    //if 在顺子中找是否在首尾
                    if (clr < 3) {
                        for (let k = 0; k < len; k++) {
                            let item_k = this.data[k];
                            if (item_k.type === alg.mj_type.type_shun) {
                                let card_k0 = parseInt(item.cards[0]);
                                let card_k2 = parseInt(item.cards[2]);
                                if ( (card_k0 === tingPai) ||  (card_k0 === (tingPai + 1)) || (card_k2 === tingPai) || (card_k2 === (tingPai + 1))) {
                                    return alg.mj_ting_specical.type_namal;
                                }
                            }
                        }
                    }
                    else if ( (clr === 3) && (val < 5))
                    {
                        //todo 检查有没有顺子
                        for (let k = 0; k < len; k++) {
                            let item_k = this.data[k];
                            let card_k0 = parseInt(item.cards[0]);
                            if ( (item_k.type === alg.mj_type.type_shun) && (card_k0 >= 31 ) && (card_k0 < 35 ) ) {
                                return alg.mj_ting_specical.type_namal;
                            }
                        }
                    }

                    return alg.mj_ting_specical.type_dandiao;
                }
            }
            else if (item.type === alg.mj_type.type_shun)
            {
                //todo 卡牌、边子,
                if (ting_clr < 3)
                {
                    //todo 边子判断 3， 7
                    if (ting_val === 3)
                    {
                        //todo 边子判断 3， 7
                        let card1 = parseInt(item.cards[2]);
                        if (!isNaN(card1))
                        {
                            if (tingPai === card1)
                            {
                                return alg.mj_ting_specical.type_end;
                            }
                        }
                    }

                    if (ting_val === 7)
                    {
                        //todo 边子判断 3， 7
                        let card1 = parseInt(item.cards[0]);
                        if (!isNaN(card1))
                        {
                            if (tingPai === card1)
                            {
                                return alg.mj_ting_specical.type_end;
                            }
                        }
                    }

                    //todo 卡牌判断
                    let card1 = parseInt(item.cards[1]);
                    if (!isNaN(card1))
                    {
                        if (tingPai === card)
                        {
                            return alg.mj_ting_specical.type_center;
                        }
                    }
                }
                else
                {
                    //todo 中发白
                    if (ting_val > 4)
                    {
                        return alg.mj_ting_specical.type_end;
                    }
                }

            }   //todo 顺子处理
            else
            {
                //todo 刻子为单吊
                return alg.mj_ting_specical.type_dandiao;
            }
        }

        return alg.mj_ting_specical.type_namal;
    }

    info()
    {
        console.log("拆分信息：", JSON.stringify(this.data));
    }
}

module.exports = split_result;