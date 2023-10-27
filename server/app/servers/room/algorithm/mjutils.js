
let mj_utils = module.exports;

//特殊牌型
mj_utils.sp_style = {
    sp_normal:      0x0000, //普通翻型
    sp_duidui:      0x0001, //七小对*
    sp_jiangjiang:  0x0002, //将将胡
    sp_qingyise:    0x0004  //清一色
};
/**
 * 获取牌的面值
 * @param card
 * @return {number}  返回牌的面值； 1,2,3,4,5,6,7,8,9
 */
mj_utils.card_val = function(card) {
    return (card % 10);
};

/**
 * 获取牌的类型
 * 0.万；1.索；0.筒；3.花牌
 * @param card
 * @return {number} 类型  0.筒；1.万；2.索；3.花牌
 */
mj_utils.card_type = function(card) {
    return (Math.floor(card/10));
};

mj_utils.is_258 = function(card) {
    let val = this.card_val(card);
    if (val === 2 || val === 5 || val === 8)
    {
        return true;
    }
    return false;
};

/**
 * 摇骰子
 */
mj_utils.yaoSaizi = function() {
    //let Rand = Math.random();
    //let position = 1 + parseInt(Math.random() * 6);
    //return position;
    let funSaizi = function () {
        let position = Math.floor(Math.random() * 6);
        return position;
    };
    let result = {
        position: 0,
        dices: []
    };
    //todo:
    let post = 0;
    for (let i = 0; i < 2; ++i)
    {
        let c = funSaizi();
        //c = mj_utils.card_val(c);
        c++;
        post += c;
        //因为加了1，位置偏移从0计算
        result.dices.push( c );
    }

    //todo: 计算骰子位置，因为骰子从1计算，位置从零计算，所以位置需要减1
    //result.position = (post+1) * 2;
    result.position = post * 2 - 1;

    return result;
};

/**
 * 获得自动出的牌
 * @param old_hand          //手里的牌
 * @param left_cards
 * @param magic_index1
 * @param magic_index1
 * @param ting_hu_card
 */
