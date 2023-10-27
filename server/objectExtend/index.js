/**
 *
 * 作者：THB
 * 创建时间：2019/8/13
 */
const fs = require('fs');

//加载本文件夹下所有文件
fs.readdirSync(__dirname).forEach((fileName) => {
    if (/.js$/.test(fileName) &&
        !/^index.js$/.test(fileName)) {
        let key = fileName.replace(/.js/, "");
        module.exports[key] = require('./' + fileName);
    }
});