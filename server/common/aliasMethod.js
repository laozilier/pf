/**
 *  创建者： THB
 *  日期：2019/12/19
 */

/**
 * 拼凑，获得Prob和Alias数组
 * 结果按输入的概率顺序生成
 * <br>参考文档：https://blog.csdn.net/qq_33765907/article/details/79182355
 * @param {array} data  概率数组 概率总合必须为1
 * @return {{prob, alias}}  返回方阵
 */
exports.init = function (data) {
    let nums = data.length;
    let prob = [];
    let alias = [];
    let large = [];
    let small = [];
    for (let i = 0; i < nums; ++i) {
        data[i] = data[i] * nums; // 扩大倍数，使每列高度可为1
        /** 分到两个数组，便于组合 */
        if (data[i] < 1) {
            small.push(i);
        } else {
            large.push(i);
        }
    }


    /** 将超过1的色块与原色拼凑成1 */
    while (small.length && large.length) {
        let n_index = small.pop();
        let a_index = large.pop();

        prob[n_index] = data[n_index];
        alias[n_index] = a_index;
        // 重新调整大色块
        data[a_index] = (data[a_index] + data[n_index]) - 1;

        if (data[a_index] < 1) {
            small.push(a_index);
        } else {
            large.push(a_index);
        }
    }

    /** 剩下大色块都设为1 */
    while (large.length) {
        let n_index = large.pop();
        prob[n_index] = 1;
    }

    /** 一般是精度问题才会执行这一步 */
    while (small.length) {
        let n_index = small.pop();
        prob[n_index] = 1;
    }
    return {prob, alias}
};

/**
 * 随机获取一件物品
 * @param {array} prob
 * @param {array} alias
 * @return int    返回道具ID
 */
exports.generation = function (prob, alias) {
    let coin_toss = Math.random();               //随机产生一个数
    let col = Math.randomRange(0, prob.length);  // 随机落在一列
    let b_head = (coin_toss < prob[col]);        // 判断是否落在原色
    return b_head ? col : alias[col];            //通过与Prob[C]比较，R较大则返回C，反之返回Alias[C]
};







/*-----------------------------------------------------------------------------------*/
/*******************************  底下为测试数据  *************************************/
/*-----------------------------------------------------------------------------------*/
//机器人概率
// let arr = [];
// console.log(exports.init([0.7, 0.3])); //2 人
// console.log(exports.init([0.5, 0.3, 0.2])); //3 人
// console.log(exports.init([0.5, 0.2, 0.2, 0.1])); //4人
// console.log(exports.init([0.30, 0.24, 0.23, 0.15, 0.08])); //5人
// console.log(exports.init([0.30, 0.20, 0.20, 0.13, 0.08, 0.09])); //6人
// console.log(exports.init([0.28, 0.16, 0.16, 0.15, 0.12, 0.07, 0.06])); //7人
// console.log(exports.init([0.24, 0.17, 0.17, 0.13, 0.1, 0.1, 0.05, 0.04])); //8人
// console.log(exports.init([0.20, 0.14, 0.13, 0.1, 0.1, 0.09, 0.09, 0.08, 0.07])); //9人
// console.log(exports.init([0.2, 0.12, 0.11, 0.11, 0.09, 0.09, 0.08, 0.08, 0.07, 0.05])); //10人
// let count = 0;
// [0.2, 0.12, 0.11, 0.11, 0.09, 0.09, 0.08, 0.08, 0.07, 0.05].forEach(el => count+=el);
// console.log(count);

// let res = exports.init([0.2, 0.2, 0.2, 0.2, 0.2]);
// let count = [0, 0, 0, 0, 0];

