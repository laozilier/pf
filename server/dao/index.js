/**
 *  创建者： THB
 *  日期：2020/3/18
 */
const DBPool = require("./DBPool");
const dbConf = require('../config/mysql');
const db = DBPool.createPool(dbConf);
global.DB_POOL = db;

class DBTools {
    constructor() {
    }

    /**
     * 判断用户是否存在，如果存在，则返回uid否则返回0
     * @param account
     * @returns {Promise<*>}
     */
    async userExists(account) {
        let result = await db.querySync(`SELECT uid, sealUp FROM t_users WHERE account = ?`, [account])
            .catch(err => {
                APP_LOG.error(err);
            });
        return result && result[0] && result[0];
    }

    /**
     * 判断用户是否存在，如果存在，返回uid,sealUp
     * @param uid
     * @returns {Promise<*>}
     */
    async userExistsByUid(uid){
        let result = await db.querySync(`SELECT uid, sealUp FROM t_users WHERE uid = ?`, [uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return result && result[0];
    }

    async userPermission(uid){
        let result = await db.querySync(`SELECT * FROM t_permission WHERE uid = ?`, [uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return result && result[0];
    }

    /**
     * 俱乐部中用户信息
     * @param uid
     * @param cid
     * @returns {Promise<*>}
     */
    async getClubUserInfo(uid, cid) {
        let users = await db.queryProcessSync(`sp_club_userinfo(?, ?)`, [uid, cid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return users && users[0];
    }

    async getUserInfoByUid(uid) {
        let users = await db.queryProcessSync(`sp_get_userinfo(?)`, [JSON.stringify({uid})])
            .catch(err => {
                APP_LOG.error(err);
            });
        return users && users[0];
    }

    //登录成功后获取用户信息
    async getUserLoginInfoByUid(uid) {
        let users = await db.queryProcessSync(`sp_user_login_info(?)`, uid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return users && users[0];
    }

    //减一局数
    async subInning(uid){
        let res = await db.querySync(`UPDATE t_users SET total_inning = total_inning-1 WHERE uid = ? limit 1`, uid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0];
    }

    //获取用户的权限
    async getPermissionByUid(uid){
        let per = await db.querySync(`SELECT * FROM t_permission WHERE uid = ?`, uid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return per && per[0];
    }

    async getUserInfoByAccount(account) {
        let users = await db.queryProcessSync(`sp_get_userinfo(?)`, [JSON.stringify(account)])
            .catch(err => {
                APP_LOG.error(err);
            });
        return users && users[0];
    }

    async createUser(account, nickname, sex, headimg) {
        let uid = 0;
        let sqlError;
        await db.queryProcessSync(`sp_user_create(?,?,?,?)`, [account, nickname.toBase64(), sex, headimg])
            .then(res => {
                if (parseInt(res[0].code) === 200)
                    uid = res[0].uid;
                else
                    sqlError = res[0];
            })
            .catch(err => {
                sqlError = err
            });
        if (sqlError) {
            APP_LOG.error(sqlError);
            return 0;
        }
        return uid;
    }

    async getPropList() {
        let result = [];
        await DB_POOL.querySync(`SELECT * FROM t_prop WHERE status = 0`)
            .then(msg => result = msg)
            .catch(err => APP_LOG.error(err));
        return result;
    }

    async getSearchUser(uid) {
        let result = undefined;
        await DB_POOL.queryProcessSync(`sp_user_search(?)`, [uid])
            .then(msg => result = msg[0])
            .catch(error => APP_LOG.error(error));
        return result;
    }

    async bindParent(uid, pid) {
        let code = await DB_POOL.queryProcessSync(`sp_user_bind(?,?)`, [uid, pid])
            .catch(error => APP_LOG.error(error));
        return (code && code[0].code) || STATE_CODE.sqlError;
    }

    async generateOrders(uid, score, poundage) {
        let result, error;
        await db.querySync(`INSERT INTO t_orders(uid, score, poundage) VALUES(?,?,?)`, [uid, score, poundage])
            .then(r => result = r)
            .catch(e => error = e);
        if (error) {
            APP_LOG.error(error);
            return 0;
        } else {
            return result.insertId;
        }
    }

    // 自己最近的条充值记录
    async rechargeHistory(uid) {
        let res = await db.querySync(`SELECT order_sn, pay_time, pay_channel, pay_money FROM t_orders where uid = ? and pay_status = 1 order by pay_time DESC limit 8`, [uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res;
    }

    // 自己最近的条提现记录
    async playerWithdrawHistory(uid) {
        let res = await db.querySync(`SELECT score, payment_no, status, remark, create_time FROM t_withdraw_order where uid = ? order by create_time DESC limit 8`, [uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res;
    }

    // 俱乐部管理员查看成员充值记录
    async clubRechargeHistory(cid, adminUid, uid, page, pagesize) {
        return await db.queryProcessSync(`sp_club_recharge_history(?,?,?,?,?,0,0)`, [cid, adminUid, uid, page, pagesize])
            .catch(err => {
                APP_LOG.error(err);
            });
    }

    // 俱乐部管理员查看成员充值记录
    async clubWithdrawHistory(cid, adminUid, uid, page, pagesize) {
        return await db.queryProcessSync(`sp_club_withdraw_history(?,?,?,?,?,0,0)`, [cid, adminUid, uid, page, pagesize])
            .catch(err => {
                APP_LOG.error(err);
            });
    }

    // 俱乐部管理员查看成员充值记录
    async clubGiveScoreHistory(uid, page, pagesize) {
        return await db.queryProcessSync(`sp_club_give_history(?,?,?,0,0)`, [uid, page, pagesize])
            .catch(err => {
                APP_LOG.error(err);
            });
    }

    async sealUpAccount(uid) {
        let res = await db.queryProcessSync(`sp_user_sealUp(?)`, uid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    /**
     * 提现
     * @param cid
     * @param uid
     * @param score
     * @returns {Promise<{code: number}|*>}
     */
    async withdraw(cid, uid, score) {
        let res = await db.queryProcessSync(`sp_user_withdraw(?, ?, ?)`, [cid,uid, score])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    /**
     * 查询战绩
     * @param cid
     * @param uid
     * @param gameType
     * @param page
     * @param pageSize
     * @param startTime
     * @param endTime
     * @returns {Promise<[]|*>}
     */
    async getHistoryClubUser(cid = 0, uid = 0, gameType = "", page = 1, pageSize = 10, startTime = 0, endTime = 0) {
        //判断参数是否合理
        if (startTime === 0)
            startTime = Math.floor((Date.now()) / 1000) - 259200;
        if (endTime === 0) {
            endTime = Math.floor((Date.now()) / 1000);
        }
        let result = await DB_POOL.queryProcessSync(`sp_history_get_club_user(?, ?, ?,?,?,?,?)`, [cid, uid, gameType, page, pageSize, startTime, endTime])
            .catch(err => {
                APP_LOG.error(err);
            });
        if (result) {
            return result
        } else {
            return [];
        }
    }

    // 俱乐部中所有战绩（近三天）
    async getHistoryAllClub(cid = 0, gameType = '', page = 1, pageSize = 10, startTime = 0, endTime = 0) {
        //判断参数是否合理
        if (startTime === 0)
            startTime = Math.floor((Date.now()) / 1000) - 259200; //近三天历史记录
        if (endTime === 0) {
            endTime = Math.floor((Date.now()) / 1000);
        }
        let result = await DB_POOL.queryProcessSync(`sp_history_get_club_all(?, ?,?,?,?,?)`, [cid, gameType, page, pageSize, startTime, endTime])
            .catch(err => {
                APP_LOG.error(err);
            });
        if (result) {
            return result
        } else {
            return [];
        }
    }

    /**
     * 俱乐部包间信息
     * @param prid  包间id
     * @returns {Promise<void>}
     */
    async clubRoomInfo(prid) {
        let result = await db.querySync(`SELECT * FROM t_club_rooms WHERE id = ?`, prid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return result && result[0];
    }

    /**
     * 大厅公告
     * @returns {Promise<*>}
     */
    async getHallNotice() {
        let result = await DB_POOL.queryProcessSync("sp_get_notice(0, 0, 0, 'asc')")
            .catch(err => {
                APP_LOG.error(err);
            });
        return result && result[0];
    }

    async getVersion(ossys, build, version) {
        let result = await DB_POOL.queryProcessSync("sp_version_get(?,?,?)", [ossys, build, version]).catch(err => {
            APP_LOG.error(err);
        });
        return result && result[0];
    }

    async insertComplaint(uid, type, content) {
        return await DB_POOL.querySync(`insert into t_complaint(type, uid, remark) values(?, ?, ?)`, [type, uid, content])
            .catch(err => {
                APP_LOG.error(err);
            });
    }

    async updateLocation(uid, location) {
        let res = await DB_POOL.querySync(`UPDATE t_users SET location=? WHERE uid = ?`, [location, uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && !!res.changedRows;
    }

    async updateRemark(uid, remark) {
        let res = await DB_POOL.querySync(`UPDATE t_users SET remarks=? WHERE uid = ?`, [remark, uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && !!res.changedRows;
    }

    async savePaymentUrl(uid, name, url) {
        let res = await DB_POOL.queryProcessSync(`sp_payment_save(?,?,?)`, [uid, url, name])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res.code;
    }

    /**
     * 获取俱乐部成员
     * @param cid 俱乐部id
     * @param uid 搜索的玩家id
     * @param page 第几页
     * @param size 每页数量
     * @returns {Promise<any>}
     */
    async clubMembers(cid, uid = 0, page = 1, size = 10) {
        let res = await DB_POOL.queryProcessSync(`sp_club_members(?,?,?,?)`, [cid, uid, page, size])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res : [];
    }

    async clubPrivateRooms(cid) {
        let res = await DB_POOL.querySync(`SELECT * FROM t_club_rooms WHERE cid = ? ORDER BY weight ASC, create_time ASC`, cid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res : [];
    }

    async changeClubPrivateRoom(prid, adminUid, rule) {
        let res = await DB_POOL.queryProcessSync(`sp_club_change_private_room(?,?,?)`, [prid, adminUid, rule])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    async changePRName(uid, prid, name) {
        let res = await DB_POOL.queryProcessSync(`sp_club_change_pr_name(?,?,?)`, [uid, prid, name])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE};
    }

    //修改包间最大开桌数
    async changePRMax(prid, max){
        let res = await DB_POOL.querySync(`UPDATE t_club_rooms SET max = ? WHERE id = ?`, [max, prid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res.changedRows;
    }

    async deleteClubPrivateRoom(prid, adminUid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_del_private_room(?,?)`, [prid, adminUid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    /**
     * 创建俱乐部包间规则
     * @param cid
     * @param uid
     * @param name
     * @param rule
     * @returns {Promise<void>}
     */
    async createClubPrivateRoom(cid, uid, name, rule) {
        let res = await DB_POOL.queryProcessSync(`sp_club_create_private_room(?,?,?,?)`, [cid, uid, name.toBase64(), JSON.stringify(rule)])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    async myClubs(uid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_my(?)`, uid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return res || [];
    }

    async clubInfo(cid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_info(?)`, cid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0];
    }

    //俱乐部所有管理员
    async clubAdmins(cid) {
        return await DB_POOL.querySync(`SELECT uid, type FROM t_club_member WHERE cid = ? AND type > 0`, cid)
            .catch(err => {
                APP_LOG.error(err);
            });
    }

    async setClubBlacklist(cid, uid, adminUid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_blacklist(?,?,?)`, [cid, uid, adminUid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    async createClub(uid, name) {
        let res = await DB_POOL.queryProcessSync(`sp_club_create(?, ?)`, [uid, name.toBase64()])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    async deleteClub(cid, uid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_delete(?,?)`, [uid, cid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    async setClubAdmin(cid, adminUid, targetUid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_set_admin(?,?,?)`, [cid, adminUid, targetUid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError}
    }

    async setClubName(cid, adminUid, name) {
        let res = await DB_POOL.queryProcessSync(`sp_club_set_name(?,?,?)`, [cid, adminUid, name.toBase64()])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError}
    }

    async getParents(uids) {
        let res = await db.querySync(`SELECT f_user_mult_parents(?) AS parents`, uids).catch(e => {
            APP_LOG.error(e);
        });
        let json;
        try {
            json = res && res[0] && JSON.parse(res[0].parents);
        } catch (e) {
            APP_LOG.error(e);
        }
        return json;
    }

    async writeProfit(profits, cid, profit, clubTax) {
        let res = await db.queryProcessSync(`sp_profit_write(?,?,?,?)`, [profits, cid, profit, clubTax]).catch(e => {
            APP_LOG.error(e);
        });
        return res && res[0];
    }

    writeCreatorProfit(profit, cid) {
        db.queryProcessSync(`sp_profit_creator_write(?,?)`, [cid, profit]).catch(e => {
            APP_LOG.error(e);
        });
    }

    //父级返佣比例
    async getParentRatio() {
        let res = await DB_POOL.querySync('SELECT content FROM t_config WHERE `key` = "parent_ratio"')
            .catch(err => {
                APP_LOG.warn("读取父级分润数据失败");
                APP_LOG.error(err);
            });
        return res && res[0] && JSON.parse(res[0].content);
    }

    //暗扣局数
    async getClasp(){
        let res = await DB_POOL.querySync('SELECT value FROM t_config WHERE `key` = "clasp"')
            .catch(err =>{
                APP_LOG.warn("读取暗扣数据失败");
                APP_LOG.error(err);
            });
        return res && res[0] && res[0].value;
    }

    // 用户绑定的信息，收款码与收款微信
    async getBindInfo(uid) {
        let res = await DB_POOL.queryProcessSync(`sp_user_get_bind_info(?)`, uid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //提现域名
    async getWithdrawDomain() {
        let res = await DB_POOL.querySync('SELECT content FROM t_config WHERE `key` = "withdraw_domain"')
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0] && res[0].content;
    }

    //提现域名
    async getDealerBackstageUrl() {
        let res = await DB_POOL.querySync('SELECT content FROM t_config WHERE `key` = "dealer_backstage"')
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0] && res[0].content;
    }

    async savePaymenturl(uid, paymenturl, name) {
        let res = await DB_POOL.queryProcessSync('sp_payment_save(?,?,?)', [uid, paymenturl, name])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0];
    }

    // async saveMobile(uid, mobile) {
    //     let res = await DB_POOL.querySync(`UPDATE t_users SET mobile = ? WHERE uid = ?`, [mobile, uid])
    //         .catch(err => {
    //             APP_LOG.error(err);
    //         });
    //     return res && !!res.changedRows;
    // }

    async saveMobile(uid, mobile) {
        let res = await DB_POOL.queryProcessSync(`sp_mobile_save(?,?)`, [mobile, uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0];
    }

    //交换两个包间的排序
    async privateRoomOrder(prid, prid2) {
        let res = await DB_POOL.queryProcessSync(`sp_club_pr_order(?, ?)`, [prid, prid2])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0] && res[0].code;
    }

    //用户详细信息
    async detailUserInfo(cid, adminUid, uid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_user_detailinfo(?,?,?)`, [cid, adminUid, uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0];
    }

    /**
     * 赠送分数给其他玩家
     * @param guid  赠送方UID
     * @param auid  接收方UID
     * @param score 赠与分数
     * @param cid   俱乐部id，必须保证玩家在同一俱乐部
     * @returns {Promise<void>|Number}
     */
    async giveScore(guid, auid, score, cid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_give_score(?,?,?,?)`, [guid, auid, score, cid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //设置分润
    async setProfit(cid, adminUid, uid, ratio) {
        let res = await DB_POOL.queryProcessSync(`sp_club_set_profit(?,?,?,?)`, [cid, adminUid, uid, ratio])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //俱乐部管理员上分
    async addScore(uid, adminUid, score, cid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_user_addscore(?,?,?,?)`, [uid, adminUid, score, cid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //俱乐部管理员下分
    async decreaseScore(uid, adminUid, score, cid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_user_decreasescore(?,?,?,?)`, [uid, adminUid, score, cid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //分润列表
    async getRatios() {
        let res = await DB_POOL.querySync('SELECT content FROM t_config WHERE `key` = "ratios"')
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0] && res[0].content;
    }

    //邀请地址
    async getInviteUrl() {
        let res = await DB_POOL.querySync('SELECT content FROM t_config WHERE `key` = "invite_url"')
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0] && res[0].content;
    }

    async getKefuUrl() {
        let res = await DB_POOL.querySync('SELECT content FROM t_config WHERE `key` = "kefu_url"')
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0] && res[0].content;
    }

    //代理基本信息
    async dealerInfo(uid) {
        let res = await DB_POOL.queryProcessSync(`sp_dealer_info(?)`, [uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res[0];
    }

    /**
     * 查询下属列表
     * @param uid
     * @param category
     * @param page
     * @returns {Promise<[]>}
     */
    async getSubordinateList(uid, category, page, pagesize) {
        let res = await db.queryProcessSync(`sp_user_subordinates(?, ?, ?, ?)`, [category, uid, page, pagesize])
            .catch(err => {
                APP_LOGs.error(err);
            });
        return res || [];
    }

    //代理提现历史记录
    async dealerWithdrawHistory(uid, page = 1, pagesize = 4) {
        let res = await db.queryProcessSync(`sp_dealer_withdraw_history(?,?,?)`, [uid, page, pagesize])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res || [];
    }

    //代理提现
    async dealerWithdraw(cid, uid, score) {
        let res = await db.queryProcessSync(`sp_dealer_withdraw(?,?,?)`, [cid,uid, score])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res ? res[0] : {code: STATE_CODE.sqlError};
    }

    //返佣兑换成游戏积分
    async dealerWithdrawGame(cid,uid, score) {
        let res = await db.queryProcessSync(`sp_dealer_withdraw_game(?,?,?)`, [cid,uid, score])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //俱乐部每日统计
    async clubStatistic(cid){
        let res = await db.queryProcessSync(`sp_statistic(?)`, cid)
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0];
    }

    /** 管理员删除俱乐部 **/
    async adminDeleteClub(cid, uid) {
        let res = await DB_POOL.queryProcessSync(`sp_admin_club_delete(?,?)`, [uid, cid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    /** 管理员上分 **/
    async adminAddScore(uid, adminUid, score) {
        let res = await DB_POOL.queryProcessSync(`sp_admin_user_addscore(?,?,?)`, [uid, adminUid, score])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    /** 管理员扣分 **/
    async adminDecreaseScore(uid, adminUid, score) {
        let res = await DB_POOL.queryProcessSync(`sp_admin_user_decreasescore(?,?,?)`, [uid, adminUid, score])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async adminSealUpAccount(uid, sealUp) {
        let res = await db.queryProcessSync(`sp_admin_user_sealUp(?,?)`, [uid, sealUp])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res[0] : {code: STATE_CODE.sqlError};
    }

    //统计历史
    async statistics() {
        let res = await db.querySync(`SELECT * FROM t_statistics ORDER BY days DESC LIMIT 7`)
            .catch(err => {
                APP_LOG.error(err);
            });
        return res;
    }

    async verifyPlayerScores() {
        let res = await db.querySync(`SELECT 
        SUM(recharge) AS recharge, 
        SUM(profit) AS profit, 
        SUM(score) AS score, 
        SUM(poundage) AS poundage, 
        SUM(tax) AS tax, 
        SUM(withdrawal) AS withdrawal, 
        count(1) AS count
        FROM t_wallet`)
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res && res[0];

        // 利润数据
        //SELECT SUM(profit), SUM(total_profit) INTO v_dealerScore, v_totalProfit  FROM t_profit;
    }

    async verifyDealerScores() {
        let res = await db.querySync(`SELECT 
        SUM(total_profit) AS total_profit, 
        SUM(profit) AS profit, 
        SUM(poundage) AS poundage, 
        SUM(withdraw_profit) AS withdraw_profit, 
        count(1) AS count
        FROM t_profit`)
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res && res[0];

        // 利润数据
        //SELECT SUM(profit), SUM(total_profit) INTO v_dealerScore, v_totalProfit  FROM t_profit;
    }

    async playerWithdrawList(cid, uid, status, searchUid, page, pagesize) {
        let res = await DB_POOL.queryProcessSync(`sp_club_playerWithdrawList(?,?,?,?,?,?)`, [cid, uid, status, searchUid, page, pagesize])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res : [];
    }

    async dealerWithdrawList(cid, uid, status, searchUid, page, pagesize) {
        let res = await DB_POOL.queryProcessSync(`sp_club_dealerWithdrawList(?,?,?,?,?,?)`, [cid, uid, status, searchUid, page, pagesize])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res : [];
    }

    async playerAlreadyWithdraw(adminUid, order_sn, status, payment_no, partner_trade_no) {
        let res = await DB_POOL.queryProcessSync(`sp_club_playerAlreadyWithdraw(?,?,?,?,?)`, [adminUid, order_sn, status, payment_no, partner_trade_no])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async dealerAlreadyWithdraw(adminUid, order_sn, status, payment_no, partner_trade_no) {
        let res = await DB_POOL.queryProcessSync(`sp_club_dealerAlreadyWithdraw(?,?,?,?,?)`, [adminUid, order_sn, status, payment_no, partner_trade_no])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async withdrawInfo(uid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_withdraw_info(?)`, [uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async withdrawNum(cid, adminUid) {
        let res = await DB_POOL.queryProcessSync(`sp_club_withdraw_num(?,?)`, [cid, adminUid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async managerSavePaymenturl(cid, adminUid, uid, paymenturl, name) {
        let res = await DB_POOL.queryProcessSync('sp_payment_manager_save(?,?,?,?,?)', [cid, adminUid, uid, paymenturl, name])
            .catch(err => {
                APP_LOG.error(err);
            });
        return res && res[0];
    }
	
	async adminGetAllClubs() {
        let res = await db.querySync(`SELECT id AS cid, name FROM t_club`)
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res : [];
    }

    async updateConfig(key, value, content) {
        let res = await db.queryProcessSync(`sp_admin_update_config(?,?,?)`, [key, value, content])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async changePermission(uid, withdraw, recharge, dismissRoom, manager, dealer) {
        let res = await db.queryProcessSync(`sp_admin_change_permission(?,?,?,?,?,?)`,
            [uid, withdraw, recharge, dismissRoom, manager, dealer])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //获取输赢玩家排序列表
    async getUserTotalScoreList(sortKey, page, size){
        let res = await db.queryProcessSync(`sp_admin_total_scores(?,?,?)`, [sortKey, page, size])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res : [];
    }

    //设置玩家lucky
    async setUserLucky(uid, lucky) {
        let res = await db.queryProcessSync(`sp_admin_set_user_lucky(?,?)`,
            [uid, lucky])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async setUserRobot(uid, robot) {
        let res = await db.queryProcessSync(`sp_admin_set_user_robot(?,?)`,
            [uid, robot])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async setNoticeMsg(msg) {
        let res = await db.queryProcessSync(`sp_admin_set_notice(?)`,
            [msg])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async deleteUser(uid) {
        let res = await db.queryProcessSync(`sp_admin_delete_user(?)`,
            [uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    async reUser(uid) {
        let res = await db.queryProcessSync(`sp_admin_re_user(?)`,
            [uid])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //获取profit排序列表
    async getUserProfitList(page, size){
        let res = await db.queryProcessSync(`sp_admin_profit_list(?,?)`, [page, size])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res : [];
    }

    //重置玩家局数
    async resetUserInning() {
        let res = await db.queryProcessSync(`sp_admin_reset_user_inning()`, [])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //获取写分错误日志
    async getWriteScoreLogs(page, size) {
        let res = await db.queryProcessSync(`sp_admin_write_score_logs(?,?)`, [page, size])
            .catch(err => {
                APP_LOG.error(err);
            });
        return !!res ? res : [];
    }

    /** ----------以下需要测试----------*/
    //管理员查询用户
    async adminQueryUser(uid) {
        let result = {};
        await DB_POOL.queryProcessSync(`sp_admin_query_user(?)`, [uid])
            .then(msg => result = msg[0])
            .catch(error => APP_LOG.error(error));
        return result;
    }

    //管理员更改用户账号
    async updateUserAccount(uid, account) {
        let res = await db.queryProcessSync(`sp_admin_update_user_account(?,?)`,
            [uid, account])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //管理员更改用户头像和名字
    async updateUserNameAndAvatar(uid, name, headimg) {
        let res = await db.queryProcessSync(`sp_admin_update_user_name_headimg(?,?,?)`,
            [uid, name, headimg])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //管理员更改用户分数变化
    async updateUserGameTurnover(uid, turnover) {
        let res = await db.queryProcessSync(`sp_admin_update_user_game_turnover(?,?)`,
            [uid, turnover])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }

    //管理员更改用户局数
    async updateUserInning(uid, inning) {
        let res = await db.queryProcessSync(`sp_admin_update_user_inning(?,?)`,
            [uid, inning])
            .catch(err => {
                APP_LOG.error(err);
            });
        return (res && res[0]) || {code: STATE_CODE.sqlError};
    }
}

global.DBTOOLS = new DBTools();