/**
 * Created by apple on 2018/1/22.
 */
const Set = require('./set');
let mjutils = require('./mjutils');

let mahjong_alg = module.exports;

mahjong_alg.MJ_TYPE_WAN = 0;        //万
mahjong_alg.MJ_TYPE_TIAO = 1;       //条
mahjong_alg.MJ_TYPE_TONG = 2;       //同
mahjong_alg.MAX_COUNT = 14;

mahjong_alg.mj_mode = {
    enum_hu: 0,         //判胡
    enum_ting: 1        //判听
};

mahjong_alg.mj_type = {
    type_shun : 0,          //顺子
    type_ke   : 1           //刻子
};

mahjong_alg.mj_card_value = {
    wan_1: 1,
    wan_2: 2,
    wan_3: 3,
    wan_4: 4,
    wan_5: 5,
    wan_6: 6,
    wan_7: 7,
    wan_8: 8,
    wan_9: 9,
    tiao_1: 11,
    tiao_2: 12,
    tiao_3: 13,
    tiao_4: 14,
    tiao_5: 15,
    tiao_6: 16,
    tiao_7: 17,
    tiao_8: 18,
    tiao_9: 19,
    tong_1: 21,
    tong_2: 22,
    tong_3: 23,
    tong_4: 24,
    tong_5: 25,
    tong_6: 26,
    tong_7: 27,
    tong_8: 28,
    tong_9: 29,
    dong:   31,     //东
    nan: 32,        //南
    xi: 33,         //西
    bei: 34,        //北
    zhong: 35,      //中
    fa: 36,         //发
    bai: 37         //白
};

mahjong_alg.right_type ={
    none: 0,
    chu: 1,     //出
    chi: 2,     //吃
    peng: 3,    //碰
    gang: 4,    //杠
    bu: 5,      //补
    hu: 6,      //胡牌
    ting: 7     //听
};

