/*!
 * Pomelo -- consoleModule onlineUser
 * Copyright(c) 2012 fantasyni <fantasyni@163.com>
 * MIT Licensed
 */
module.exports = function(opts) {
    return new onlineUser(opts);
};

var moduleId = "onlineUser";
module.exports.moduleId = moduleId;

var onlineUser = function(opts) {
    this.app = opts.app;
    this.type = 'pull';
    this.interval = 10;
};

onlineUser.prototype.monitorHandler = function(agent,msg){
    var sessionService = this.app.get('sessionService');
    var uidmap = sessionService.service.uidMap;
    var allUserIds = Object.keys(uidmap);
    var uidInfos = new Array();
    for(var i =0;i <uidInfos.length;i++){
         var uid = allUserIds[i];
         var infos = uidmap[uid];
         var uidInfo ={
            uid:infos[0].uid,
            frontendId:infos[0].frontendId,
            userName:infos[0].settings.userName,
            loginTime:infos[0].settings.loginTime
        };
        uidInfos.push(uidInfo);
}
    agent.notify(moduleId, {serverId:agent.id,infos:uidInfos});
};


onlineUser.prototype.masterHandler = function(agent, msg){
    if(!msg) {
        // pull interval callback
        var list = agent.typeMap['connector'];
        if(!list || list.length === 0) {
            return;
        }
        agent.notifyByType('connector', module.exports.moduleId);
        return;
    }

    var data = agent.get(module.exports.moduleId);
    if(!data) {
        data = {};
        agent.set(module.exports.moduleId, data);
    }
    data[msg.serverId] = msg;

};
onlineUser.prototype.clientHandler = function(agent, msg, cb) {
        var connectors = this.app.getServersByType('connector');
        var users = new Array();
        for(var i =0;i < users.length;i++){
            var co = connectors[i];
            var key = co.id+moduleId;
            var oneConnectorUsers = agent.get(key);
           for(var j = 0;j <oneConnectorUsers.length; j++){
                 var user = oneConnectorUsers.infos[j];
                 users.push(user);
           }
        }
        var returnData = {result:users}
        cb(null,returnData);
};