/**
mj_utils.get_auto_chu_pai = function(old_hand_map, left_cards, magic_index1, magic_index2, special_mask)
{
    let hand = old_hand_map.slice(0);

    //优先出花猪
    for (let j = 31; j < 38; j++)
    {
        if (hand[j] === 1 && ((magic_index1 !== undefined || magic_index1 !== 0) && j !== magic_index1 ) && ((magic_index2 !== undefined || magic_index2 !== 0) && j !== magic_index2 ) )
        {
            return j;
        }
    }

    //优先 出边子（单牌）
    for (let j = 0; j < 3; j++)
    {
        //判断尾 7 8 9
        let c = j * 10 + 9;
        if (hand[c] === 1 && ((magic_index1 !== undefined || magic_index1 !== 0) && c !== magic_index1 ) && ((magic_index2 !== undefined || magic_index2 !== 0) && c !== magic_index2 ) )
        {
            if (hand[c - 1] === 0 && hand[c - 2] === 0)
            {
                return c;
            }
        }

        //判断头 1 2 3
        c = j * 10 + 1;
        if (hand[c] === 1 && ((magic_index1 !== undefined || magic_index1 !== 0) && c !== magic_index1 ) && ((magic_index2 !== undefined || magic_index2 !== 0) && c !== magic_index2 ) )
        {
            if (hand[c + 1] === 0 && hand[c + 2] === 0)
            {
                return c;
            }
        }
    }


    for (let j = 0; j < 3; j++)
    {
        let c = j * 10 + 2;
        for (c; c <= j * 10 + 8; c++)
        {
            if (hand[c] === 1 && ((magic_index1 !== undefined || magic_index1 !== 0) && c !== magic_index1 ) && ((magic_index2 !== undefined || magic_index2 !== 0) && c !== magic_index2 ) )
            {
                if (hand[c - 1] === 0 && hand[c - 2] === 0 && hand[c + 1] === 0 && hand[c + 2] === 0)
                {
                    return c;
                }
            }
        }
    }

    let ret_needhun = 0x1a;
    let ret_pai = 0;
    let ret_nexus = 0xff;
    let ret_tingpaicount = 0;

    for (let k = 0; k < 38; k++) {
        if (hand[k] === 0 || k%10 === 0 || ((magic_index1 !== undefined || magic_index1 !== 0) && k === magic_index1 ) || ((magic_index2 !== undefined || magic_index2 !== 0) && k === magic_index2 ) )
        {
            continue;
        }

        hand[k]--;
        let list = [];
        let canting = this.can_ting_pai(hand, list, special_mask, magic_index1, magic_index2);
        let TingPaiCount = 0;
        if (canting)
            TingPaiCount = this.get_ting_pai_ount(hand, list, left_cards);
        if (TingPaiCount > 0)//至少有得胡 如果胡的牌都没了就换牌吧
        {
            //听牌数比对，也可以按其他方式比对，比如所听的牌接下来的剩余牌
            if (ret_tingpaicount < TingPaiCount) {
                ret_tingpaicount = TingPaiCount;
                ret_needhun = 1;
                ret_pai = hand[k];
            }
        }
        else if (ret_tingpaicount === 0) {
            let needhun = this.get_needhun_for_hu(hand, special_mask, magic_index1, magic_index2);

            if (needhun < ret_needhun)//判断此张牌需要的混牌数
            {
                ret_needhun = needhun;
                ret_pai = k;
                ret_nexus = this.has_nexus(k, hand);
            }
            else if (needhun === ret_needhun)
            {
                let nexus = this.has_nexus(k, hand);
                if (nexus < ret_nexus) {
                    ret_nexus = nexus;
                    ret_pai = k;
                }
                else if (nexus === ret_nexus) {
                    if (this.get_value(ret_pai, hand) > this.get_value(k, hand))
                    {
                        ret_pai = k;
                        ret_nexus = this.has_nexus(k, hand);
                    }
                }
            }
        }
        hand[k]++;
    }
    return ret_pai;
};

mj_utils.can_ting_pai = function (old_hand, list, special_mask, magic_index1, magic_index2) {
    return false;
};

mj_utils.get_ting_pai_ount= function (old_hand, list, left_cards){

    return 0;
};
 */

mj_utils.get_chi_card_start = function(old_hand, v, hunCount)
{
    let hand = old_hand.slice(0);

    let i = v % 10;
    if (i> 1 && i < 9 && hand[v - 1] > 0 && hand[v + 1] > 0)
    {
        hand[v - 1]--;
        hand[v]--;
        hand[v + 1]--;
        if (hunCount === this.getneedhun(hand, v / 10, true))
        {
            return v - 1;
        }
        hand[v - 1]++;
        hand[v]++;
        hand[v + 1]++;
    }

    if (i> 2 && hand[v - 1] > 0 && hand[v -2 ] > 0)
    {
        hand[v - 1]--;
        hand[v]--;
        hand[v - 2]--;
        if (hunCount === this.getneedhun(hand, v / 10, true))
        {
            return (v - 2);
        }
        hand[v - 1]++;
        hand[v]++;
        hand[v -2]++;
    }

    if (i < 8 && hand[v + 2] > 0 && hand[v + 1] > 0)
    {
        hand[v +2]--;
        hand[v]--;
        hand[v + 1]--;
        if (hunCount === this.getneedhun(hand, v / 10, true))
        {
            return v;
        }
    }
    return 0;
};

/**
 * 检查能吃的牌
 * @param old_hand
 * @param v
 * @param Hun
 * @returns {*} //返回能吃的牌， 0，表示不能吃
 */
