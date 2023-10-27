const pomelo = require('pomelo');
const tracer = require('./common/logTracer');
const pomeloKoa = require('./app/components/PomeloKoa');

//加载扩展类
require('./objectExtend');
//数据库操作类
require('./dao');

/**
 * Init app for client.
 */
let app = pomelo.createApp();
app.set('name', 'hdw');

// **************** 定义全局变量 ******************
global.SERVER_PARAMS = {create: true, giveScore: true, recharge: true, withdraw: true};
//log打印对象
global.APP_LOG = tracer(app.env);
global.STATE_CODE = require('./common/stateCode');
//初始化大厅层的缓存对象
if (app.getServerType() === "hall") {
    global.USERS = require("./app/servers/hall/users");
    global.CLUBS = require('./app/servers/hall/clubs');
    global.ROOMS = require('./app/servers/hall/rooms');
    global.MOBILES = {};
	global.GIVEUIDS = {};
    DBTOOLS.getParentRatio().then(res => {
        global.PARENTRATIO = res;
    });
    DBTOOLS.getClasp().then(res => {
       global.CLASP = res || 0;
    })
}

//gate服务器
if (app.getServerType() === "gate") {
    app.configure('production|development', 'gate', () => {
        app.set('connectorConfig', {
                connector: pomelo.connectors.hybridconnector,
                heartbeat: 3,
                useDict: true,
                useProtobuf: true
            });
    });
}

//connector服务器
if (app.getServerType() === "connector") {
    app.configure('production|development', 'connector', () => {
        app.set('connectorConfig', {
            connector: pomelo.connectors.hybridconnector,
            heartbeat: 3,
            useDict: true,
            useProtobuf: true
        });
        //与大厅的路由关系，大厅只有一个服
        app.route("hall", function (index, msg, app, cb) {
            let halls = app.getServersByType("hall");
            cb(null, halls[0].id);
        });
    });
}

//hall服务器,无法直接与用户连接
if (app.getServerType() === "hall") {
    app.configure('production|development', 'hall', () => {
        //与房间服务器路由关系
        app.route("room", function (sid, msg, app, cb) {
            cb(null, sid);
        });
        app.load(pomeloKoa, {});
    });
}

//房间服务器
if (app.getServerType() === "room") {
    app.configure('production|development', 'room', function () {
        app.set('connectorConfig',
            {
                connector: pomelo.connectors.hybridconnector,
                heartbeat: 3,
                useDict: true,
                useProtobuf: true
            });

        //与hall层的路由关系
        app.route("hall", function (index, msg, app, cb) {
            let halls = app.getServersByType("hall");
            cb(null, halls[0].id);
        });

        //与web层的路由关系
        // app.route("web", function (sid, msg, app, cb) {
        //     cb(null, sid);
        // });
    });
}

/**
 * 监控管理框架, 监视各服务器状态与信息
 * 如果不启动，则master服务器收集不到服务器信息
 */
app.configure('production|development', function () {
    app.enable('systemMonitor');
    // var onlineUser = require("./app/modules/onlineUser");
    // app.registerAdmin(onlineUser, {app: app});
});

// start app
app.start();

//同步代码的未处理异常监听，如果不监听，当程序报错，进程会奔溃
process.on('uncaughtException', function (err) {
    APP_LOG.error(' Caught exception: ' + err.stack);
});

//异步代码未处理异常监听，如果不监听，当程序报错，进程会奔溃
process.on('unhandledRejection', (reason, p) => {
    // 记录日志、抛出错误、或其他逻辑。
    p.catch((err) => {
        APP_LOG.error(err);
    })
});