/**
 *
 * @type {*[]}
 //108张模式的一副牌
 [
 14,15,16,17,18,19,3,
 8,9,22,23,24,25,
 11,12,13,5,6,7,9,9,19,
 1,2,3,4,22,23,24,25,14,
 11,12,13,14,15,16,17,18,19,
 21,22,28,29,4,5,6,7,
 11,12,14,15,16,17,18,19,
 21,27,28,29,1,2,3,4,25,
 21,28,29,6,7,8,9,
 1,1,2,24, 13,25,27,8,27,
 21,22,23, 26,26,26,26, 27,28,29, 3,4,5, 2,
 23, 24,25, 16,17,18, 5,6,7, 8, 11,13,12
 ],

 //todo 原始牌数据
 [
 1, 1, 1, 1,  2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15,
 16, 16, 16, 16,  17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19,
 21, 21, 21, 21,  22, 22, 22, 22, 23, 23, 23, 23, 24, 24, 24, 24, 25, 25, 25, 25,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,

 21,21,21,22,22,22,23,23,23,24,24,24,24
 ],

 //todo 报听
 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 21, 22, 23, 25, 25, 25, 25,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 1, 1, 1, 1,  2, 2, 2, 2, 3, 3, 3, 3, 5,
 12, 12, 12, 12, 15, 15, 15, 15, 18, 18, 18, 18, 5,
 21,21,21, 22,22,22, 23,23,23, 24,24,24, 24
 ],

 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  12, 15,14, 3, 3,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 21, 22, 23, 25, 25, 25, 25, 24,24,24,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 12, 12,13,13, 14, 15, 15, 15, 18, 18, 18, 18, 5,
 1, 1, 1, 1,  2, 2, 2, 2, 3, 3, 5,13, 14,
 21,21,21, 22,22,22, 23,23,23, 12, 13, 14, 24
 ],
 //todo 桃江麻将杠牌测试
 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 21, 22, 23, 25, 25, 25, 25,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 15, 12, 1, 1, 1, 1,  2, 2, 2, 3, 3, 3, 3,
 12, 12, 12, 15, 15, 15, 18, 18, 18, 18, 5, 2,5,
 21,21,21, 22,22,22, 23,23,23, 24,24, 24,24
 ],

 //todo 吃碰优先级测试数据
 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 19, 19, 19, 19,
 21, 25, 25, 25, 25,24,3,1,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 21,21, 22,22, 23,23, 23,24, 24, 15, 12,2,5,
 1, 1,  1,2, 2,  2, 3, 3,  3,  21, 22,24,17,
 12, 12, 12, 15, 15, 15, 5, 18, 18, 18,  23, 22, 18
 ],
 todo 地胡刚上开花
 [
 1, 1, 1, 2, 2, 2, 12, 3, 3, 3, 4, 4, 4, 5, 5, 5,13,
 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11,  12, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 21,  22, 23, 24, 24, 25, 25, 25,
 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,

 18,26,
 12, 12, 1, 2, 3, 4,5,6, 18, 18, 18,  25, 26,
 21,21,21, 22,22,22, 23,23,23, 24,24, 15, 11
 ],
 //todo 测试杠牌情况
 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  12, 14, 3, 3,24,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 25, 25, 25, 25, 24,24,24,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 12, 12,13,13, 14, 15, 15, 15, 18, 18, 18, 18, 5,
 21, 22, 23,
 1, 1, 1, 1,  2, 2, 2, 2, 3, 3, 5,13, 14,
 21,21,21, 22,22,22, 23,23,23, 12, 13, 14, 15,
 ],
 //todo 报听
 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 21, 22, 23, 25, 25, 25, 25,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 1, 1, 1, 1,  2, 2, 2, 2, 3, 3, 3, 3, 5,
 12, 12, 12, 12, 15, 15, 15, 15, 18, 18, 18, 18, 5,
 21,21,21, 22,22,22, 23,23,23, 24,24,24, 24
 ],

 //todo 快速胡牌测试数据
 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 21, 22, 23, 25, 25, 25, 25,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 1, 1, 1, 1,  2, 2, 2, 2, 3, 3, 3, 3, 5,
 12, 12, 12, 12, 15, 15, 15, 15, 18, 18, 18, 18, 5,
 21,21,21, 22,22,22, 23,23,23, 24,24,24, 24
 ],
 //todo 4红中胡牌
 [
 1, 1,  2, 2, 2, 2, 3, 3, 22,  4, 4, 4, 4,  5, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
 11, 11, 11, 12, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 15,
 16, 16, 17, 17, 17,  18, 18, 18, 19, 19, 19,
 21, 22, 23, 24, 24, 25, 25, 25,
 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 21, 16,
 1, 1, 3, 3, 23, 23, 23, 5, 9, 13, 19, 26, 26, 16,
 11, 12, 14,  21, 21, 22,  22, 17, 18, 24, 24, 25, 9,
 35, 35,35,35
 ]

 //todo 红中杠牌测试数据
 [
 1, 1,  2, 2, 2, 2, 3, 3, 22,  4, 4, 4, 4,  5, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
 11, 11, 11, 15, 15, 15, 15,
 16, 16, 17, 17, 17,  18, 18, 18,
 21, 22, 23, 24, 24, 25, 25, 25,
 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 21, 16,
 1, 1, 3, 3, 23, 23, 23, 5, 9, 13, 19, 26, 26, 16,
 11, 12, 14,
 35, 35,35, 21, 21, 22, 24, 24, 25, 22, 17, 18, 9,
 12, 12, 12, 13, 13, 13, 14, 14, 14, 19, 19, 19, 35,
 ],
 //todo 红中一炮多响测试数据
 [
 1, 1,  2, 2, 2, 2, 3, 3, 22,  4, 4, 4, 4,  5, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
 11, 11, 11, 15, 15, 15, 15,
 16, 16, 17, 17, 17,  18, 18, 18,
 21, 22, 24, 24, 24, 25, 25, 25,
 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 21, 9,
 1, 1, 3,  23,
 35, 35,35, 21, 21, 22, 22, 23, 24, 25, 16, 17, 18,
 12, 12, 12, 13, 13, 13, 14, 14, 14, 19, 19, 19, 35,
 23,  23, 5,  9, 26, 16,  13, 19, 26,  11, 12, 14, 3,
 ],
 //todo 测试红中杠牌情况
 [
 1, 1,  2, 2, 2, 2, 3, 3, 22,  4, 4, 4, 4,  5, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
 11, 11, 11, 15, 15, 15, 15,
 16, 16, 17, 17, 17,  18, 18, 18,
 21, 22, 23, 24, 24, 25, 25, 25,
 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 21, 16,
 1, 1, 3, 3, 23, 23, 23, 5, 9, 13, 19, 26, 26, 16,
 11, 12, 14,
 35, 35,35, 21, 21, 22, 24, 24, 25, 22, 17, 18, 9,
 12, 12, 12, 13, 13, 13, 14, 14, 14, 19, 19, 19, 35,
 ],
 //todo 测试红中杠牌情况，红中中鸟
 [
 1, 1,  2, 2, 2, 2, 3, 3, 22,  4, 4, 4, 4,  5, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9,
 11, 11, 11, 15, 15, 15, 15,
 16, 16, 17, 17, 17,  18, 18, 18,
 22, 23, 24, 24, 25, 25, 25,
 19, 26,  23, 5, 27, 27, 28, 28, 13, 29, 29, 29, 29,
 16,22,24,
 35, 21, 11, 12,21,
 1, 1, 3, 3, 23, 23, 27, 27, 35, 28, 28, 26, 26,
 35, 9, 21, 21, 24, 25, 22, 17, 18, 9,14,26, 16,
 12, 12, 12, 13, 13, 13, 14, 14, 14, 19,19, 19, 35
 ],
 //todo 益阳麻将快速胡牌
 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 21, 22, 23, 25, 25, 25, 25,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 1, 1, 1, 1,  2, 2, 2, 2, 3, 3, 3, 3, 5,
 12, 12, 12, 12, 15, 15, 15, 15, 18, 18, 18, 18, 5,
 21,21,21, 22,22,22, 23,23,23, 24,24,24, 24
 ],
 //todo 益阳麻将将将胡接炮胡牌
 [
 4, 4, 4, 4, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8,  9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 25, 25, 25, 12,21, 24,23,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 1, 1, 1, 1, 3, 3,  2, 2, 2, 3,  23, 21, 22, 5,15,18,3,
 12, 12, 15, 15, 18, 18, 5, 5, 2, 22,25,8,8,
 15, 12, 18, 8, 21,21, 22,22, 23,23, 24,24,24
 ],
 //todo 益阳麻将抢海底胡牌
 [
 2, 4, 4, 4, 3,
 12, 12, 15, 15, 18, 18, 8,8, 2, 21, 22, 23,24,
 12, 15, 18, 8, 21,21, 22,22, 23,23,24,24,2
 ],
 //todo 益阳麻将将将胡接炮胡牌
 [
 4, 4, 4, 4, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8,  9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 25, 25, 25, 12,21, 24,23,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 1, 1, 1, 1, 3, 3,  2, 2, 2, 3,  23, 21, 22, 5,15,3,18,
 12, 12, 15, 15, 18, 18, 5, 5, 2, 22,25,8,8,
 15, 12, 18, 8, 21,21, 22,22, 23,23, 24,24,24
 ],
 //todo 益阳麻杠胡胡牌
 [
 4, 4, 4, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8,  9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 25, 25, 25, 12,21, 23,15,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 1, 1, 1, 1, 3, 3,  2, 2, 2, 3,  23, 21, 22, 5,15,18,3,4,
 12, 12, 15, 15, 18, 18, 5, 5, 2, 22,25,8,8,
 12, 18, 8, 21,21, 22,22, 23,23, 24,24,24,24
 ],
 //todo 益阳麻将杠牌测试
 [
 4, 2, 5, 5, 26, 26,
 24, 24,26,
 21, 21, 21, 21, 22,22,22,22, 23,23,23,23, 24,
 12, 12, 12, 15, 15, 15, 18, 18, 18, 18, 5, 2,5
 ],
 //todo 长沙麻将测试
 [
 4, 2, 5, 22, 29,
 26,
 21, 21, 27, 21, 25, 23,23,28, 24,24, 26,
 12, 12, 2, 15, 15, 25, 18, 18, 28, 28, 5, 2,8
 ],
 [
 4, 2, 5, 5, 26, 26,23,
 26,
 21, 21, 21, 21, 25, 23,23,23, 24,24, 24,
 12, 12, 12, 15, 15, 15, 18, 18, 18, 18, 5, 2,5
 ],
 //todo 长沙麻将测试
 [
 11, 11, 11, 11,  13, 13, 13, 13, 16, 16, 16, 16,
 24, 2, 5, 5, 26, 26,23,
 26,
 21, 21, 21, 21, 25, 23,23,23, 14,14, 14,
 12, 12, 12, 15, 15, 15, 18, 18, 18, 18, 5, 2,5
 ],
 //todo 长沙麻将杠牌测试
 [
 //11, 11, 11, 11,  13, 13, 13, 13, 16, 16, 16, 16,
 12, 12, 12, 12,  15, 15, 15, 15, 18, 28, 28, 28,
 2, 2, 2, 8, 8, 8, 8, 12, 15, 22, 22, 22, 22, 25, 25, 25, 28, 28,
 24, 2, 26, 26, 5, 5,23,
 26,
 21, 21, 21, 21, 25, 23,23,23, 14,14, 14,
 12, 12, 12, 15, 15, 15, 18, 18, 18, 18, 5, 2,5
 ],
 //todo 长沙麻将测试
 [
 22, 11, 11,
 12, 27, 26, 26, 6, 5,23,
 26,
 22, 22, 22, 23,23,24, 14,14,14, 21, 25,
 12, 12, 12, 15, 15, 15, 18, 18, 18, 18, 5, 2,5
 ],
 //todo 长沙麻将赌海底测试1
 [
 22, 11,
 12, 27, 25, 6, 5,23,
 26,
 22, 22, 22, 23,23,24, 2, 25, 21, 14, 16, 14,
 12, 13, 14, 15, 15, 16, 16, 16, 14, 2,7,8,11,
 11, 11, 25, 26, 27, 21, 21, 21, 7, 8, 1, 1, 19
 ],
 //todo 长沙麻将赌海底测试2
 [
 22, 11,
 12, 27, 25, 6, 5,23,
 26,
 22, 22, 22, 23,23,24, 2, 25, 11, 11, 16, 14,
 12, 13, 14, 15, 15, 16, 16, 16, 14, 2,7,8,11,
 11, 11, 25, 26, 27, 21, 21, 21, 7, 8, 1, 1, 19
 ],
 //todo 长沙麻将板牌操作设置
 [
 22, 11,
 12, 27, 25, 6, 5,23,
 26,
 22, 22, 22, 23,23,24, 2, 25, 11, 16, 14,3,
 12, 12, 13, 13, 14, 14, 16, 16, 14, 2,7,8,12,
 11, 11, 25, 25, 25, 21, 21, 21, 7, 8, 11, 9, 19
 ],
 //todo 益阳麻将快速胡牌
 [
 4, 4, 4, 4, 5, 5,
 6, 6, 6, 6,  7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9,
 11, 11, 11, 11,  13, 13, 13, 13, 14, 14, 14, 14,
 16, 16, 16, 16,  17, 17, 17, 17, 19, 19, 19, 19,
 21, 22, 23, 25, 25, 25, 25,
 26, 26, 26, 26,  27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29,
 1, 1, 1, 1,  2, 2, 2, 2, 3, 3, 3, 3, 5,
 12, 12, 12, 12, 15, 15, 15, 15, 18, 18, 18, 18, 5,
 21,21,21, 22,22,22, 23,23,23, 24,24,24, 24
 ],
 //todo 长沙麻将通炮测试
 [
 //11, 11, 11, 11,  13, 13, 13, 13, 16, 16, 16, 16,
 12, 12, 12, 12,  15, 15, 15, 15, 18, 28, 28, 28,
 2, 2, 2, 8, 8, 8, 8, 12, 15, 22, 22, 22, 22, 25, 25, 25, 28, 28,
 24, 21, 12, 12, 15, 25,
 12, 13, 14, 22, 23, 24, 7, 8, 9, 16, 17, 18, 25,
 12, 13, 14, 22, 23, 24, 7, 8, 9, 16, 17, 18, 25,
 12, 13, 14, 22, 23, 24, 7, 8, 9, 16, 17, 18, 25,
 12, 13, 14, 22, 23, 24, 7, 8, 9, 16, 17, 18, 25
 ],
 */
