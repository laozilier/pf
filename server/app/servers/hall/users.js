/**
 *  创建者： THB
 *  日期：2020/5/22
 */

class UserItem{
    constructor(data, frontendId, ip) {


        //连接的前端服务器id
        this.frontendId = frontendId;
        this.loginIp = ip;
        this.initMemberVariables(data);
    }

    initMemberVariables(data){
        this.uid = data.uid;
        this.cid = data.cid;
        this.account = data.account;
        this.name = data.name;
        this.sex = data.sex;
        this.headimg = data.headimg;
        this.teamCount = data.team_count;
        this.subordinateCount = data.subordinateCount;
        this.profitRatio = data.profit_ratio;
        this.inviteCode = data.invite_code;
        this.lastInning = data.last_inning;
        this.totalInning = data.total_inning;
        this.ppid = data.ppid;
        this.bindTime = data.bind_time;
        this.loginTime = Date.format("yyyy-MM-dd HH:mm:ss");
        this.createTime = data.create_time;
        try{
            this.location = JSON.parse(data.location);
        } catch (e) {
            this.location = {};
        }
        this.remarks = data.remarks;
        this.lucky = data.lucky;
        this.robot = data.robot;
        this.mobile = data.mobile;
        this.sealUp = !!data.sealUp;
        this.clubBlacklist = !!data.blacklist;

        //钱包数据
        this.score = data.score;
        this.recharge = data.recharge;
        this.withdrawal = data.withdrawal;
        this.gameTurnover = this.game_turnover;
        this.tax = data.tax;
        this.poundage = data.poundage;

        //收款信息
        this.wxNickname = data.wxNickname;
        this.wxRealname = data.wxRealname;
        this.wxHeadimg = data.wxHeadimg;
        this.paymentUrl = data.paymentUrl;
        this.paymentName = data.paymentName;

        //权限信息
        this.permission = {
            withdraw: !!data.__permission.withdraw,
            recharge: !!data.__permission.recharge,
            dismissRoom: !!data.__permission.dismissRoom,
            manager: !!data.__permission.manager,
            dealer: !!data.__permission.dealer
        };
    }


    async update(){
        let data = await DBTOOLS.getUserLoginInfoByUid(this.uid);
        let permission = await DBTOOLS.getPermissionByUid(this.uid);   //读取用户权限
        data.__permission = permission || {};
        this.initMemberVariables(data);
    }

    //推送用户分数改变的推送
    sendChangeScore(app, value) {
        let cs = app.get('channelService');
        cs.pushMessageByUids('changeScore', {
            finalScore: this.score,
            changeScore: value
        }, [{
            uid: this.uid,
            sid: this.frontendId
        }]);
    }

    //推送用户分润改变的推送
    sendChangeProfit(app) {
        let cs = app.get('channelService');
        cs.pushMessageByUids('changeProfit', {
            profitRatio: this.profitRatio
        }, [{
            uid: this.uid,
            sid: this.frontendId
        }]);
    }
}


class Users{
    constructor() {
        this.map = {};
    }

    isExists(uid){
        return !!this.map[uid];
    }

    /**
     *
     * @param uid
     * @returns {UserItem}
     */
    getUser(uid){
        return this.map[uid];
    }

    async addUser(uid, frontendId, ip){
        if(!this.isExists(uid)) {
            let userInfo = await DBTOOLS.getUserLoginInfoByUid(uid);  //读取用户信息
            let permission = await DBTOOLS.getPermissionByUid(uid);   //读取用户权限
            if(userInfo){
                userInfo.__permission = permission || {};
               this.map[uid] = new UserItem(userInfo, frontendId, ip);
            }
        }
        return this.map[uid];
    }

    removeUser(uid){
        delete this.map[uid];
    }
}

module.exports = new Users();