/**
 *  创建者： THB
 *  日期：2020/4/2
 */

class CEvent{
    constructor() {
        this.StateCode = {
            200: 'OK',
            999: '数据库错误',          //sqlError
            5001: '房间不存在',         //roomNotExists
            5002: '正在游戏中，无法扣除分数或转存', //playingGame
            5003: '不能重复登录',        //duplicateLogin
            5004: '玩家不存在',          //userNotExists
            5005: '获取房间数据错误',
            5006: '插入房间数据出错',
            5007: '你已经在别的房间中',
            5008: '绑定监听事件失败',   //notBindSession
            5009: 'gemsLow',         //gemsLow
            5010: 'hallServerMiss',  //hallServerMiss
            5011: '房间服务器不存在',   //roomServerNotExists
            5012: '创建用户失败',      //createUserFail 
            5013: '保存二维码失败',    //savePaymentFail
            5014: '创建房间失败',       //createRoomFail
            5015: '修改包间排序失败',
            5016: '不在同一个亲友群',   //notSameClub
            5017: '赠送分数不足',
            5018: '你正在游戏中，无法进行积分操作',
            5019: '对方正在游戏中',
            5020: '未绑定二维信息',
            5021: '不能给自己赠送',
            5022: '登录超时',
            5023: '订单不存在或者已处理',
            5024: '权限不足',
            5025: '包间桌子数量已经达到最大数量，无法继续建房间',
        
            10000: 'notJSON',
            10001: '签名错误',
            10002: 'accountOrSignIsNull',
            10003: 'urlError',
            10004: '缺少参数',          //lackOfParameters
            10005: '获取微信Token失败',
            10006: '已绑定代理',
            10007: 'key值不正确',
            10008: '支付异常',
            10009: '群组不存在',
            10010: '数据库操作异常',
            10011: '玩家已存在群组中',
            10012: '获取微信账户信息失败',
            10013: '获取用户信息失败',
            10014: '服务器正在维护更新',
            10015: '包间不存在',            //privateRoomsNotExists
            10016: 'clubIsMax',
            10017: '不是管理员',            //notAdmin
            10018: '你不是群主',            //notMaster
            10019: 'clubNotExist',
            10020: 'alreadyJoinClub',
            10021: 'alreadyApply',
            10022: 'privateRoomsIsMax',
            10023: 'msgNotExists',
            10024: 'operateFailed',
            10025: 'masterNotDel',
            10026: 'joinGameRoomFailed',
            10027: 'delClubFailed',
            10028: '亲友群中没有此成员',    //notClubMember
            10029: 'gameRoomIsMax',
            10030: '房间正在创建中',        //gameIsCreation
            10031: '黑名单成员',            //blacklistMember
            10032: '删除房间失败',          //delPrivateRoomsFailed
            10033: '亲友群名字太长',        //clubNameLong
            10034: '没有游戏组件',          //noGame
            10035: '分数不足',              //lockOfScore
            10036: '没有这个游戏的规则信息',  //noGameRule
            10037: '亲友群玩家分数没有清空',  //scoreNotEmpty
            10038: '合并亲友群的信息为空',   //clubInfoEmpty
            10039: '亲友群分润不存在',      //clubShareProfitNotExists
            10040: '道具不存在',           //propNotExists
            10041: '没有支付渠道',         //noPayChannel
            10042: '亲友群名字已经存在',    //clubNameIsExist
            10043: '任务已经完成过了',      //missionEnded
            10044: '购买商品失败',         //buyFailed
            10045: '转存分数不足,至少一百万',//withdrawScoreLock
            10046: '分数太多，无法坐下',    //tooManyScore
            10047: '任务未完成',           //missionNoComplete
            10048: '请求太频繁',           //frequentRequest
            10049: '任务不存在',           //missionNoExists
            10050: '领取每日任务，分数必须低于1000',          //scoreHigh
            10051: '绑定代理失败',         //10051
            10052: '代理不能绑定自己',      //cannotBindSelf
            10053: '已经绑定代理',         //alreadyBindDealer
            10054: '亲友群名字太短',        //clubNameShort
            10055: '下分必须为整百万',      //withdrawError
            10056: '正在下分',             //isWithdraw
            10057: '正在创建游戏',          //isCreateRoom
            10058: '没有二维码',           //notReceiptCode
            10059: '正在登录',             //alreadyLogin
            10060: '你已被踢出游戏房间',     //alreadyKicked
        
            20002: 'notBindDealer',
            20003: 'youNotDealer',
            20004: '请求代理服务器出错',  //dealerServerError
            20005: '代理服务器拒绝访问',  //dealerServerRefuse
    
            40000: 'serverStop',
            40001: 'wrongSStatus',
            40002: '支付通道维户中',          //buyStop
            40003: '危险操作，请先停止服务',   //服务未停止
            40004: '暂时无法加分，请稍后再试', //暂停充值
            40005: '暂时无法转存，请稍后再试', //暂停下分
            40006: '暂时无法赠送，请稍后再试', //暂停赠送

            50000: '手机号错误', 
            50001: '获取验证码频率太快',
            50002: '6小时内发送次数过多',
            50003: '获取验证码失败',
            50004: '验证码不存在',
            50005: '验证码错误',
            50006: '验证码已经使用',
            50007: '验证码已经过期',
            50008: '手机已经绑定其他用户',

            100001:'cardsError',
            100002: 'notYou',
            100003: '分数不够无法抢庄',     //noRobBrank
            100004: '分数不够无法下注',     //noBetScore
            100005: '不能中途中入房间',     //noHalfway
            100006: '座位已经满了',        //seatFull

            60001: '分数异常，请联系上级或管理员',
            60002: '赠送频率过快，请等待60秒后重试',
        };
    }

    /**
     * 添加监听
     * @param event 监听名
     * @param cb    回调
     */
    on(event, cb) {
        window.pomelo.on(event, cb);
    }

    /**
     * 移除监听
     * @param event
     * @param cb
     */
    off(event, cb) {
        window.pomelo.off(event, cb);
    }

    emit(event, msg) {
        window.pomelo.emit(event, msg);
    }

    /**
     * 发送消息
     * @param route  路径
     * @param data   数据
     * @param cb     回调，服务器传回的数据
     */
    request(route, data, cb) {
        window.pomelo.request(route, data, function (msg) {
            try{
                msg = JSON.parse(msg);
            } catch (e) {

            }
            if (!cc.sys.isNative) {
                console.log(route, data, msg);
            }
            
            !!cb && cb(msg);
        });
    }
}

module.exports = CEvent;