//幸运概率
// let alias = [{}, {},
//     {data: [0.6, 0.4], prob: [1, 0.8], alias: [null, 0]},
//     {data: [0.36, 0.34, 0.30], prob: [1, 0.92, 0.9], alias: [null, 0, 1]},
//     {data: [0.28, 0.26, 0.26, 0.2], prob: [1, 0.88, 0.84, 0.8], alias: [null, 0, 1, 2]},
//     {data: [0.23, 0.23, 0.21, 0.18, 0.15], prob: [1, 0.95, 0.8, 0.9, 0.75], alias: [null, 0, 1, 0, 2]},
//     {data: [0.18, 0.19, 0.19, 0.17, 0.14, 0.13], prob: [1, 0.92, 0.94, 0.8, 0.84, 0.78], alias: [null, 0, 1, 2, 1, 3]},
//     {data: [0.16, 0.17, 0.17, 0.15, 0.13, 0.12, 0.1], prob: [1, 0.97, 0.94, 0.75, 0.91, 0.84, 0.7], alias: [null, 0, 1, 2, 0, 1, 3]},
//     {data: [0.15, 0.16, 0.16, 0.14, 0.11, 0.11, 0.09, 0.08], prob: [1, 0.92, 0.76, 0.76, 0.88, 0.88, 0.72, 0.64], alias: [null, 0, 1, 2, 0, 1, 2, 3],},
//     {data: [0.13, 0.15, 0.15, 0.13, 0.1, 0.1, 0.09, 0.08, 0.07], prob: [1, 0.93, 0.87, 0.8, 0.9, 0.9, 0.81, 0.72, 0.63], alias: [null, 0, 1, 2, 0, 1, 1, 2, 3]},
//     {data: [0.15, 0.14, 0.14, 0.13, 0.1, 0.08, 0.07, 0.07, 0.07, 0.05], prob: [1, 0.7, 0.9, 0.8, 0.5, 0.8, 0.7, 0.7, 0.7, 0.5], alias: [null, 0, 1, 2, 3, 0, 1, 1, 2, 4]}
// ];

//负幸运概率
// let alias = [{}, {},
//     {data: [0.4, 0.6], prob:[0.8,1], alias:[1,null]},
//     {data: [0.3, 0.34, 0.36], prob:[0.9,1,0.98], alias:[2,null,1]},
//     {data: [0.2, 0.26, 0.26, 0.28], prob:[0.8,1,0.96,0.92], alias:[3,null,1,2]},
//     {data: [0.15, 0.18, 0.21, 0.23, 0.23], prob:[0.75,0.9,1,0.95,0.8], alias:[4,4,null,2,3]},
//     {data: [0.13, 0.14, 0.17, 0.19, 0.19, 0.18], prob:[0.78,0.84,1,0.98,0.84,0.92], alias:[4,5,null,2,3,4]},
//     {data: [0.1, 0.12, 0.13, 0.15, 0.17, 0.17, 0.16], prob:[0.7,0.84,0.91,1,0.95,0.76,0.87], alias:[5,6,6,null,3,4,5]},
//     {data: [0.08, 0.09, 0.11, 0.11, 0.14, 0.16, 0.16, 0.15], prob:[0.64,0.72,0.88,0.88,1,0.88,0.96,0.96], alias:[5,6,7,7,null,4,5,6]},
//     {data: [0.07, 0.08, 0.09, 0.1, 0.1, 0.13, 0.15, 0.15, 0.13], prob:[0.63,0.72,0.81,0.9,0.9,1,0.83,0.85,0.97], alias:[6,7,7,8,8,null,5,6,7]},
//     {data: [0.05, 0.07, 0.07, 0.07, 0.08, 0.1, 0.13, 0.14, 0.14, 0.15], prob:[0.5,0.7,0.7,0.7,0.8,1,1,0.7,0.8,0.7], alias:[7,8,9,9,9,null,null,6,7,8]}
// ];

// let count = 0;
// for (let i = 10; i > 1; --i){
//     let res = exports.init(alias[i].data);
//     res.prob.forEach((el, i, arr) => {
//         arr[i] = parseFloat(el.toFixed(2));
//     });
//     console.log(`{prob:${JSON.stringify(res.prob)}, alias:${JSON.stringify(res.alias)}`)
// }

// let counts = [0,0,0,0,0,0,0,0,0,0];
// let index = 10;
// for(let k = 0; k < 10000; k++){
//     let id = exports.generation(alias[index].prob, alias[index].alias);
//     counts[id]++;
// }
// console.log(counts);
//
// let gener = [[0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0],
//     [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,0,0,0,0,0,0]];

// for(let k = 0; k < 10000; k++){
//     let niu = [0,1,2,3,4,5,6,7,8,9];
//     for(let i = 10; i > 1; --i){
//         let id = exports.generation(alias[i].prob, alias[i].alias);
//         let val = niu.splice(id, 1)[0];
//         gener[10-i][val] ++;
//     }
//     gener[9][niu[0]] ++;
//
// }

// console.log(gener);