let pokers = [
    //todo 益阳麻将杠牌测试
    [
        24,16,
        11, 12, 13, 23, 24,25, 7, 8, 9, 7, 8, 9, 24,
        16, 16, 16, 15, 14, 13, 18, 18, 18, 24, 5, 5, 5
    ],

    //108张模式的一副牌
    [
        26,27,14,15,16,17,18,19,3,
        11,12,13,14,15,16,17,18,19,
        5,6,7,8,9,22,23,24,25,
        11,12,13,5,6,7,8,9,9,
        1,2,3,4,22,23,24,25,26,
        11,12,13,14,15,16,17,18,19,
        21,22,23,28,29,4,5,6,7,
        11,12,13,14,15,16,17,18,19,
        21,27,28,29,1,2,3,4,26,
        21,27,28,29,5,6,7,8,9,
        1,2,3,4,24,25,26,8,27,
        21,22,23,24,25,28,29,1,2
    ],

    //112张，带红中
    [
        26,27,14,15,16,17,18,19,3,
        11,12,13,14,15,16,17,18,19,35,
        5,6,7,8,9,22,23,24,25,
        11,12,13,5,6,7,8,9,9,
        1,2,3,4,22,23,24,25,26,35,
        11,12,13,14,15,16,17,18,19,
        21,22,23,28,29,4,5,6,7,
        11,12,13,14,15,16,17,18,19,35,
        21,27,28,29,1,2,3,4,26,
        21,27,28,29,5,6,7,8,9,
        1,2,3,4,24,25,26,8,27,35,
        21,22,23,24,25,28,29,1,2
    ],

    //136张带花牌
    [
        26,27,14,15,16,17,18,19,3,32,36,32,			        //筒子
        11,12,13,14,15,16,17,18,19,31,37,					//万子
        5,6,7,8,9,22,23,24,25,34,37,					    //筒子
        11,12,13,5,6,7,8,9,9,33,36,33,			            //万子
        1,2,3,4,22,23,24,25,26,35,34,					    //筒子
        11,12,13,14,15,16,17,18,19,37,35,34,			    //万子
        21,22,23,28,29,4,5,6,7,36,33,					    //索子
        11,12,13,14,15,16,17,18,19,31,32,					//万子
        21,27,28,29,1,2,3,4,26,35,31,35,			        //索子
        21,27,28,29,5,6,7,8,9,33,37,					    //索子
        1,2,3,4,24,25,26,8,27,32,36,					    //筒子
        21,22,23,24,25,28,29,1,2,34,31					    //索子
    ]
];

/**
 * 中鸟对照表
 * @type {*[]}
 */
let zhongNiao = [
    //2个人
    [
        0,      //1 中自己
        1,      //2 中对家
        0,      //3 中自己
        1,      //4 中对家
        0,      //5中自己
        1,      //6 中对家
        0,      //7中自己
        1,      //8 中对家
        0      //9 中自己
    ],

    //3个人
    [
        0,      //1 中自己
        1,      //2 中下手
        2,      //3 中上手
        0,      //4 中自己
        1,      //5 中下手
        2,      //6 中上手
        0,      //7 中自己
        1,      //8 中下手
        2      // 9 中上手
    ],

    //4个人
    [
        0,      //1 中自己
        1,      //2 中下手
        2,      //3 中对家
        3,      //4 中上手
        0,      //5 中自己
        1,      //6 中下手
        2,      //7 中对家
        3,      //8 中上手
        0      // 9 中自己
    ],

    //todo 2个人长沙，益阳
    [
        0,      //1 中自己
        -1,      //2 中对家
        1,      //3 中自己
        -1,      //4 中对家
        0,      //5中自己
        -1,      //6 中对家
        1,      //7中自己
        -1,      //8 中对家
        0      //9 中自己
    ],

    //todo 3个人益阳
    [
        0,      //1 中自己
        1,      //2 中下手
        2,      //3 中上手
        -1,     //4 中自己
        0,      //5 中自己（1->0 下手->自己）
        1,      //6 中上手
        2,      //7 中自己
        -1,     //8 中下手
        0       // 9 中自己(2->0上手->自己)
    ],

    //todo 3个人长沙
    [
        0,      //1 中自己
        1,      //2 中下手
        -1,     //3 中上手
        2,      //4 中自己
        0,      //5 中自己（1->0 下手->自己）
        1,      //6 中上手
        -1,     //7 中自己
        2,      //8 中下手
        0       // 9 中自己(2->0上手->自己)
    ],
];

/**
 * 动作等级
 * @param cbUserAction  动作
 * @returns {number}
 * @constructor
 */
mahjong_alg.mj_wik_action = {
    WIK_NULL    : 0x00000000,								//todo 没有类型  //过类型
    WIK_LEFT    : 0x00000001,								//todo 左吃类型
    WIK_CENTER  : 0x00000002,								//todo 中吃类型
    WIK_RIGHT   : 0x00000004,								//todo 右吃类型
    WIK_PENG    : 0x00000008,							    //todo 碰牌类型
    WIK_ANGANG  : 0x00000010,								//todo 暗杠类型
    WIK_MINGGANG: 0x00000020,								//todo 明杠类型
    WIK_DIANGANG: 0x00000040,								//todo 点杠类型
    WIK_CHI_HU  : 0x00000080,								//todo 点胡
    WIK_BU_ZHANG: 0x00000100,                               //todo 补张
    WIK_LUCK_HD:  0x00000200,                               //todo 赌海底
    WIK_BAOTING:  0x00000400,                               //todo 报听
    WIK_XIAO_HU:  0x00000800,                               //todo 小胡
    WIK_AN_BU  :  0x00001000,								//todo 暗补类型
    WIK_MING_BU:  0x00002000,								//todo 明补类型
    WIK_DIAN_BU:  0x00004000,								//todo 点补类型
    //todo 东南西北中发北
    WIK_DNBL:	  0x00010000,    							//todo 东南北左
    WIK_DNBC:	  0x00020000,   							//todo 东南北中
    WIK_DNBR:	  0x00040000,   							//todo 东南北右
    WIK_DXBL:	  0x00080000,   							//todo 东西北左
    WIK_DXBC:	  0x00100000,   							//todo 东西北中
    WIK_DXBR:	  0x00200000    							//todo 东西北右
};

//todo 小胡动作翻型
mahjong_alg.mj_xiao_hu_action =  {
    XIAO_HU_QUE_YI_SE       : 0x0001,               //todo 缺一色
    XIAO_HU_BAN_BAN         : 0x0002,               //todo 板板胡
    XIAO_HU_LIU_LIU         : 0x0004,               //todo 六六顺
    XIAO_HU_SI_XI           : 0x0008,               //todo 四喜           pai
    XIAO_HU_SI_XI_EX        : 0x0010,               //todo 中途四喜       pai
    XIAO_HU_YI_ZHI_HUA      : 0x0020,               //todo 一枝花         pai
    XIAO_HU_SAN_TONG        : 0x0040,               //todo 三同
    XIAO_HU_JIEJIE_GAO      : 0x0080,               //todo 节节高
};