mj_utils.can_chi_pai = function(old_hand, v, Hun)
{
    let card = 0;
    let hand = old_hand.slice(0);

    //let hunCount = hand[Hun];
    hand[Hun] = 0;
    let needHun = this.getneedhun(hand, v / 10, true);
    hand[v]++;
    let need2 = this.getneedhun(hand, v / 10, true);

    if ((needHun > need2))
    {
        card = this.get_chi_card_start(hand, v, need2);
        if (card >0)
            return card;
    }
    return 0;
};

mj_utils.can_pen_pai = function(old_hand, v, Hun)
{
    if (v === Hun)
    {
        return false;
    }
    let hand = old_hand.slice(0);

    hand[Hun] = 0;
    let needHun = this.getneedhun(hand, v / 10, true);
    hand[v]++;

    return ( needHun >  this.getneedhun(hand, v / 10, true));
};

/**
 *
 * @param old_hand
 * @param i
 * @param j
 * @param hasJiang
 * @param needHun
 */
mj_utils.del_list = function(old_hand, i, j, hasJiang, needHun)
{
    let hand = old_hand.slice(0);

    for (let k = 0; k < 3; k++) {
        if (hand[i + k] > 0) {
            hand[i + k]--;
        }
        else {
            needHun++;
        }
    }

    return this.dfs(hand, i, j, hasJiang, needHun);
};

/**
 * 三同处理
 * @param old_hand
 * @param i
 * @param j
 * @param hasJiang
 * @param needHun
 */
mj_utils.del_same = function(old_hand, i, j, hasJiang, needHun)
{
    let hand = old_hand.slice(0);

    hand[i] %= 3;
    switch (hand[i]) {
        case 0: {
            break;
        }
        case 1: {
            if (hasJiang) { needHun += 2; }
            else { needHun++; hasJiang = true; }
            break;
        }
        case 2: {
            if (hasJiang) { needHun  += 1; }
            else { hasJiang = true; }
            break;
        }
    }
    hand[i] = 0;
    return this.dfs(hand, i+1, j, hasJiang, needHun);
};

mj_utils.GetHuaHun = function(old_hand, i, j, hasJiang, needHun)
{
    let hand = old_hand.slice(0);

    for (; (i < j) & (i < 38); i++)
    {
        hand[i] %= 3;
        switch (hand[i]) {
            case 0: {
                break;
            }
            case 1: {
                if (hasJiang) { needHun += 2; }
                else { needHun++; hasJiang = true; }
                break;
            }
            case 2: {
                if (hasJiang) { needHun += 1; }
                else { hasJiang = true; }
                break;
            }
        }
    }

    let result = {
        hasJiang: hasJiang,
        needHun: needHun
    };

    return result;  //needHun
};

mj_utils.dfs = function(old_hand, i, j, hasJiang, needHun)
{
    let result = {
        hasJiang: hasJiang,
        needHun: needHun
    };

    if (i > j) {
        if (!hasJiang) {
            needHun += 2;
        }

        result.needHun = needHun;
        return needHun;
    }

    if (i % 10 === 7  && old_hand[i + 1] % 3 === 1 && old_hand[i + 2] % 3 === 1)//8 9特殊情况，此时应该补个7
    {
        return this.del_list(old_hand, i, j, hasJiang, needHun);
    }
    else if (old_hand[i] === 0) {
        return this.dfs(old_hand, i + 1, j, hasJiang, needHun);
    }
    else if (i % 10 < 8  && (old_hand[i + 1] > 0 || old_hand[i + 2] > 0)) {
        let need1 = needHun;
        let need2 = needHun;
        let has1 = hasJiang;
        let has2 = hasJiang;
        let result1 = this.del_list(old_hand, i, j, has1, need1);
        let result2 = this.del_same(old_hand, i, j, has2, need2);
        if (result1.needHun > result2.needHun)
        {
            result.needHun = result2.needHun;
            result.hasJiang = result2.hasJiang;
        }
        else
        {
            result.needHun = result1.needHun;
            result.hasJiang = result1.hasJiang;
        }
        return result;//needHun;
    }
    else {
        return this.del_same(old_hand, i, j, hasJiang, needHun);
    }
};

