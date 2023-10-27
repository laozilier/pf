/**
 * 麻将回溯法
 */
let mj_huisu = module.exports;

mj_huisu.huisu_items1 = {
    op_num: 1,
    huisu_items: [{a: 1, b: 1, c: 1, eye: false}]
};

mj_huisu.huisu_items2 = {
    op_num: 2,
    huisu_items: [{a: 2, b: 0, c: 0, eye: true}, {a: 2, b: 2, c: 2, eye: false}]
};

mj_huisu.huisu_items3 = {
    op_num: 2,
    huisu_items: [{a: 3, b: 0, c: 0, eye: false}, {a: 3, b: 1, c: 1, eye: true}]
};

mj_huisu.huisu_items4 = {
    op_num: 2,
    huisu_items: [{a: 4, b: 1, c: 1, eye: false}, {a: 4, b: 2, c: 2, eye: true}]
};

/**
 *
 * @param cur_num
 * @param op_num
 * @returns {*}
 */
mj_huisu.get_huisu_ops = function(cur_num)
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

/**
 *
 * @param cur
 * @param cards
 * @param eye
 * @returns {number}
 */
mj_huisu.cai_cur = function(cur, cards, eye)
{
    let result  = {
        eye: eye,
        rt: true
    };
    if (cur > 8) return result;

    let n = cards[cur];
    console.log("cars cur , ", cur, "  n= ", n );

    if (n === 0) return this.cai_cur(cur + 1, cards, eye);

    // 获取所有可拆解情况
    let p = this.get_huisu_ops(n,);
    console.log("get_huisu_ops return , ", p );
    for (let i = 0; i < p.op_num; ++i)
    {
        let pi = p.huisu_items[i];
        if (eye && p.huisu_items[i].eye)
        {
            //检查258
            if (cur % 3 === 2)  continue;
        }
        if (pi.b>0 && pi.b > cards[cur + 1] || pi.c>0 && cards[cur + 2] < pi.c) continue;

        //let old_cur = cards[cur];
        //let old_cur1 = cards[cur+1];
        //let old_cur2 = cards[cur+2];

        cards[cur] = 0;
        cards[cur + 1] -= pi.b;
        cards[cur + 2] -= pi.c;

        let e = eye || pi.eye;
        result.eye = e;
        result.rt = true;

        result = this.cai_cur(cur + 1, cards, e);
        eye = result.eye;
        cards[cur] = pi.a;
        cards[cur + 1] += pi.b;
        cards[cur + 2] += pi.c;

        //cards[cur] = old_cur;
        //cards[cur + 1] = old_cur1;
        //cards[cur + 2] = old_cur2;
        if (result.rt === true) {
            eye = result.eye;
            //eye = e;
            //result.eye = e;
            return result;
        }
    }

    result.rt = false;
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
mj_huisu.check_color = function(color_cards, begin, eye)
{
    let result  = {
        eye: eye,
        rt: true
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

    if (sum === 0) {
        return result;
    }

    let yu = sum % 3;
    if (yu === 1)
    {
        result.rt = false;
        return result;
    }
    if (eye && yu === 2){
        result.rt = false;
        return result;
    }

     result = this.cai_cur(0, cards, eye);

    return result
};

/**
 * 回溯
 * @param hand_cards
 * @param gui_index1
 * @param gui_index2
 * @returns {number} 能否胡牌，需要的癞子数
 */
mj_huisu.can_hu_huisu = function(hand_cards){
    let cards = hand_cards.slice(0);

    let eye = false;
    //检查万
    if (!this.check_color(cards, 1, eye)) return false;

    //检查条
    if (!this.check_color(cards, 11, eye)) return false;

    //检查筒
    if (!this.check_color(cards, 21, eye)) return false;

    return true;
};
