/**
 * creator : zhoubiao
 * date:     2018/07/11
 */
/**
 * 拆分法
 */
let mj_split = module.exports;

/**
 *
 */
//mj_split.get_hu_info = function(hand_cards, cur_card, gui_index, gui_index1){
mj_split.get_hu_info = function(hand_cards, is_need_258, gui_index, gui_index1){
    let cards = hand_cards.slice(0);

    //console.log("cardMap", cards);

    //统计癞子数量
    let gui_num = 0;
    if ((gui_index !== undefined) && (gui_index !== 0)) {
        gui_num += cards[gui_index];
        cards[gui_index] = 0;
    }
    if ((gui_index1 !== undefined) && (gui_index1 !== 0)) {
        gui_num += cards[gui_index1];
        cards[gui_index1] = 0;
    }

    //console.log("癞子数量 ", gui_num);
    let used_gui = 0;           //已经使用的癞子数量： gui_num - used_gui 表示可用的癞子数
    let cache = [ 0,0,0];
    cache[0] = this.check_normal(cards, 1, gui_num, used_gui);
    used_gui = cache[0];
    if(used_gui > (1 + gui_num))
    {
        //console.log("return false need gui 0：=", cache[0], "1:=", cache[1], "total need:=", used_gui, "has gui:=", gui_num   );
        return false;
    }

    cache[1] = this.check_normal(cards, 11, gui_num, used_gui);
    used_gui = cache[0] + cache[1];
    if (used_gui > (1 + gui_num))
    {
        //console.log("return false need gui 0：=", cache[0], "1:=", cache[1], "total need:=", used_gui, "has gui:=", gui_num   );
        return false;
    }

    cache[2] = this.check_normal(cards, 21, gui_num, used_gui);
    used_gui = cache[0] + cache[1] + cache[2];
    if (used_gui > (1 + gui_num))
    {
        //console.log("return  need gui 0：=", cache[0], "1:=", cache[1], "2:=", cache[2], "total need:=", used_gui, "has gui:=", gui_num   );
        return false;
    }

    //console.log("need gui 0：=", cache[0], "1:=", cache[1], "2:=", cache[2], "total need:=", used_gui, "has gui:=", gui_num   );

    //cache[3] = this.check_zi(cards);
    //int need_sum = cache[0] + cache[1] + cache[2] + cache[3];
    //if (need_sum > 1 + gui_num) return false;

    //let need_sum = cache[0] + cache[1] + cache[2];
    //if (need_sum + 2 <= gui_num){
    if ((used_gui + 2) <= gui_num){
        //console.log("used_gui + 2 <= gui_num", "total need:=", used_gui, "has gui:=", gui_num );
        return true;
    }

    let eye_color = -1;

    //todo: 对赖子需求超过赖子数量的，只能做将
    for (let i = 0; i < 3;i++)
    {
        let n = cache[i];
        if (n > gui_num){
            //todo: 另一花色也不满足
            if (eye_color >= 0)
            {
                //console.log("eye_color >= 0, return ", eye_color );
                return false;
            }
            // 其它花色对赖子需求大于赖子数量
            if ((used_gui - n) > gui_num) return false;
            // 扣除将以后赖子还不够的
            if ((used_gui - 1) > gui_num) return false;
            eye_color = i;
            break;
        }
    }

    /**
    if (eye_color > 0){
        if (eye_color === 3){
            return true;
        }
        else{
            return this.check_color(cards, eye_color * 10 + 1, gui_num-(used_gui - cache[eye_color]), is_need_258);
        }
    }
     */
    if (eye_color > 0){
        return this.check_color(cards, eye_color * 10 + 1, gui_num-(used_gui - cache[eye_color]), is_need_258);
    }

    let hu = false;
    for (let i = 0; i < 3; ++i)
    {
        if (cache[i] === 0) continue;
        //if (i === 3){
        //     return true;
       // }
        //else{
            hu = this.check_color(cards, i  * 10 + 1, gui_num-(used_gui - cache[i]), is_need_258);
        //}
        if(hu) return true;
    }

    return hu;
};

mj_split.is_258 = function(card, is_need_258) {
    if (! is_need_258)
    {
        return true;
    }

    let val = (card % 10);//mjutils.card_val(card);
    if (val === 2 || val === 5 || val === 8)
    {
        return true;
    }
    return false;
};

mj_split.check_color = function( cards, from1, gui_num, is_need_258 )
{
    let eye_tbl = [];//[9];
    let eye_num = 0;
    for (let i = from1; i < (from1+9); i++) {
        if ((cards[i] > 0) && ((cards[i] + gui_num) >= 2)) {
            eye_tbl[eye_num++] = i;
        }
    }
    if (eye_num === 0) return false;

    for (let i = 0; i < eye_num; i++) {
        let eye = eye_tbl[i];
        let n = cards[eye];

        if (!this.is_258(eye, is_need_258)) continue;

        if (n === 1) {
            cards[eye] = 0;
            let need_gui = this.check_normal(cards, from1, gui_num - 1, 0);
            if (need_gui < gui_num) return true;
        }
        else {
            cards[eye] -= 2;
            let need_gui = this.check_normal(cards, from1, gui_num, 0);
            if (need_gui <= gui_num) return true;
        }

        cards[eye] = n;
    }

    return false;
};