mahjong_alg.mj_hu_action =  {
    /**
     * 不能胡
     */
    CHR_NULL                :   0x00000000,
    /**
     * 碰碰胡 2
     * @type {number}
     */
    CHR_PENGPENG_HU			:	0x00000001,                                 //碰碰胡
    CHR_JIANGJIANG_HU		:	0x00000002,									//将将胡 2
    CHR_QING_YI_SE			:	0x00000004,									//清一色 2
    /**
     * 七小对 2
     * @type {number}
     */
    CHR_QI_XIAO_DUI			:	0x00000008,									//七小对 2
    CHR_HAOHUA_QI_XIAO_DUI	:	0x00000010,									//豪华七小对 4
    CHR_QIXIAODUI_HAOHUA_C  :	0x00000020,									//超豪华七小对 6
    CHR_QIXIAODUI_HAOHUA_CC  :	0x00000040,									//超超豪华七小对 8
    CHR_GANG_KAI			:	0x00000080,									//杠上开花  (杠牌后不能换牌) 2
    CHR_QIANG_GANG_HU		:	0x00000100,									//抢杠胡 2 + 翻型
    CHR_GANG_SHANG_PAO		:	0x00000200,									//杠上炮 2 + 翻型
    CHR_QISHOU_HU   		:	0x00000400,									//起手胡 2
    CHR_DAODI_HU		    :	0x00000800,									//倒地胡(可+胡其他翻型) 2
    CHR_DI_HU			    :	0x00001000,									//地胡 2
    CHR_DIDI_HU    	        :	0x00002000,									//地地胡 4
    CHR_TIAN_HU     		:	0x00004000,									//天胡 3
    CHR_TIANTIAN_HU 	    :	0x00008000,									//天天胡 5
    CHR_TIAN_TIANTIAN_HU	:	0x00010000,									//天天天胡 7
    CHR_BAN_BAN_HU		    :	0x00020000,									//板板胡(黑天胡) 2
    CHR_BAOTING_HU		    :	0x00040000,									//报听胡   (报听不能换牌) 2
    CHR_YING_ZHUANG		    :	0x00080000,									//硬庄 * 2
    CHR_SOFT_ZHUANG		    :	0x00100000,									//平胡 1
    CHR_QUAN_QUI_REN        :	0x00200000,									//全求人 4
    CHR_MENG_QING           :	0x00400000,									//门清 4
    CHR_HAI_DI              :	0x00800000,									//海底 4
    CHR_CHI_HU				:	0x01000000,  								//胡牌 （小门子胡牌）
};

mahjong_alg.small_over_type = {
    ZIMO: 0,
    JIEPAO: 1,             //接炮
    DIANPAO: 2,            //--点炮
    NOTHING: 3,            //打酱油了
    QIANG_GANG: 4,         //抢杠胡
    KAI_GANG:5,            //开杠胡
    LOSE:6,                //丢分

    JIESAN: 0,             //解散
    LIUJU: 1,              //流局
    HUPAI: 2,              //胡牌
};

mahjong_alg.MAX_INDEX = 37;    //最大索引

//todo (1)、是否为大四喜--玩家手上已有4张一样的牌，即可胡牌(四喜计分等同小胡自摸)
mahjong_alg.has_dasixi = function(hand, vt, excludes) {
    for(let i=0; i< 30; i++)
    {
        if(hand[i] === 4){
            if (excludes !== undefined)
            {
                if (Array.isArray(excludes))
                {
                    if (excludes.indexOf(i) === -1)
                    {
                        vt.push(i);
                    }
                }
                else
                {
                    if (i !== parseInt(excludes))
                    {
                        vt.push(i);
                    }
                }
            }
            else
            {
                vt.push(i);
            }
        }
    }
    return vt.length > 0;
};

//todo (2)、 板板胡:  起牌后，玩家手上没有一张2.5.8(将牌)，即可胡牌(等同小胡自摸)
mahjong_alg.is_banbanhu = function(hand) {
    for(let i=1; i<30; i++) {
        if(hand[i] > 0)
        {
            let val = mjutils.card_val(i);
            if(val  === 2 || i === 5 || i === 8) {
                return false;
            }
        }
    }
    return true;
};

//todo (3)、缺一色:  起牌后，玩家手上筒、索、万任缺一门，即可胡牌(等同小胡自摸)
mahjong_alg.is_queyise = function(hand, vt) {
    let typeList = new Set();
    let len = hand.length;
    for(let i=0; i<len; i++)
    {
        let pai = hand[i];
        typeList.add(parseInt(pai / 10));
    }

    if (typeList.size() < 3)
    {
        for (let i = 0; i < 3; i++)
        {
            if (false === typeList.has(i))
            {
                vt.push(i);
            }
        }
        return true;
    }

    return false;
};

//todo (4)、六六顺:  起牌后，玩家手上已有2个刻子(刻子：3个一样的牌)，即可胡牌(等同小胡自摸)。
mahjong_alg.is_liuliushun = function(hand, vt) {
    let vt1 = [];
    for(let i=0; i<30; i++)
    {
        if(hand[i] >= 3)
        {
            vt1.push(i);
        }
    }

    let len = vt1.length;
    //todo 需要减掉一组
    if (len === 3)
    {
        //console.log("vt1 len ", len , "vt1", vt1);
        let cnt = 0;
        let yiJiang = false;
        for (let i = 0; i < len; ++i)
        {
            let val = mjutils.card_val(vt1[i]);
            if ( (yiJiang === false) && ( (val=== 2) || (val=== 5) || (val=== 8)) )
            {
                yiJiang = true;
            }
            else
            {
                if (cnt < 2)
                {
                    cnt++;
                    vt.push(vt1[i]);
                }
            }
        }
    }
    else
    {
        if (len >= 2)
        {
            for (let i = 0; i < len; i++)
            {
                vt.push(vt1[i])
            }
        }
    }

    return vt.length >= 2;
};

//todo (4.1)、六六顺： 获得六六顺牌值。
mahjong_alg.get_liuliushun = function(hand) {
    let vt = [];
    for(let i=0; i<30; i++)
    {
        if(hand[i] >= 3)
        {
            vt.push(i);
        }
    }

    if (vt.length >= 2)
    {
        return vt;
    }

    return [];
};

//todo (5)、节节高：发完牌后，玩家手上有3连对将且同花色，例如2个1万，2个2万，2个3万。(等同小胡自摸)
mahjong_alg.is_jiejiegao = function(hand, vt) {
    let bHas = false;
    for(let i=1; i<8; i++)
    {
        //防止花色越界
        //if(i%10===0 || ((parseInt(i/10) === 3) && i%10 > 7) )
        //{
        //   continue;
        //}

        if ((hand[i] >= 2)  && (hand[i+1]>=2) && (hand[i+2] >=2))
        {

            bHas = true;
            vt.push(i);
        }
        if ((hand[i+ 10] >= 2)  && (hand[i+11]>=2) && (hand[i+12] >=2))
        {

            bHas = true;
            vt.push(i+10);
        }
        if ((hand[i + 20] >= 2)  && (hand[i+21]>=2) && (hand[i+22] >=2))
        {

            bHas = true;
            vt.push(i+20);
        }

    }

    return bHas;
};

//todo (6) 3同：起完牌后，玩家手上有3对点数相同的3门牌，例如2个1万，2个1筒，2个1条。(等同小胡自摸)
mahjong_alg.is_santong = function(cards, vt) {
    let bHas = false;
    for (let i=1; i< 10; i++){
        if(cards[i] >= 2
            &&cards[i+10] >= 2
            &&cards[i+20] >= 2){

            bHas = true;
            vt.push(i);
            //result[i] += 2;
        }
    }
    return bHas;
};

