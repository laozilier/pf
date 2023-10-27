/**
 *  创建者： THB
 *  日期：2019/12/19
 */

const http = require('http');
const https = require('https');
const URL = require("url");
const queryString = require('querystring');


/**
 * 请求http服务器
 * @param url   请求地址
 * @param data  发送数据
 * @param options  配置参数
 * @returns {Promise<Buffer>}
 */
exports.ajax = function (options) {
    const protocol = /^https/i.test(options.url) ? https : http;
    let opt = URL.parse(options.url);
    let data = queryString.stringify(options.data || {});
    let post = !!options && !!options.method && /post/i.test(options.method);
    if (!post && data) {
        opt.path += '?' + data;
    }

    delete options.url;
    delete options.data;
    for (let key in options){
        if(options.hasOwnProperty(key))
            opt[key] = options[key];
    }

    return new Promise((resolve, reject) => {
        const clientRequest = protocol.request(opt, (res) => {
            let chunks = [];
            //设置格式
            res.on('data', (chunk) => {
                chunks.push(chunk);
            });

            //监听data事件，并且将获得到的数据进行打印
            res.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
        });

        clientRequest.on('error', (e) => {
            reject(e);
        });

        // 将数据写入请求主体。
        if (post && data) {
            clientRequest.write(data);
        }
        clientRequest.end();
    });
};

/**
 * get访问
 * @param url   请求地址
 * @param data  发送数据
 * @returns {Promise<Buffer>}
 */
exports.get = function (url, data) {
    return this.ajax({url, data});
};

/**
 * post访问
 * @param url   请求地址
 * @param data  发送数据
 * @returns {Promise<Buffer>}
 */
exports.post = function (url, data) {
    return this.ajax({url, data, method:"POST"});
};