mj_utils.getneedhun = function(old_hand, type, hasJiang)
{
    let need = 0;
    let has = hasJiang;
    let hand = old_hand.slice(0);

    let i = 0;
    let j = 0;
    switch (type) {
        case 0: { i = 1; j = 9; break; }
        case 1: { i = 11; j = 19; break; }
        case 2: { i = 21; j = 29; break; }
        case 3: {return this.GetHuaHun(hand, 31, 38, has, need); }
    }

    return this.dfs(hand, i, j, has, need);
};

/**
 *
 * @param old_hand      手牌数量对照表
 * @param special_mask  指定的胡法（七小对）
 * @param Hun
 * @returns {number}
 */
mj_utils.get_needhun_for_hu = function(old_hand, special_mask, magic_index1, magic_index2)
{
    let hand = old_hand.slice(0);

    let HunCount = 0;
    if (magic_index1 !== undefined && magic_index1 > 0){
        HunCount = hand[magic_index1];
        hand[magic_index1] = 0;
    }
    if (magic_index2 !== undefined && magic_index2 > 0){
        HunCount += hand[magic_index2];
        hand[magic_index2] = 0;
    }

    let count = 0;
    for (let i = 0; i < 38; i++) {
        count += hand[i];
    }

    let min_needhun = 0x1f;

    if (((special_mask & this.sp_style.sp_duidui ) > 0) && (count + HunCount) === 13) {
        let needhun = 0;
        for (let i = 0; i < 38 ; i++) {
            let c = hand[i];
            if (c % 2 === 1) {
                needhun += 2;
            }
        }
        if (needhun < min_needhun) {
            min_needhun = needhun;
        }
    }

    for (let i = 0; i < 4; i++) {
        let needhun = 0;
        for (let j = 0; j < 4; j++) {
            let ret = this.getneedhun(hand, j, j !== i);
            needhun += ret.needHun;
            //needhun += this.getneedhun(hand, j, j !== i);
        }
        if (needhun < min_needhun) {
            min_needhun = needhun;
        }
    }
    return min_needhun - HunCount;
};

mj_utils.has_nexus = function(i, arr)
{
    if (i > 30) {
        return arr[i];
    }
    else if (i % 10 === 9) {
        return arr[i] + (arr[i - 1]>0?1:0);
    }
    else if (i % 10 === 8) {
        return arr[i] + (arr[i - 1]>0 ? 1 : 0) + (arr[i + 1]>0 ? 1 : 0) + (arr[i -2 ]>0 ? 1 : 0);
    }
    else if (i % 10 === 1) {
        return arr[i] + (arr[i + 1]>0 ? 1 : 0) + (arr[i + 2]>0 ? 1 : 0);
    }
    else if (i % 10 === 2) {
        return arr[i] + (arr[i + 1]>0 ? 1 : 0) + (arr[i + 2]>0 ? 1 : 0) + (arr[i - 1]>0 ? 1 : 0);
    }
    else {
        return arr[i] + (arr[i + 1]>0 ? 1 : 0) + (arr[i - 1]>0 ? 1 : 0) + (arr[i - 2]>0 ? 1 : 0) + (arr[i + 2]>0 ? 1 : 0);
    }
};

/**
 * 获得出牌的优先次序，返回值越小，出牌优先级越高
 * @param k
 * @param hand
 * @returns {number}
 */
mj_utils.get_value = function(k, hand)
{
    if (k > 30)//风牌优先打
    {
        return 0;
    }
    let v = k % 10;
    if (v===1 || v === 9)//边牌优先打
    {
        return 2;
    }
    else if (hand[k + 1] === 0 && hand[k - 1] === 0)//主要针对夹，优先拆
    {
        if (hand[k + 2] === 1 && hand[k - 2] === 1)
            return 4;
        return 5;
    }
    return 6;
};
