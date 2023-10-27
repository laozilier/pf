/**
 * creator : zhoubiao
 * date:     2018/07/11
 */

const alg = require("./mahjongjx");
let split_result = require("./split_result");
/**
 * 拆分法
 */
let mj_split = module.exports;

//todo 排序函数
let keysort = function(key,sortType) {
    return function(a,b){
        //return sortType ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
        return sortType ? (b[key] - a[key]) : (b[key] - a[key]);
    }
};

mj_split.check_color = function( cards, from1, gui_num, is_need_258, split_list )
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

        //if (!this.is_258(eye, is_need_258)) continue;

        if (n === 1) {
            cards[eye] = 0;
            let need_gui = this.check_normal(cards, from1, gui_num - 1, 0, split_list);
            if (need_gui < gui_num)
            {
                split_list.push(eye, alg.mj_type.type_eye);
                return true;
            }
        }
        else {
            cards[eye] -= 2;
            let need_gui = this.check_normal(cards, from1, gui_num, 0, split_list);
            if (need_gui <= gui_num)
            {
                split_list.push(eye, alg.mj_type.type_eye);
                return true;
            }
        }

        cards[eye] = n;
    }

    return false;
};

mj_split.check_color_dnxb = function( cards, gui_num , split_list)
{
    let eye_tbl = [];//[9];
    let eye_num = 0;
    for (let i = 31; i < 35; i++) {
        if ((cards[i] > 0) && ((cards[i] + gui_num) >= 2)) {
            eye_tbl[eye_num++] = i;
        }
    }
    if (eye_num === 0) return false;

    for (let i = 0; i < eye_num; i++) {
        let eye = eye_tbl[i];
        let n = cards[eye];

        if (n === 1) {
            cards[eye] = 0;
            let need_gui = this.check_zi_dnxb(cards, gui_num - 1, 0, split_list);
            //if (need_gui < gui_num) return true;
            if (need_gui < gui_num)
            {
                split_list.push(eye, alg.mj_type.type_eye);
                return true;
            }
        }
        else {
            cards[eye] -= 2;
            let need_gui = this.check_zi_dnxb(cards, gui_num, 0, split_list);
            //if (need_gui <= gui_num) return true;
            if (need_gui <= gui_num)
            {
                split_list.push(eye, alg.mj_type.type_eye);
                return true;
            }
        }

        cards[eye] = n;
    }

    return false;
};

