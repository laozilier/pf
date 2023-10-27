/**
 *  创建者： THB
 *  日期：2020/4/2
 */

module.exports = {
    OK:200,

    sqlError:999,
    roomNotExists:5001, //房间不存在
    playingGame:5002,   //正在游戏中，无法提现
    duplicateLogin: 5003, //重复登录
    userNotExists: 5004,  //用户不存在

    rechargeFail: 5005,  //充值失败
    // 获取房间数据错误:5005,
    // 插入房间数据出错:5006,
    // 你已经在别的房间中:5007,
    notBindSession:5008,
    gemsLow:5009,
    hallServerMiss: 5010,
    roomServerNotExists: 5011,  //房间服务器不存在
    createUserFail: 5012,  //创建用户失败
    savePaymentFail: 5013, //保存收款码失败
    createRoomFail: 5014,  //创建房间失败（一般是创建房间时报错导致）
    changePROrderFail: 5015,  //修改包间排序失败
    notSameClub: 5016,        //用户不在同一俱乐部
    giveScoreInsufficient: 5017,  //赠送分数不足
    selfInTheGame: 5018,     //玩家在游戏中，无法进行积分操作
    otherInTheGame: 5019,    //对方正在游戏中
    userNotBindPayment: 5020,  //收款信息没有
    notGiveSelf: 5021,  //无法赠送给自己
    loginTimeout: 5022, //登录超时
    orderNotExist: 5023, //订单不存在或已经处理
    notPermission: 5024, //权限不足
    privateRoomISMax: 5025,  //包间数量已经最大，无法创建房间

    notJSON:10000,
    signError:10001,
    accountOrSignIsNull:10002,
    urlError:10003,
    lackOfParameters:10004,
    获取微信Token失败:10005,
    已绑定代理:10006,
    key值不正确:10007,
    支付异常:10008,
    群组不存在:10009,
    数据库操作异常:10010,
    玩家已存在群组中:10011,
    获取微信账户信息失败:10012,
    sessionNotExists: 10013,
    serverStoped: 10014,
    privateRoomsNotExists: 10015,  //包间不存在
    clubIsMax: 10016,
    notAdmin: 10017,           //不是管理员
    notMaster: 10018,
    clubNotExist: 10019,
    alreadyJoinClub: 10020,
    alreadyApply: 10021,
    privateRoomsIsMax: 10022,
    msgNotExists:10023,
    operateFailed: 10024,
    masterNotDel: 10025,
    joinGameRoomFailed: 10026,
    delClubFailed: 10027,
    notClubMember: 10028,   //俱乐部中没有此成员
    gameRoomIsMax: 10029,
    gameIsCreation: 10030, //房间正在创建中
    blacklistMember: 10031, //黑名单成员
    delPrivateRoomsFailed: 10032, //删除房间失败
    clubNameLong: 10033, //俱乐部名字太长
    noGame: 10034, //没有游戏组件
    lockOfScore: 10035, //分数不足
    noGameRule: 10036,  //没有这个游戏的规则信息
    scoreNotEmpty: 10037, //俱乐部玩家分数没有清空
    clubInfoEmpty: 10038,  //合并俱乐部的信息为空
    clubShareProfitNotExists: 10039, //俱乐部分润不存在
    propNotExists: 10040,             //道具不存在
    noPayChannel: 10041,                //没有支付渠道
    clubNameIsExist: 10042,             //俱乐部名字已经存在
    missionEnded: 10043,        //任务已经完成过了
    buyFailed: 10044,           //购买商品失败
    withdrawScoreLock: 10045,   //提现分数不足,至少一百万
    tooManyScore: 10046,        //分数太多，无法坐下
    missionNoComplete: 10047,   //任务未完成
    frequentRequest: 10048,    //请求太频繁
    missionNoExists: 10049,    //任务不存在
    scoreHigh: 10050,          //领取每日任务，分数必须低于1000
    bindDealerFail: 10051,//绑定代理失败
    cannotBindSelf: 10052,//代理不能绑定自己
    alreadyBindDealer: 10053, //已经绑定代理
    clubNameShort: 10054, //俱乐部名字太短
    withdrawError: 10055, //下分必须为整百万
    isWithdraw: 10056, //正在下分
    isCreateRoom: 10057, //正在创建游戏
    notReceiptCode: 10058, //没有收款码
    alreadyLogin:10059,   //正在登录
    alreadyKicked:10060,   //你已经被踢出
    notJson:10061,         //不是json数据

    notBindDealer:20002,
    youNotDealer:20003,
    dealerServerError: 20004,  //请求代理服务器出错
    dealerServerRefuse: 20005,  //代理服务器拒绝访问
    notDealer: 20006,  //不是代理

    'serverStop': 40000,
    'wrongSStatus': 40001,
    buyStop: 40002,        //支付通道维户中
    serverNotStoped: 40003,
    rechargeStoped: 40004, //暂停充值
    withdrawStoped: 40005, //暂停下分
    giveScoreStoped: 40006, //暂停赠送

    mobileError: 50000, //手机号错误
    getCaptchaTooQuick: 50001, //获取验证码频率太快
    tooManyOneDay: 50002, //24小时内发送次数过多
    getCaptchaFail: 50003, //获取验证码失败
    captchNotExist: 50004, //验证码不存在
    captchError: 50005, //验证码错误
    captchUsed: 50006, //验证码已经使用
    captchExpired: 50007, //验证码已经过期
    mobileAlreadyBind: 50008, //手机已经绑定其他用户

    /**
     * 牌不合理
     */
    "cardsError":100001,
    "notYou":100002,
    noRobBrank: 100003, //分数不够无法抢庄
    noBetScore: 100004,  //分数不够无法下注
    noHalfway: 100005,   //不能中途中入房间
    seatFull: 100006,    //座位已经满了
	
	scoreError: 60001,          //分数异常
    giveScoreTooQuick: 60002,   //赠送过快
};