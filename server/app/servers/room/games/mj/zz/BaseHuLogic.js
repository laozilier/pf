/**
 *
 *  胡牌逻辑算法(基类)
 *  创建者： THB
 *  日期：2020/1/3
 */

/**
 * 记录所有加载的表数据
 * @type {{}}
 */

const fs = require('fs');
const path = require('path');

/*保存所有字典*/
let tables = {};
/**
 * 字典对象
 */
class HuTable{
    constructor(gameName, tableName) {
        //读取文件
        const fileDoc = fs.readFileSync(path.join(__dirname,  gameName, "tables",tableName));
        const keyArray = String(fileDoc).split('\n');
        this.data = []; //字典
        //生成字典
        for (let i = 0; i < keyArray.length; i++) {
            let key = keyArray[i];
            if (key) {
                this.data[key] = true;
            }
        }
    }
}

class BaseHuLogic {
    /**
     * 表的名字
     * @param gameName  游戏名
     * @param tableName 表名
     */
    constructor(gameName, tableName) {
        this.name = `${gameName}_${tableName}`;
        this.table = tables[this.name];
        //如果表未加载，需要先加载表
        if(!this.table){
            tables[this.name] = new HuTable(gameName, tableName);
            this.table = tables[this.name];
        }
    }

    /**
     * 判断是否胡牌
     * @param {Array} holdsDic
     * @returns {boolean}
     */
    checkHu(holdsDic) {
        let cards = [
            holdsDic.slice(0, 9),
            holdsDic.slice(9, 18),
            holdsDic.slice(18)];
        console.log(cards);
        let isEye = false;
        //检查每一个牌型是否胡牌；
        for (let i = 0; i < cards.length; i++) {
            let el = cards[i];
            let count = el.sum();
            if(!count) continue; //如果这一花色没有，则直接进入下一循环
            let key = this.genKey(el);

            //查找表中是否存在此key
            //不存在则不能胡
            //如果存在，判断是否检查过将，
            // 检查过将，如果这一次还是有将，则不能胡牌
            if (!this.table.data[key]) {
                return false;
            } else if(count%3 === 2){
                if(isEye) return false;
                else isEye = true;
            }
        }
        return true;
    }

    /**
     * 生成key
     */
    genKey (array) {
        return array.reduce((acc, curr) => {
            return acc + "" + curr;
        });
    };
}

module.exports = BaseHuLogic;