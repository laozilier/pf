
/**
 * 麻将回溯法
 */
let mj_huisu= module.exports;

mj_huisu.huisu_items1 = {
    op_num: 2,
    huisu_items: [{a: 1, b: 1, c: 1, eye: false}, {a: 2, b: 0, c: 0, eye: true}]
};

mj_huisu.huisu_items2 = {
    op_num: 3,
    huisu_items: [{a: 2, b: 0, c: 0, eye: true}, {a: 2, b: 2, c: 2, eye: false}, {a: 3, b: 0, c: 0, eye: false}]
};

mj_huisu.huisu_items3 = {
    op_num: 2,
    huisu_items: [{a: 3, b: 0, c: 0, eye: false}, {a: 3, b: 1, c: 1, eye: true}]
};

mj_huisu.huisu_items4 = {
    op_num: 3,
    huisu_items: [{a: 4, b: 1, c: 1, eye: false}, {a: 4, b: 2, c: 2, eye: true}, {a: 5, b: 0, c: 0, eye: true}]
};

/**
 *
 * @param cur_num
 * @param op_num
 * @returns {*}
 */
mj_huisu.get_huisu_ops = function(cur_num,)
{
    if (cur_num === 1) {
        return this.huisu_items1;
    }
    if (cur_num === 2) {
        return this.huisu_items2;
    }
    if (cur_num === 3) {
        return this.huisu_items3;
    }
    if (cur_num === 4) {
        return this.huisu_items4;
    }
};

mj_huisu.is_258 = function(card) {
    let val = (card % 10);//mjutils.card_val(card);
    if (val === 2 || val === 5 || val === 8)
    {
        return true;
    }
    return false;
};

/**
 *
 * @param cur
 * @param cards
 * @param eye
 * @param total_gui
 * @returns {number}
 */
mj_huisu.cai_cur = function(cur, cards, eye, total_gui)
{
    let result  = {
        eye: eye,
        rt: 0
    };
    if (cur > 8) return result;

    let n = cards[cur];
    if (n === 0) return this.cai_cur(cur + 1, cards, eye, total_gui);

    // 获取所有可拆解情况
    let p = this.get_huisu_ops(n);
    for (let i = 0; i < p.op_num; ++i)
    {
        let pi = p.huisu_items[i];
        if (eye && p.huisu_items[i].eye)
        {
            continue;
        }

        let old_cur = cards[cur];
        let old_cur1 = cards[cur+1];
        let old_cur2 = cards[cur+2];

        cards[cur] -= pi.a;
        cards[cur + 1] -= pi.b;
        cards[cur + 2] -= pi.c;
        let gui = 0;
        if (cards[cur] < 0) {
            gui += -cards[cur];
            cards[cur] = 0;
        }

        if (cards[cur+1] < 0) {
            gui += -cards[cur+1];
            cards[cur+1] = 0;
        }
        if (cards[cur+2] < 0) {
            gui += -cards[cur+2];
            cards[cur+2] = 0;
        }

        let e = eye || pi.eye;
        result.eye = e;
        result.rt = 1000;

        if (gui <= total_gui)
        {
            result = this.cai_cur(cur + 1, cards, e, total_gui - gui);
            //eye = result.eye;
        }

        cards[cur] = old_cur;
        cards[cur + 1] = old_cur1;
        cards[cur + 2] = old_cur2;
        if (result.rt !== 1000) {
            //eye = e;
            //result.eye = e;
            result.rt  = result.rt + gui;
            return result;
        }
    }
    return result; //1000
};

//这里的cards是含有九个元素的数组
/**
 * 处理
 * @param color_cards
 * @param begin
 * @param eye
 * @param total_gui
 * @returns {number} 需要的癞子数
 */
mj_huisu.check_color = function(color_cards, begin, eye, total_gui)
{
    let ret = {
        eye: eye,
        need_gui: 0
    };

    // 为拆顺子多留两个空间
    let cards = [];
    for (let i = begin; i < begin + 9; ++i)
    {
        cards.push(color_cards[i]);
    }

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += cards[i];
    }
    console.log("阶段牌 ", begin, "数量：", sum , "cards ", cards);

    // 没有可用赖子时
    if (total_gui === 0) {
        let yu = sum % 3;
        if (yu === 1)
        {
            ret.eye = eye;
            ret.need_gui = 1000;
            return ret;
        }
        if (eye && yu === 2)
        {
            ret.eye = eye;
            ret.need_gui = 1000;
            return ret;
        }
    }

    for (let i = 0; i <= total_gui;++i)
    {
        let yu = (i + sum) % 3;
        if (yu === 1) continue;
        let cur_eye = eye;
        let result = this.cai_cur(0, cards, cur_eye,i);
        if (result.rt!==1000) {
            eye = result.eye;
            ret.need_gui = i;
            return ret;
        }
    }

    ret.eye = eye;
    ret.need_gui = 1000;
    return ret;
};

/**
 * 回溯
 * @param hand_cards
 * @param gui_index1
 * @param gui_index2
 * @returns {number} 能否胡牌，需要的癞子数
 */
mj_huisu.can_hu_huisu = function(hand_cards, gui_index1, gui_index2){
    let result = {
        canHu: false,
        need_gui: 100
    };

    let cards = hand_cards.slice(0);

    //统计癞子数量
    let gui_num = 0;
    if (gui_index1 !== undefined && gui_index1 !== 0) {
        gui_num += cards[gui_index1];
        cards[gui_index1] = 0;
    }
    if (gui_index2 !== undefined && gui_index2 !== 0) {
        gui_num += cards[gui_index2];
        cards[gui_index2] = 0;
    }

    let eye = false;

    //检查万
    let need_gui1 = this.check_color(cards, 1, eye, gui_num);
    result.need_gui = need_gui1.need_gui;
    if (result.need_gui > gui_num)// return false;
    {
        return result;
    }

    //检查条
    let need_gui2 = this.check_color(cards, 11, need_gui1.eye, gui_num - result.need_gui);
    result.need_gui += need_gui2.need_gui;
    if (result.need_gui > gui_num)// return false;
    {
        return result;
    }

    //检查筒
    let need_gui3 = this.check_color(cards, 21, need_gui2.eye, gui_num - result.need_gui);
    result.need_gui += need_gui3.need_gui;
    if (result.need_gui > gui_num)// return false;
    {
        return result;
    }

    result.canHu = true;

    return result;
};
