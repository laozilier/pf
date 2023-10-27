/**
 *  创建者： THB
 *  日期：2020/3/17
 */
let logTracer = require('tracer');

module.exports = function (env) {
    let logs;
    if(env === 'production'){
        logTracer.setLevel("warn");
        logs = logTracer.dailyfile({
            format : [
                "{{timestamp}} {{path}}:{{line}} <{{title}}> {{message}}", //default format
                {
                    error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}\n" // error format
                }
            ],
            root:'./logs/applog',
            maxLogFiles:50,
            allLogsFileName:"custom",
            dateformat:"yyyy-mm-dd HH:MM:ss.L",
        });
    } else {
        logs = logTracer.colorConsole({
            format : [
                "{{timestamp}} {{path}}:{{line}} <{{title}}> {{message}}", //default format
                {
                    error : "{{timestamp}} <{{title}}> {{message}} (in {{file}}:{{line}})\nCall Stack:\n{{stack}}" // error format
                }
            ],
            dateformat : "yyyy-mm-dd HH:MM:ss.L",
            preprocess :  function(data){
                data.title = data.title.toUpperCase();
                try{
                    data.path = data.path.split("app")[1];
                } catch (e) {
                    APP_LOG.error("打印路径错误");
                }
            }
        });
    }
    return logs;
};