//todo (6.1) 获得三同的牌值
mahjong_alg.get_santong_vals = function(cards) {
    let val_t = [];
    for (let i=1; i< 10; i++){
        if(cards[i] >= 2
            &&cards[i+10] >= 2
            &&cards[i+20] >= 2){

            val_t.push(i);
        }
    }
    return val_t;
};

/* todo    (7)、一枝花:
满足以下任意一种情况:
1、发完牌后，玩家手牌中只有一只将牌，且这张将牌为"5"，即可胡牌(等同小胡自摸)
2、发完牌后，玩家手牌中某花色只有一张，且这张牌为"5"，即可胡牌(等同小胡自摸)*/
mahjong_alg.is_yizhihua = function(hand, vt) {
    let otherCnt = hand[2] + hand[12] + hand[22];
    otherCnt = otherCnt + hand[8] + hand[18] + hand[28];
    let Cnt5 = hand[5] + hand[15] + hand[25];

    if (otherCnt > 0 || Cnt5 > 1)
    {
        //todo 色一枝花
        let cnts = [0, 0, 0];
        for (let i = 1; i < 10; i++)
        {
            cnts[0] += hand[i];
            cnts[1] += hand[10 + i];
            cnts[2] += hand[20 + i];
        }

        if (cnts[0] === 1 && hand[5] === 1)
        {
            vt.push(5);
        }

        if (cnts[1] === 1 && hand[15] === 1)
        {
            vt.push(15);
        }

        if (cnts[2] === 1 && hand[25] === 1)
        {
            vt.push(25);
        }

        return (vt.length > 0);
    }

    //todo 将一枝花
    if (Cnt5 === 1)
    {
        if (hand[5] === 1)
        {
            vt.push(5);
        }

        if (hand[15] === 1)
        {
            vt.push(15);
        }

        if (hand[25] === 1)
        {
            vt.push(25);
        }
        return (vt.length > 0);
    }

    return 0;
};

//todo (8) 全求人
mahjong_alg.is_quan_qiu_ren = function(hand) {
    let len = hand.length;
    let pai = -1;
    let cnt = 0;
    for (let i = 0; i < len; ++i)
    {
        let c = hand[i];
        if (c !== undefined && c > 0)
        {
            cnt += c;
            if (pai === -1)
            {
                pai = i;
            }
            else
            {
                return false;
            }
        }
    }

    if (cnt === 2 && pai > -1)
    {
        return true;
    }

    /**
    if (len !== 2)
    {
        return false;
    }

    if (hand[0] === hand[1])
    {
        return true;
    }
     */
    return false;
};

//todo (9) 是否门清
mahjong_alg.is_meng_qing = function(weaveItems) {
    //检查是否是对对胡 如果没有吃
    let len = weaveItems.length;
    //return (len === 0);
    let is_mqing = true;
    for (let i = 0; i < len; ++i)
    {
        let weave = weaveItems[i];
        if (weave !== undefined && ( (weave.cbWeaveKind & this.mj_wik_action.WIK_ANGANG) !==  this.mj_wik_action.WIK_ANGANG ))
        {
            is_mqing = false;
        }
    }

    return is_mqing;
};

/**
 * 清一色判断，胡牌有效
 * @param holds
 * @param weatItems
 * @param curCard
 * @returns {boolean}
 */
mahjong_alg.isQingYiSe = function(holds, weatItems, curCard){

    let color = [0, 0, 0];

    if (curCard !== undefined) {
        let cc = mjutils.card_type(curCard);
        if (cc < 0 || cc > 2) {
            console.log("isQingYiSe cc except: ", cc);
        }
        else {
            if (color[cc] === 0) {
                color[cc] = 1;
            }
        }
    }

    for(let i = 0; i < holds.length; ++i){
        let item = holds[i];
        {
            let cc = mjutils.card_type(item);
            if (cc < 0 || cc > 2)
            {
                console.log("isSameType cc except: ", cc);
            }
            else
            {
                if (color[cc] === 0)
                {
                    color[cc] = 1;
                }
            }
        }
    }

    for (let i = 0; i < weatItems.length; ++i)
    {
        let item = weatItems[i];

        let cc = mjutils.card_type(item.cbCenterCard);
        if (cc < 0 || cc > 2)
        {
            console.log("isSameType cc except: ", cc);
        }
        else
        {
            if (color[cc] === 0)
            {
                color[cc] = 1;
            }
        }
    }

    let num = color[0] + color[1] + color[2];

    //console.log("清一色判定 牌的颜色种类共（", num, "）种, 分别为：万（", color[0], "）种, 条（", color[1],"）种,筒（",color[2] , "）种.");

    return (num ===1);
};

/**
 * 清一色，胡牌有效
 * @param holds
 * @param weaveItems
 * @param curCard
 * @param magics
 * @returns {boolean}
 */
mahjong_alg.is_soft_QingYiSe = function(holds, weaveItems, magics, curCard){
    let color = [0, 0, 0];

    let fn = function (arr, magics) {
        //let curType = -1;
        if (Array.isArray(arr))
        {
            for(let i = 0; i < arr.length; ++i){
                let item = arr[i];
                if (typeof item === "number")
                {
                    if (magics === undefined || (magics !== undefined && magics.indexOf(item) === -1)) {
                        let tempType = mjutils.card_type(item);
                        if (tempType > 2)
                        {
                            console.log("检查清一色时，牌值类型异常, 异常牌为(", item, ").");
                        }
                        if (color[tempType] === 0)
                        {
                            color[tempType] = 1;
                        }
                    }
                }
                else
                {
                    let tempType = mjutils.card_type(item.cbCenterCard);
                    if (tempType > 2)
                    {
                        console.log("检查清一色时，牌值类型异常, 异常牌为(", item, ").");
                    }
                    if (color[tempType] === 0)
                    {
                        color[tempType] = 1;
                    }
                }
            }

        }

        //统计牌的颜色
        //let num = color[0] + color[1] + color[2];

        //console.log("当前牌的颜色种类共（", num, "）种, 分别为：万（", color[0], "）种, 条（", color[1],"）种,筒（",color[2] , "）种.");
        //return (num <= 1);

    };

    if (curCard !== undefined) {
        if (magics === undefined || (magics !== undefined && magics.indexOf(curCard) === -1)) {
            let cc = mjutils.card_type(curCard);
            if (cc < 0 || cc > 2) {
                console.log("isQingYiSe cc except: ", cc);
            }
            else {
                if (color[cc] === 0) {
                    color[cc] = 1;
                }
            }
        }
    }

    fn(holds, magics);
    fn(weaveItems, magics);

    let num = color[0] + color[1] + color[2];

    //console.log("当前牌的颜色种类共（", num, "）种, 分别为：万（", color[0], "）种, 条（", color[1],"）种,筒（",color[2] , "）种.");

    //return true;
    return (num <= 1);
};

/**
 * 将将胡听
 * @param cards
 * @param weaveItems
 * @returns {boolean}
 */
mahjong_alg.is_jiangjiang = function(cards, weaveItems){
    let self = this;
    let fn = function(arr){
        for(let i = 0; i < arr.length; ++i){
            if (i === 10 || i === 20 || i === 30) continue;

            let pai = arr[i];
            if (typeof pai === "number") {
                if (pai > 0) {
                    if (!mjutils.is_258(i)) {
                        return false;
                    }
                }
            }
            else
            { //wea
                if ((pai.cbWeaveKind & (self.mj_wik_action.WIK_LEFT | self.mj_wik_action.WIK_CENTER | self.mj_wik_action.WIK_RIGHT)) > 0)
                {
                    return false;
                }

                if ( ! mjutils.is_258(pai.cbCenterCard))
                {
                    return false;
                }
            }
        }

        //检查王是否为将
        return true;
    };

    //已经完成了的组合
    if(fn(weaveItems) === false){
        return false;
    }
    if(fn(cards) === false){
        return false;
    }

    return true;
};