mj_split.check_color_zfb = function( cards, gui_num, split_list )
{
    let eye_tbl = [];//[9];
    let eye_num = 0;
    for (let i = 35; i < 38; i++) {
        if ((cards[i] > 0) && ((cards[i] + gui_num) >= 2)) {
            eye_tbl[eye_num++] = i;
        }
    }
    if (eye_num === 0) return false;

    for (let i = 0; i < eye_num; i++) {
        let eye = eye_tbl[i];
        let n = cards[eye];

        if (n === 1) {
            cards[eye] = 0;
            let need_gui = this.check_zi_zfb(cards, gui_num - 1, 0, split_list);
            //if (need_gui < gui_num) return true;
            if (need_gui < gui_num)
            {
                split_list.push(eye, alg.mj_type.type_eye);
                return true;
            }
        }
        else {
            cards[eye] -= 2;
            let need_gui = this.check_zi_zfb(cards, gui_num, 0, split_list);
            //if (need_gui <= gui_num) return true;
            if (need_gui <= gui_num)
            {
                split_list.push(eye, alg.mj_type.type_eye);
                return true;
            }
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
mj_split.check_normal = function(cards, from1, max_gui, used_gui, split_list){
    let index = 0;
    let cards_tmp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let n = 0;

    let curColor = from1;

    for (let i = from1; i <= (from1 + 8); i++) {
        n = n * 10 + cards[i];
        cards_tmp[index++] = cards[i];
    }

    //console.log("n =", n, "form1= ", from1);
    if (n === 0) return 0;

    //console.log("n =", n, "form1= ", from1, "card =", cards);
    //console.log("n =", n, "cards_tmp =", cards_tmp);

    return this.next_split(cards_tmp, 0, max_gui, used_gui, curColor, split_list);
};

/**
 *
 * @param cards         //指定花色的牌段所对应的牌计数
 * @param need_gui      //
 * @param max_gui
 * @param used_gui
 * @returns {*}
 */
mj_split.next_split = function(cards, need_gui_p, max_gui, used_gui, curColor, split_list)
{
    let index = 0;
    let need_gui = need_gui_p;

    while(index < 9){
        let c = cards[index++];

        if (c === 0) continue;

        if (c === 1 || c === 4) {
            need_gui = this.one(cards, index, need_gui, max_gui, used_gui, curColor, split_list);
        }
        else if (c === 2) {
            need_gui = this.two(cards, index, need_gui, max_gui, used_gui, curColor, split_list);
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

mj_split.one = function(cards, index, need_gui, max_gui, used_gui, curColor, split_list){
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
    else
    {
        let card = curColor + index -1;
        split_list.push([card, card+ 1, card + 2], alg.mj_type.type_shun);
    }

    return need_gui;
};

mj_split.two = function(cards, index, need_gui, max_gui, used_gui, curColor, split_list){
    let card = curColor + index -1;

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

        split_list.push(card, alg.mj_type.type_ke);
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

        split_list.push([card, card+ 1, card + 2], alg.mj_type.type_shun);
    }

    if ((need_gui + used_gui) > (max_gui + 1)) {
        index = 9;
    }

    return need_gui;
};

mj_split.quickSort = function(arr){
    //如果数组长度小于等于1，则返回数组本身
    if(arr.length<=1){
        return arr;
    }
    //todo 定义中间值的索引
    let index = Math.floor(arr.length/2);
    //取到中间值
    let temp = arr.splice(index,1);
    //定义左右部分数组
    let left = [];
    let right = [];
    for(let i=0;i<arr.length;i++){
        //如果元素比中间值小，那么放在左边，否则放右边
        if(arr[i]>=temp){
            left.push(arr[i]);
        }else{
            right.push(arr[i]);
        }
    }
    return this.quickSort(left).concat(temp, this.quickSort(right));
};

mj_split.one_dnxb = function(cards, index, need_gui, max_gui, used_gui, split_list){
    //console.log(" One enter need_gui + used_gui > max_gui + 1 index", index, " need:=", need_gui, "has gui:=", max_gui, "has use:=", used_gui);

    let c0 = cards[index-1];

    let c1 = cards[index];
    let c2 = cards[index+1];
    let c3 = cards[index+2];

    if (c1.nums === 0)
    {
        if (c2.nums === 0)
        {
            ++need_gui;
            if (c3.nums === 0)
            {
                ++need_gui;

                split_list.push(c0.card, alg.mj_type.type_ke);
            }
            else
            {
                cards[index+2].nums --;
                split_list.push([c0.card, c3.card], alg.mj_type.type_shun);
            }
        }
        else
        {
            cards[index+1].nums--;
            if (c3.nums === 0)
            {
                ++need_gui;

                split_list.push([c0.card, c2.card], alg.mj_type.type_shun);
            }
            else
            {
                cards[index+2].nums --;
                split_list.push([c0.card, c2.card, c3.card], alg.mj_type.type_shun);
            }
        }
    }
    else
    {
        cards[index]--;
        if (c2.nums === 0)
        {
            if (c3.nums === 0)
            {
                ++need_gui;

                split_list.push([c0.card, c1.card, c2.card], alg.mj_type.type_shun);
            }
            else
            {
                cards[index+2] --;
                split_list.push([c0.card, c1.card, c3.card], alg.mj_type.type_shun);
            }
        }
        else
        {
            if (c2.nums === 3)
            {
                if (c3 > 0 && c3 !== c2)
                {
                    cards[index+2]--;
                    split_list.push([c0.card, c1.card, c3.card], alg.mj_type.type_shun);
                }
                else
                {
                    cards[index+1]--;

                    split_list.push([c0.card, c1.card, c2.card], alg.mj_type.type_shun);
                }
            }
            else
            {
                cards[index+1]--;

                split_list.push([c0.card, c1.card, c2.card], alg.mj_type.type_shun);
            }
        }
    }

    if ((need_gui + used_gui) > (max_gui + 1)) {
        //console.log(" One (need_gui + used_gui > max_gui + 1 index", index, " need:=", need_gui, "has gui:=", max_gui, "has use:=", used_gui);
        index = 9;
        need_gui = 1000;
    }

    return need_gui;
};

mj_split.three_dnxb = function(cards, index, split_list)
{
    let n1 = index;
    let x1 = index + 1;
    let b1 = index + 2;

    let d = cards[n1 -1];
    let n = cards[n1];
    let x = cards[x1];
    let b = cards[b1];

    if (b.nums === 0)
    {
        split_list.push(d.card, alg.mj_type.type_ke);
        return 0;
    }

    if ((n.nums === 3) && ((x.nums + b.nums) === 3))
    {
        cards[n1].nums = 0;
        cards[x1].nums = 0;
        cards[b1].nums = 0;

        split_list.push([d.card, n.card, x.card], alg.mj_type.type_shun);
        split_list.push([d.card, n.card, b.card], alg.mj_type.type_shun);
    }
    else
    {
        split_list.push(d.card, alg.mj_type.type_ke);
    }

    return 0;
};

mj_split.two_dnxb = function(cards, index, need_gui_p, split_list)
{
    //todo 东南西，东南北， 东西北(1,4,   2)
    //[0,1,3],[0,1,3], [0,2,3]
    let n1 = index;
    let x1 = index + 1;
    let b1 = index + 2;

    let d = cards[n1 - 1];
    let n = cards[n1];
    let x = cards[x1];
    let b = cards[b1];

    let cur_need_gui =need_gui_p;

    if (n.nums === 2)
    {
        if (x.nums === 2) {
            // cards[n1] = 0;
            // cards[x1] = 0;
            n.nums = 0;
            x.nums = 0;
            split_list.push([d.card, n.card, x.card], alg.mj_type.type_shun);
        }
        else if (x.nums === 1)
        {
            if (b.nums === 1)
            {
                n.nums = 0;
                x.nums= 0;
                b.nums = 0;

                split_list.push([d.card, n.card, x.card], alg.mj_type.type_shun);
                split_list.push([d.card, n.card, b.card], alg.mj_type.type_shun);
            }
            else {
                n.nums = 0;
                x.nums= 0;
                cur_need_gui++;
                split_list.push([d.card, n.card, x.card], alg.mj_type.type_shun);
            }
        }
        else
        {
            cur_need_gui ++;

            split_list.push(d.card, alg.mj_type.type_ke);
        }
    }
    else
    {
        cur_need_gui ++;
        split_list.push(d.card, alg.mj_type.type_ke);
    }

    return cur_need_gui;
};

//todo 东南西北中发白
mj_split.next_split_dnxb = function(cards, need_gui, max_gui, used_gui, split_list)
{
    let index = 0;
    //todo 东南西，东南北， 东西北(1,4,   2)
    //[0,1,3],[0,1,3], [0,2,3]
    while(index < 5){
        let c = cards[index++];

        if (c.nums === 0) continue;

        if (c.nums === 1 || c.nums === 4) {
            need_gui = this.one_dnxb(cards, index, need_gui, max_gui, used_gui, split_list);
        }
        else if (c.nums === 2) {
            need_gui = this.two_dnxb(cards, index, need_gui, split_list);
        }
        else if (c.nums === 3) {
            need_gui = this.three_dnxb(cards, index, split_list);
        }
    }
    return need_gui;
};

mj_split.next_split_zfb = function(cards, need_gui_p, max_gui, used_gui, split_list)
{
    let index = 0;
    let need_gui = need_gui_p;

    while(index < 3){
        let c = cards[index++];

        if (c.nums === 0) continue;

        if (c.nums === 1 || c.nums === 4) {
            need_gui = this.one_dnxb(cards, index, need_gui, max_gui, used_gui, split_list);
        }
        else if (c.nums === 2) {
            need_gui = this.two_dnxb(cards, index, need_gui, split_list);
        }
        // if (c.nums === 1 || c.nums === 4) {
        //     need_gui = this.one(cards, index, need_gui, max_gui, used_gui);
        // }
        // else if (c.nums === 2) {
        //     need_gui = this.two(cards, index, need_gui, max_gui, used_gui);
        // }
    }
    return need_gui;
};

mj_split.check_zi_dnxb = function(cards, max_gui, used_gui, split_list){
    let index = 0;
    let cards_tmp = [{card:31, nums: 0}, {card:32, nums: 0}, {card:33, nums: 0}, {card:34, nums: 0}, {card:35, nums: 0}, {card:36, nums: 0}, {card:37, nums: 0}, {card:38, nums: 0}, {card:39, nums: 0}
    , {card:40, nums: 0}, {card:41, nums: 0}, {card:42, nums: 0}, {card:43, nums: 0}];
    let n = 0;

    for (let i = 31; i <= 34; i++) {
        n = n * 10 + cards[i];
        cards_tmp[index++].nums = cards[i];
    }

    //console.log("n =", n, "form1= ", from1);
    if (n === 0) return 0;

    //let arry = mj_split.quickSort(cards_tmp);
    let arry = cards_tmp.sort(keysort('nums', true));

    /*let g = n % 3;
    if ( (g > 0) && ((used_gui + (3 - g)) > max_gui))
    {
        return 999;
    }
    */

     return this.next_split_dnxb(arry, 0, max_gui, used_gui, split_list);
};

mj_split.check_zi_zfb = function(cards, max_gui, used_gui, split_list){
    let index = 0;
    //let cards_tmp = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let cards_tmp = [{card:35, nums: 0}, {card:36, nums: 0}, {card:37, nums: 0}, {card:38, nums: 0}, {card:39, nums: 0}, {card:40, nums: 0}, {card:41, nums: 0}, {card:42, nums: 0}, {card:43, nums: 0}
        , {card:44, nums: 0}, {card:45, nums: 0}, {card:46, nums: 0}, {card:47, nums: 0}];
    let n = 0;

    for (let i = 35; i <= 37; i++) {
        n = n * 10 + cards[i];
        cards_tmp[index++].nums = cards[i];
    }

    //console.log("n =", n, "form1= ", from1);
    if (n === 0) return 0;

    /**let g = n % 3;
    if ( (g > 0) && ((used_gui + (3 - g)) > max_gui))
   // if ((used_gui + (3 - g)) > max_gui)
    {
        return 999;
    }
     */

    return this.next_split_zfb(cards_tmp, 0, max_gui, used_gui, split_list);
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

//todo 东南西北中发白
mj_split.get_hu_info = function(hand_cards, split_list, is_need_258, gui_index, gui_index1){
    split_list.clear();

    let cards = hand_cards.slice(0);

    if (is_need_258 === undefined)
    {
        is_need_258 = false;
    }
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
    let cache = [ 0, 0, 0, 0, 0];
    cache[0] = this.check_normal(cards, 1, gui_num, used_gui, split_list);
    used_gui = cache[0];
    if(used_gui > (1 + gui_num))
    {
        //console.log("return false need gui 0：=", cache[0], "1:=", cache[1], "total need:=", used_gui, "has gui:=", gui_num   );
        return false;
    }

    cache[1] = this.check_normal(cards, 11, gui_num, used_gui, split_list);
    used_gui = cache[0] + cache[1];
    if (used_gui > (1 + gui_num))
    {
        //console.log("return false need gui 0：=", cache[0], "1:=", cache[1], "total need:=", used_gui, "has gui:=", gui_num   );
        return false;
    }

    cache[2] = this.check_normal(cards, 21, gui_num, used_gui, split_list);
    used_gui = cache[0] + cache[1] + cache[2];

    cache[3] = this.check_zi_dnxb(cards, gui_num, used_gui, split_list);
    used_gui = cache[0] + cache[1] + cache[2] + cache[3];

    cache[4] = this.check_zi_zfb(cards, gui_num, used_gui, split_list);
    used_gui = cache[0] + cache[1] + cache[2] + cache[3] + cache[4];

    if (used_gui > (1 + gui_num))
    {
        //console.log("return  need gui 0：=", cache[0], "1:=", cache[1], "2:=", cache[2], "total need:=", used_gui, "has gui:=", gui_num   );
        return false;
    }

    if ((used_gui + 2) <= gui_num){
        //console.log("used_gui + 2 <= gui_num", "total need:=", used_gui, "has gui:=", gui_num );
        return true;
    }

    let eye_color = -1;

    //todo: 对赖子需求超过赖子数量的，只能做将
    for (let i = 0; i < 5;i++)
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

    let list = new split_result();
    if ((eye_color > 0) && (eye_color < 3)){
        let rt = this.check_color(cards, eye_color * 10 + 1, gui_num-(used_gui - cache[eye_color]), is_need_258, list);
        if (rt)
        {
            split_list.clear(eye_color);
            split_list.add(list);
        }
        return rt;
    }

    let hu = false;
    for (let i = 0; i < 3; ++i)
    {
        if (cache[i] === 0) continue;
        //if (i === 3){
        //     return true;
        // }
        //else{
        list.clearAll();
        hu = this.check_color(cards, i  * 10 + 1, gui_num-(used_gui - cache[i]), is_need_258, list);
        //}
        if(hu)
        {
            split_list.clear(eye_color);
            split_list.add(list);
            return true;
        }
    }

    if (eye_color === 3 )
    {
        list.clearAll();
        hu = this.check_color_dnxb(cards, gui_num-(used_gui - cache[3]), list);
        if(hu)
        {
            split_list.clear(eye_color);
            split_list.add(list);
            return true;
        }
    }

    if ( eye_color === 4 )
    {
        list.clearAll();
        hu = this.check_color_zfb(cards, gui_num-(used_gui - cache[4]), list);
        if(hu)
        {
            split_list.clear(eye_color);
            split_list.add(list);
            return true;
        }
    }

    return hu;
};

let test_hu = function () {
    //let holds = [3,3, 31, 31, 31, 31,32, 34, 34, 34, 34,35,36,37];
    //let holds = [3,3, 31, 31, 31, 31,32, 34, 34, 34, 34,33,33,33];
    //let holds = [3,3, 31, 31, 31, 32,32, 34, 34, 33,33];
    //let holds = [3,3, 31, 31, 31, 32,32, 34, 34, 34, 33, 35, 36,37];
    //let holds = [24,25,26,26,27,28, 31,31,32,33,34];
    //let holds = [23,24,25, 26,27,28, 32,32,33,34,31];
    let holds = [17,17,24,25,26, 27,28,29, 31,31, 32,32,33,34];
    let cardsMap = [];
    for (let i = 0; i < 38; ++i)
    {
        cardsMap.push(0);
    }

    for (let i = 0; i < holds.length; i++)
    {
        let pai = holds[i];
        if (cardsMap[pai] === undefined)
        {
            cardsMap[pai] = 1;
        }
        else
        {
            cardsMap[pai]++;
        }
    }

    let split = new split_result();
    //let rt = mahjong_alg.is_yizhihua(cardsMap, vt);
    let need = mj_split.get_hu_info(cardsMap, split, false);
    console.log("测试东南西北 ", need);

    split.info();
};

let test_sort = function () {
   let array = [{card:31, nums: 4}, {card:32, nums: 1}, {card:33, nums: -8}, {card:34, nums: -9}, {card:35, nums: 6}, {card:36, nums:12}, {card:37, nums: 9}, {card:38, nums: 8}, {card:39, nums: 0}
        , {card:40, nums: 0}, {card:41, nums: 0}, {card:42, nums: 0}, {card:43, nums: 0}];

    //let array = [1,4,-8,-3,6,12,9,8];
    let arry = array.sort(keysort('nums', true));

    console.log("测试数组排序 ", arry);
    /**
    let ary=[{id:1,name:"b"},{id:3,name:"c"},{id:2,name:"b"},{id:4,name:"d"}];
    let a =ary.sort(keysort('id',false));
    console.log(a);
    console.log('-----------');
    let b =ary.sort(keysort('name',true));
    console.log(b);
    */

};
//test_hu();

//test_sort();