/**
 *
 * @param cards
 * @param from1         //实际索引位置开始 1， 11， 21
 * @param max_gui       //当前实际的癞子数
 * @param used_gui      //已经使用了的癞子数
 * @returns {number}    //本花色需要的癞子数
 */
mj_split.check_normal = function(cards, from1, max_gui, used_gui){
    let index = 0;
    let cards_tmp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let n = 0;

    for (let i = from1; i <= (from1 + 8); i++) {
        n = n * 10 + cards[i];
        cards_tmp[index++] = cards[i];
    }

    //console.log("n =", n, "form1= ", from1);
    if (n === 0) return 0;

    //console.log("n =", n, "form1= ", from1, "card =", cards);
    //console.log("n =", n, "cards_tmp =", cards_tmp);

    return this.next_split(cards_tmp, 0, max_gui, used_gui);
};

/**
 *
 * @param cards         //指定花色的牌段所对应的牌计数
 * @param need_gui      //
 * @param max_gui
 * @param used_gui
 * @returns {*}
 */
mj_split.next_split = function(cards, need_gui_p, max_gui, used_gui)
{
    let index = 0;
    let need_gui = need_gui_p;

    while(index < 9){
        let c = cards[index++];

        if (c === 0) continue;

        if (c === 1 || c === 4) {
            need_gui = this.one(cards, index, need_gui, max_gui, used_gui);
        }
        else if (c === 2) {
            need_gui = this.two(cards, index, need_gui, max_gui, used_gui);
        }

        //if ((need_gui + used_gui) > (max_gui + 1)) {
        //    //console.log(" One (need_gui + used_gui > max_gui + 1 index", index, " need:=", need_gui, "has gui:=", max_gui, "has use:=", used_gui);
        //    index = 9;
        //    need_gui = 1000;
        //    break;
        //}
    }
    return need_gui;
};

mj_split.one = function(cards, index, need_gui, max_gui, used_gui){
    //console.log(" One enter need_gui + used_gui > max_gui + 1 index", index, " need:=", need_gui, "has gui:=", max_gui, "has use:=", used_gui);

    let c1 = cards[index];
    let c2 = cards[index+1];

    if (c1 === 0) ++need_gui;
    else cards[index]--;

    if (c2 === 0) ++need_gui;
    else cards[index+1]--;

    if ((need_gui + used_gui) > (max_gui + 1)) {
        //console.log(" One (need_gui + used_gui > max_gui + 1 index", index, " need:=", need_gui, "has gui:=", max_gui, "has use:=", used_gui);
        index = 9;
        need_gui = 1000;
    }

    return need_gui;
};

mj_split.two = function(cards, index, need_gui, max_gui, used_gui){
    let c1 = cards[index];
    let c2 = cards[index+1];
    let c3 = cards[index+2];
    let c4 = cards[index+3];
    let c5 = cards[index+5];

    let choose_ke = true;
    if (c1 === 0) {
    }
    else if (c1 === 1) {
        if (c2 === 0 || c2 === 1)
        {
        }
        else if (c2 === 2) {
            if (c3 === 2) {
                if (c4 === 2){
                    if (c5===1 || c5===4)
                    {
                        choose_ke = true;
                    }
                    else
                    {
                        choose_ke = false;
                    }
                }
            }
            else if (c3 === 3) {
                if (c4 !== 2) choose_ke = false;
            }
            else
                choose_ke = false;
        }
        else if (c2 === 3) {
            if (c3 === 0 || c3 === 2 || c3 === 1 || c3 === 4)
                choose_ke = false;
        }
        else if (c2 === 4) {
            if (c3 === 2) {
                if (c4 === 2 || c4 === 3 || c4 === 4)
                    choose_ke = false;
            }
            else if (c3 === 3)
            {
                choose_ke = false;
            }
        }
    }
    else if (c1 === 2) {
        choose_ke = false;
    }
    else if (c1 === 3) {
        if (c2 === 2) {
            if (c3 === 1 || c3 === 4)
                choose_ke = false;
            else if (c3 === 2) {
                if (c4 !== 2)
                    choose_ke = false;
            }
        }
        else if (c2 === 3)
            choose_ke = false;
        else if (c2 === 4)
        {
            if (c3 === 2) choose_ke = false;
        }
    }
    else if (c1 === 4) {
        if (c2 === 2 && c3 !== 2)
            choose_ke = false;
        else if (c2 === 3) {
            if (c3 === 0 || c3 === 1 || c3 === 2)
                choose_ke = false;
        }
        else if (c2 === 4) {
            if (c3 === 2) choose_ke = false;
        }
    }

    if (choose_ke) {
        need_gui += 1;
    }
    else
    {
        if (c1 < 2) {
            need_gui += (2 - c1);
            cards[index] -= c1;
        }
        else {
            cards[index] -= 2;
        }

        if (c2 < 2) {
            need_gui += (2 - c2);
            cards[index+1] -= c2;
        }
        else {
            cards[index+1] -= 2;
        }
    }

    if ((need_gui + used_gui) > (max_gui + 1)) {
        index = 9;
    }

    return need_gui;
};

/**
 *
 */
mj_split.check_zi = function(cards){
    let need_gui = 0;
    for (let i = 31; i < 38;i++) {
        if (cards[i] === 0) continue;
        if (cards[i] === 1 || cards[i] === 4) {
            need_gui += 2;
        }
        else if (cards[i] === 2) {
            ++need_gui;
        }
    }
    return need_gui;
};