/**
 * 带癞子的将将胡听
 * @param cards
 * @param weaveItems
 * @param magics      //癞子牌数组表
 * @returns {boolean}
 */
mahjong_alg.is_soft_jiangjiang = function(cards, weaveItems, magics){
    let self = this;
    let use_magic_times = 0;
    let fn = function(arr){
        for(let i = 0; i < arr.length; ++i){
            let pai = arr[i];
            if (typeof pai === "number") {
                if (pai > 0) {
                    let val = mjutils.card_val(i);
                    if (val !== 2 && val !== 5 && val !== 8) {
                        if (magics !== undefined && magics.indexOf(i) !== -1) {
                            use_magic_times++;
                        }
                        else {
                            return false;
                        }
                    }
                }
            }
            else
            { //wea
                if ((pai.cbWeaveKind & (self.mj_wik_action.WIK_LEFT | self.mj_wik_action.WIK_CENTER | self.mj_wik_action.WIK_RIGHT)) > 0)
                {
                    return false;
                }

                let va = mjutils.card_val(pai.cbCenterCard);
                if (va !== 2 && va !== 5 && va !== 8)
                {
                    return false;
                }
            }
        }

        //检查王是否为将
        return true;
    };

    //已经完成了的组合
    if(fn(weaveItems) === false){
        return false;
    }
    if(fn(cards) === false){
        return false;
    }

    return true;
};

/**
 *  带癞子的七对分析
 * @param countMap  手牌牌数表
 * @param weaveItems 已经操作过的组合
 * @param magics     癞子
 * @returns {number} 是七小对的类别， 0：表示不是七小对
 */
mahjong_alg.is_soft_qidui = function(countMap, weaveItems, magics, haveHaoQi) {
    let self = this;
    if(weaveItems.length > 0)
    {
        return 0;
    }

    //有5对牌
    let cards = countMap.slice(0);
    let gui_num = 0;
    if (magics[0] !== undefined && magics[0] !== 0) {
        gui_num += cards[magics[0]];
        cards[magics[0]] = 0;
    }
    if (magics[1] !== undefined && magics[1] !== 0) {
        gui_num += cards[magics[1]];
        cards[magics[1]] = 0;
    }

    let singleCount = 0;    //单牌数量
    let pairCount2 = 0;     //4个数量
    let pairCount = 0;

    for(let k = 1; k < cards.length; ++k){
        let c = cards[k];
        if (c===0)
        {
            continue;
        }

        switch (c)
        {
            case 1:
                singleCount++;
                break;

            case 2:
                pairCount++;
                break;
            case 3:
                pairCount++;
                singleCount++;
                break;
            case 4:
                pairCount += 2;
                pairCount2 ++;
                break;
            default:
                break;

        }
    }

    //检查是否有6对 并且单牌是不是目标牌
    if(singleCount <=  gui_num ){
        let mask = 0;
        if (haveHaoQi !== undefined && true === haveHaoQi) {
            switch (pairCount2) {
                case 1:
                    mask = self.mj_hu_action.CHR_HAOHUA_QI_XIAO_DUI;
                    break;

                case 2:
                    mask = self.mj_hu_action.CHR_QIXIAODUI_HAOHUA_C;
                    break;

                case 3:
                    mask = self.mj_hu_action.CHR_QIXIAODUI_HAOHUA_CC;
                    break;
                default:
                    mask = self.mj_hu_action.CHR_QI_XIAO_DUI;
            }
        }
        else{
            mask = self.mj_hu_action.CHR_QI_XIAO_DUI;
        }

        return mask;
    }

    return 0;
};

/**
 * 是硬七对
 *
 * @param countMap  手牌牌数表
 * @param weaveItems 已经操作过的组合
 * @returns {number} 是七小对的类别， 0：表示不是七小对
 */
mahjong_alg.is_hard_qidui = function(countMap, weaveItems, haveHaoQi) {
    let self = this;
    if(weaveItems.length > 0)
    {
        return 0;
    }

    let pairCount2 = 0;
    let pairCount = 0;
    for(let k in countMap){
        let c = countMap[k];
        if (c===0)
        {
            continue;
        }
        if( c === 2 ){
            pairCount++;
        }
        else if(c === 4){
            pairCount += 2;
            pairCount2 += 1;
        }

        if(c === 1 || c === 3){
            //如果已经有单牌了，表示不止一张单牌，并没有下叫。直接闪
            return 0
        }
    }

    //检查是否有6对 并且单牌是不是目标牌
    if(pairCount === 7){
        //七对只能和一张，就是手上那张单牌
        //七对的番数＝ 2番+N个4个牌（即龙七对）
        let mask = 0;
        if (haveHaoQi !== undefined && true === haveHaoQi)
        {
            switch (pairCount2)
            {
                case 1:
                    mask = self.mj_hu_action.CHR_HAOHUA_QI_XIAO_DUI;
                    break;
                case 2:
                    mask = self.mj_hu_action.CHR_QIXIAODUI_HAOHUA_C;
                    break;
                case 3:
                    mask = self.mj_hu_action.CHR_QIXIAODUI_HAOHUA_CC;
                    break;
                default:
                    mask = self.mj_hu_action.CHR_QI_XIAO_DUI;
            }
        }
        else
        {
            mask = self.mj_hu_action.CHR_QI_XIAO_DUI;
        }

        return mask;
    }

    return 0;
};

/**
 * 带癞子的碰碰胡
 * @param countMap
 * @param weaveItems
 * @param magics
 * @returns {boolean}
 */
mahjong_alg.is_soft_pengpeng = function(countMap, weaveItems, magics){
    //检查是否是对对胡 如果没有吃
    let self = this;
    let checkPengPeng = true;
    for (let i = 0; i < weaveItems.length; ++i)
    {
        let weave = weaveItems[i];
        if (weave !== undefined && ((weave.cbWeaveKind & (self.mj_wik_action.WIK_LEFT | self.mj_wik_action.WIK_RIGHT | self.mj_wik_action.WIK_CENTER) ) > 0) )
        {
            checkPengPeng = false;
            break;
        }
    }

    if ( checkPengPeng )
    {
        let cards = countMap.slice(0);

        let gui_num = 0;
        if (magics[0] !== undefined && magics[0] !== 0) {
            gui_num += cards[magics[0]];
            cards[magics[0]] = 0;
        }
        if (magics[1] !== undefined && magics[1] !== 0) {
            gui_num += cards[magics[1]];
            cards[magics[1]] = 0;
        }

        // 由于没有吃，所以只需要检查手上的牌
        //对对胡叫牌有两种情况
        //1、N坎 + 1张单牌
        //2、N-1坎 + 两对牌
        let singleCount = 0;
        let pairCount = 0;
        let need_gui = 0;
        let total = 0;

        for(let i = 1; i < cards.length; ++i){
            let c = cards[i];
            if (c === 0 ) continue;

            total += c;
            if(c === 1){
                singleCount++;
            }
            else if(c === 2){
                pairCount++;
            }
            else if(c === 4){
                return false;
            }
        }

        if (singleCount > 0 || pairCount > 0)
        {
            pairCount--;    //先确定将

            need_gui = pairCount +  singleCount * 2;

            pairCount = 1;
        }
        else if (singleCount > 0)
        {
            need_gui = (singleCount - 1) * 2 + 1;

            pairCount = 1;
        }
        else if( pairCount > 0)
        {
            need_gui = pairCount - 1;
            pairCount = 1;
        }

        //if((pairCount === 2 && singleCount == 0) || (pairCount == 0 && singleCount == 1) ){
        if ((pairCount=== 1 &&  need_gui === gui_num ) && (((total + gui_num) % 3) === 2))  {
            return true;
        }
    }

    return false;
};

/**
 * 不带癞子的碰碰胡
 * @param countMap
 * @param weaveItems
 * @returns {boolean}
 */
