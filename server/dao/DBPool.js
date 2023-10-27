/**
 * 数据库连接池管理对象
 * Created by TTT on 2019/3/29
 */
const mysqlLog = require('pomelo-logger').getLogger("mysql", __filename);
const mq = require("mysql");

class DBPool {
    constructor(conf) {
        this.pool = mq.createPool(conf);
    }

    destroy(){
        this.pool.end();
    }

    /**
     * 从连接池获取一个连接
     * @param cb
     */
    getConnection(cb) {
        this.pool.getConnection(function (err, connection) {
            connection.on("error", function (err) {
                mysqlLog.error(err);
            });
            cb(err, connection);
        });
    }

    /**
     * 从连接池获取一个连接
     * @returns {Promise<any>} 返回一个mysql连接
     */
    getConnectionSync() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection(function (err, connection) {
                connection.on("error", function (err) {
                    mysqlLog.error(err);
                });
                !!err ? reject(err) : resolve(connection);
            });
        });
    }

    /**
     * 执行存储过程
     * @param name  存储过程名
     * @param values 参数
     * @param connect 连接对象
     * @returns
     */
    queryProcessSync(name, values = [], connect) {
        //验证参数合理性
        if (name === undefined) {
            throw "没有存储过程名";
        }
        return new Promise(async (resolve, reject) => {
            this.query(`CALL ${name}`, values, (err, result, fields) => {
                !!err ? reject(err) : resolve(result[0]);
            }, connect);
        });
    }

    /**
     * 执行sql语句
     * @param sql  sql语句
     * @param values 赋值数组
     * @param connect 连接对象
     * @returns {Promise<{result}>} 返回执行结果，如果出现错误，则抛出错误
     */
    querySync(sql, values = [], connect) {
        if (sql === undefined) {
            throw new Error("sql 语句不能为空");
        }
        let now = Date.now();
        return new Promise(async (resolve, reject) => {
            this.query(sql, values, (err, result, fields) => {
                !!err ? reject(err) : resolve(result);
            }, connect)
        });
    }

    /**
     * 执行mysql 查询语句
     * @param {String} sql  sql语句
     * @param {Array|Function} [values] 赋值数组或者回调函数
     * @param {Function} [cb] 回调函数
     * @param {PoolConnection|Pool} [connect] 连接对象
     */
    query(sql, values, cb, connect) {
        let now = Date.now();
        if(!connect)
            connect = this.pool;
        connect.query(sql, values, function (err, result, fields) {
            let queryTime = Date.now() - now;
            if(queryTime > 200)
                mysqlLog.warn(`time: ${queryTime/1000}`, sql, ';', values);
            cb(err, result, fields);
        });
    }
}

module.exports.createPool = function (conf) {
    return new DBPool(conf);
};