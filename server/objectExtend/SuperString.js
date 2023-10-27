/**
 *  创建者： THB
 *  日期：2019/12/18
 */

/**
 * 编码base64
 * @returns {string}
 */
String.prototype.toBase64 = function () {
    return Buffer.from(this.toString()).toString('base64');
};
/**
 * 解码base64
 * @returns {string}
 */
String.prototype.fromBase64 = function () {
    return Buffer.from(this, 'base64').toString();
};

String.prototype.toHex = function () {
    return Buffer.from(this.toString()).toString("hex");
};

String.prototype.fromHex = function (){
    return Buffer.from(this, 'hex').toString('utf8');
};