mahjong_alg.is_hard_pengpeng = function(countMap, weaveItems){
    let self = this;
    //检查是否是对对胡 如果没有吃
    let checkPengPeng = true;
    for (let i = 0; i < weaveItems.length; ++i)
    {
        let weave = weaveItems[i];
        if (weave !== undefined && (weave.cbWeaveKind & (self.mj_wik_action.WIK_LEFT | self.mj_wik_action.WIK_RIGHT | self.mj_wik_action.WIK_CENTER) ) > 0)
        {
            checkPengPeng = false;
            break;
        }
    }
    if ( checkPengPeng )
    {
        // 由于没有吃，所以只需要检查手上的牌
        //对对胡叫牌有两种情况
        //1、N坎 + 1张单牌
        //2、N-1坎 + 两对牌
        let pairCount = 0;
        let singleCount = 0;
        let total = 0;
        for(let i = 1; i < countMap.length; ++i){
            let c = countMap[i];
            if (c === 0 ) continue;

            total += c;
            if(c === 1 || c === 4){
                singleCount++;
                return false;
            }
            else if(c === 2){
                pairCount++;
            }
        }

        //if((pairCount === 2 && singleCount == 0) || (pairCount == 0 && singleCount == 1) ){
        if(pairCount === 1 && singleCount === 0 ){
            //console.log("peng peng countMap.len= " , countMap.length, "countMap", countMap);
            return true;
        }
    }

    return false;
};


/**
 * 从卡牌中删除
 * @param aryCardBuffer
 * @param aryRemove
 * @param begin
 * @param removeCount
 */
mahjong_alg.canRemoveCards = function(aryCardBuffer, aryRemove, begin, removeCount) {
    //
    for (let i = begin; i < removeCount; i++)
    {
        if (aryCardBuffer[aryRemove[i]] <= 0 ) {
            console.log("不能丢弃牌", aryRemove);
            return false;
        }
    }
    return true;
};

mahjong_alg.getWeaveCard = function(cbWeaveKind, cbCenterCard, cbCardBuffer){
    let self = this;
    //组合扑克
        switch (cbWeaveKind)
        {
            case self.mj_wik_action.WIK_LEFT:		//上牌操作
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard;
                cbCardBuffer[1]=cbCenterCard+1;
                cbCardBuffer[2]=cbCenterCard+2;

                return 3;
            }
            case self.mj_wik_action.WIK_RIGHT:		//上牌操作
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard;
                cbCardBuffer[1]=cbCenterCard-1;
                cbCardBuffer[2]=cbCenterCard-2;

                return 3;
            }
            case self.mj_wik_action.WIK_CENTER:	//上牌操作
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard;
                cbCardBuffer[1]=cbCenterCard-1;
                cbCardBuffer[2]=cbCenterCard+1;

                return 3;
            }
            case self.mj_wik_action.WIK_PENG:		//碰牌操作
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard;
                cbCardBuffer[1]=cbCenterCard;
                cbCardBuffer[2]=cbCenterCard;

                return 3;
            }
            case self.mj_wik_action.WIK_DIANGANG:		//杠牌操作
            case self.mj_wik_action.WIK_ANGANG:		//杠牌操作
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard;
                cbCardBuffer[1]=cbCenterCard;
                cbCardBuffer[2]=cbCenterCard;
                cbCardBuffer[3]=cbCenterCard;

                return 4;
            }
            case self.mj_wik_action.WIK_DNBL:    						//todo 东南北左
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard+1;
                cbCardBuffer[1]=cbCenterCard+3;
                cbCardBuffer[2]=cbCenterCard;

                return 3;
            }
            case self.mj_wik_action.WIK_DNBC:   						//todo 东南北中
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard-1;
                cbCardBuffer[1]=cbCenterCard;
                cbCardBuffer[2]=cbCenterCard+2;

                return 3;
            }
            case self.mj_wik_action.WIK_DNBR:							//todo 东南北右
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard-3;
                cbCardBuffer[1]=cbCenterCard-2;
                cbCardBuffer[2]=cbCenterCard;

                return 3;
            }
            case self.mj_wik_action.WIK_DXBL:							//todo 东西北左
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard+2;
                cbCardBuffer[1]=cbCenterCard+3;
                cbCardBuffer[2]=cbCenterCard;

                return 3;
            }
            case self.mj_wik_action.WIK_DXBC:							//todo 东西北中
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard-2;
                cbCardBuffer[1]=cbCenterCard;
                cbCardBuffer[2]=cbCenterCard+1;

                return 3;
            }
            case self.mj_wik_action.WIK_DXBR:							//todo 东西北右
            {
                //设置变量
                cbCardBuffer[0]=cbCenterCard-3;
                cbCardBuffer[1]=cbCenterCard-1;
                cbCardBuffer[2]=cbCenterCard;

                return 3;
            }

            default:
            {
                console.log("玩家操作无效 getWeaveCard", cbWeaveKind);
            }
        }

        return 0;
    };

mahjong_alg.GetUserActionRank = function(cbUserAction) {
        let self = this;
        //todo 操作等级(胡牌及小胡等级最高)
        //if ((cbUserAction & (self.mj_wik_action.WIK_CHI_HU | self.mj_wik_action.WIK_XIAO_HU)) > 0) { return 6; }
        if ((cbUserAction & self.mj_wik_action.WIK_XIAO_HU) > 0) { return 6; }

        if ((cbUserAction & self.mj_wik_action.WIK_CHI_HU) > 0) { return 5; }

        if ((cbUserAction & self.mj_wik_action.WIK_BAOTING) === self.mj_wik_action.WIK_BAOTING) { return 4; }

        //杠牌等级
        if ((cbUserAction & (self.mj_wik_action.WIK_ANGANG | self.mj_wik_action.WIK_MINGGANG | self.mj_wik_action.WIK_DIANGANG | self.mj_wik_action.WIK_BU_ZHANG )) > 0) { return 3; }

        //碰牌等级
        if ((cbUserAction & self.mj_wik_action.WIK_PENG) === self.mj_wik_action.WIK_PENG) { return 2; }

        //上牌等级
        if ((cbUserAction & (self.mj_wik_action.WIK_RIGHT|self.mj_wik_action.WIK_CENTER|self.mj_wik_action.WIK_LEFT
            | self.mj_wik_action.WIK_DNBL | self.mj_wik_action.WIK_DNBC | self.mj_wik_action.WIK_DNBR | self.mj_wik_action.WIK_DXBL | self.mj_wik_action.WIK_DXBC | self.mj_wik_action.WIK_DXBR )) > 0 ) { return 1; }
        //if (cbUserAction&(WIK_RIGHT | WIK_CENTER | WIK_LEFT | WIK_DNBL | WIK_DNBC | WIK_DNBR | WIK_DXBL | WIK_DXBC | WIK_DXBR)) { return 1; }

        return 0;
    };

    /**
     * 获取一副扑克牌
     * @param type true 108张模式
     */
    mahjong_alg.getPokers = function (type) {
        //let _pokers = pokers[type ? 1 : 0].slice(0);
		let _pokers = pokers[type].slice(0);

		if (type === 0)
        {
			return _pokers;
		}

        //混牌
        _pokers.forEach(function (n, i) {
            let ii = parseInt(Math.random() * (_pokers.length - i));
            //console.log("测试牌位置点：n（",n, "）， i（",i,"），ii（",ii,"），_pokers[ii]（",_pokers[ii],"）");

            _pokers[i] = _pokers[ii];
            _pokers[ii] = n;
        });

		pokers[type] = _pokers.slice(0);

        //console.log("测试牌：_pokers（",_pokers,"）");

        return _pokers;
    };

    /**
     * 获得对应座位中鸟的数量,
     * @param renshu
     * @param curSeatId  胡牌为庄的计算方法：胡牌玩家座位，庄闲：庄家座位ID
     * @param cards
     * @param is_159
     * @returns {any[]} //座位对应的鸟数
     */
    mahjong_alg.getZhongNiaoNums = function(renshu, curSeatId, cards, is_159, have_hz){
        if (have_hz === undefined)
        {
            have_hz = false;
        }
        //console.log("中鸟方式是否为159", is_159);
        let seatNiaos = new Array(renshu);
        //初始化座位中鸟的数量
        for (let i=0; i < renshu; ++i)
        {
            seatNiaos[i] = 0;
        }

        if (cards.length === 0)
        {
            return seatNiaos;
        }

        //中1 5 9
        if (is_159)
        {
            if (Array.isArray(cards))
            {
                for (let i = 0; i < cards.length; ++i)
                {
                    let val = parseInt(cards[i]);
                    val = mjutils.card_val(val);
                    if (val === 1 || val === 5 || val === 9)
                    {
                        seatNiaos[curSeatId]++;
                    }
                }
            }
            else
            {
                let val = parseInt(cards);
                val = mjutils.card_val(val);
                if (val === 1 || val === 5 || val === 9)
                {
                    seatNiaos[curSeatId]++;
                }
            }

            //return seatNiaos;
        }
        else {
            //鸟必中
            let niaoArry = [];
            switch (renshu) {
                case 2:
                    niaoArry = zhongNiao[0].slice(0);
                    break;
                case 3:
                    niaoArry = zhongNiao[1].slice(0);
                    break;
                case 4:
                    niaoArry = zhongNiao[2].slice(0);
                    break;

                default:
                    return seatNiaos;
            }

            if (Array.isArray(cards)) {
                for (let i = 0; i < cards.length; ++i) {
                    let val = parseInt(cards[i]);
                    if (have_hz && val === 35)
                    {
                        seatNiaos[curSeatId]++;
                    }
                    else {
                        val = mjutils.card_val(val);
                        if (val > 0 && val < 10) {
                            let seat = (niaoArry[val - 1] + curSeatId) % renshu;
                            seatNiaos[seat]++;
                        }
                    }
                }
            }
            else {
                let val = parseInt(cards);
                if (have_hz && val === 35)
                {
                    seatNiaos[curSeatId]++;
                }
                else {
                    val = mjutils.card_val(val);
                    if (val > 0 && val < 10) {
                        let seat = (niaoArry[val - 1] + curSeatId) % renshu;
                        seatNiaos[seat]++;
                    }
                }
            }

            //return seatNiaos;
        }
        return seatNiaos;
    };

/**
 * 获得对应座位中鸟的数量,
 * @param renshu
 * @param curSeatId  胡牌为庄的计算方法：胡牌玩家座位，庄闲：庄家座位ID
 * @param cards
 * @param is_159
 * @returns {any[]} //座位对应的鸟数
 */
mahjong_alg.getZhongNiaoNumsYiYang = function(renshu, curSeatId, cards){
    let seatNiaos = new Array(renshu);
    //初始化座位中鸟的数量
    for (let i=0; i < renshu; ++i)
    {
        seatNiaos[i] = 0;
    }

    if (cards.length === 0)
    {
        return seatNiaos;
    }

    //鸟必中
    let niaoArry = [];
    switch (renshu) {
        case 2:
            niaoArry = zhongNiao[3].slice(0);
            break;
        case 3:
            niaoArry = zhongNiao[4].slice(0);
            break;
        case 4:
            niaoArry = zhongNiao[2].slice(0);
            break;

        default:
            return seatNiaos;
    }

    if (Array.isArray(cards)) {
        for (let i = 0; i < cards.length; ++i) {
            let val = parseInt(cards[i]);
            val = mjutils.card_val(val);
            if (val > 0 && val < 10) {
                if ( niaoArry[val - 1] > -1) {
                    let seat = (niaoArry[val - 1] + curSeatId) % renshu;
                    seatNiaos[seat]++;
                }
            }
        }
    }
    else {
        let val = parseInt(cards);
        {
            val = mjutils.card_val(val);
            if (val > 0 && val < 10) {
                if (niaoArry[val - 1] > -1) {
                    let seat = (niaoArry[val - 1] + curSeatId) % renshu;
                    seatNiaos[seat]++;
                }
            }
        }
    }

    return seatNiaos;
};

/**
 * 获得对应座位中鸟的数量,
 * @param renshu
 * @param curSeatId  胡牌为庄的计算方法：胡牌玩家座位，庄闲：庄家座位ID
 * @param cards
 * @param is_159
 * @returns {any[]} //座位对应的鸟数
 */
mahjong_alg.getZhongNiaoNumsCS = function(renshu, curSeatId, cards){
    let seatNiaos = new Array(renshu);
    let result = {
        seat: seatNiaos,
        cardMap: []
    };

    //初始化座位中鸟的数量
    for (let i=0; i < renshu; ++i)
    {
        seatNiaos[i] = 0;
    }

    if (cards.length === 0)
    {
        return result;
    }

    //鸟必中
    let niaoArry = [];
    switch (renshu) {
        case 2:
            niaoArry = zhongNiao[3].slice(0);
            break;
        case 3:
            niaoArry = zhongNiao[5].slice(0);
            break;
        case 4:
            niaoArry = zhongNiao[2].slice(0);
            break;

        default:
            return result;
    }

    if (Array.isArray(cards)) {
        for (let i = 0; i < cards.length; ++i) {
            let val_card = parseInt(cards[i]);
            let val = mjutils.card_val(val_card);
            if (val > 0 && val < 10) {
                if ( niaoArry[val - 1] > -1) {
                    let seat = (niaoArry[val - 1] + curSeatId) % renshu;
                    seatNiaos[seat]++;
                    result.cardMap.push({seatId: seat, card: val_card});
                }
            }
        }
    }
    else {
        let val_card = parseInt(cards);
        {
            let val = mjutils.card_val(val_card);
            if (val > 0 && val < 10) {
                if (niaoArry[val - 1] > -1) {
                    let seat = (niaoArry[val - 1] + curSeatId) % renshu;
                    seatNiaos[seat]++;

                    result.cardMap.push({seatId: seat, card: val_card});
                }
            }
        }
    }

    return result;
    //seatNiaos;
};

// todo: test
let test = function () {
    let _pokers = pokers[0].slice(0);
    let cbLeftCardCount = _pokers.length;
    console.log("0:  cbLeftCardCount= ", cbLeftCardCount, ", leftCards: ", _pokers)

    cbLeftCardCount -= 13;
    let holds = _pokers.splice(cbLeftCardCount, 13);
    console.log("1:  cbLeftCardCount= ", cbLeftCardCount, " holds: ", holds, ", leftCards: ", _pokers)

    cbLeftCardCount -= 13;
    let holds1 = _pokers.splice(cbLeftCardCount, 13);
    console.log("2:  cbLeftCardCount= ", cbLeftCardCount, " holds1: ", holds1, ", leftCards: ", _pokers)

    cbLeftCardCount -= 1;
    let pai = _pokers[cbLeftCardCount];
    _pokers.splice(cbLeftCardCount, 1);
    console.log("3:  cbLeftCardCount= ", cbLeftCardCount, " pai: ", pai, ", leftCards: ", _pokers)

    let vt = [];
    mahjong_alg.has_dasixi([0,4,1, 2, 4, 4], vt, []);
    console.log("测试大四喜 t= ", vt);

    vt = [];
    mahjong_alg.has_dasixi([0,4,1, 2, 4, 4], vt, [4]);
    console.log("测试大四喜 排除4= ", vt);

};


let test_yizhihua = function () {
    let holds = [1,3,4, 5, 9, 11,13,13, 14, 15, 17, 21,21,29];
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
    let vt = [];

    let rt = mahjong_alg.is_yizhihua(cardsMap, vt);
    console.log("测试一枝花 ", rt," t= ", vt);
};

//test_yizhihua();
//mahjong_alg.test();

//mahjong_alg.getPokers(1);
