/**
 *  创建者： THB
 *  日期：2020/5/25
 *  koa2组件
 */
const path = require('path');
const fs = require('fs');
const Koa = require('koa');
const http = require('http');
const cors = (require('koa2-cors'));

class PomeloKoa{
    constructor(app, opts) {
        this.app = app;
        this.config = require(path.join(this.app.getBase(), 'config/koa.json'));
        this.koa = new Koa();
    }

    start(cb){
        let routerPath = [];  //路由路径
        let loadPath = [];    //require模块路径
        const rootPath = path.join(this.app.getBase(), 'app/servers', this.app.getServerType(), 'routers'); //路由文件目录
        if(!fs.existsSync(rootPath)){
            process.nextTick(cb);
            return;
        }


        //**************** 加载目录里的文件 *******************//
        function readDirSync (dir, list, loads) {
            let dirList = fs.readdirSync(path.join(rootPath, dir));
            dirList.forEach(function (ele) {
                let uri = path.join(dir, ele);
                let item = fs.statSync(path.join(rootPath, dir, ele));
                if (item.isDirectory()) {
                    loads += "/" + ele;
                    readDirSync(uri, list, loads);
                } else if(ele === 'index.js'){
                    loadPath.push(loads +"/");
                    list.push(dir);
                } else {
                    loadPath.push(loads +"/"+ ele.replace(".js", ''));
                    list.push(uri);
                }
            });
            return list;
        }



        //***************** 加载所有文件与目录名 ********************/
        fs.readdirSync(rootPath).forEach(el => {
            let uri = path.join(rootPath,el);
            let item = fs.statSync(uri);
            if(item.isDirectory()){
                readDirSync(el, routerPath, "/"+el);
            } else if(el === 'index.js'){
                loadPath.push("/");
                routerPath.push("");
            } else {
                loadPath.push("/" + el.replace(".js", ''));
                routerPath.push(el);
            }
        });

        /** 解决跨域 */
        this.koa.use(cors({
            origin: function (ctx) {
                return '*'  // 允许来自所有域名请求
                // return 'http://localhost:8080'; / 这样就能只允许 http://localhost:8080 这个域名的请求了
            },
            exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
            maxAge: 5,
            credentials: true,
            allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS', 'PUT'],
            allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
        }));

        //**************** 在ctx中增加pomelo的App对象 **************/
        this.koa.use(async (ctx, next) => {
            // const start = new Date();
            ctx.pomeloApp = this.app;
            await next();
            // const ms = new Date() - start;
            // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
        });

        //***************** 注册到koa中 ********************/
        routerPath.forEach((el, i) => {
            let route = require(path.join(rootPath, el));
            route.prefix(loadPath[i]);        //路由路径
            this.koa.use(route.routes(), route.allowedMethods()); //注册接口
        });


        //**************** 开始监听 ***********************//
        this.server = http.createServer(this.koa.callback()).listen(this.config.port, this.host, ()=>{
            APP_LOG.info('Http start', this.app.getServerId(), `port: http://localhost:${this.config.port}`);
            process.nextTick(cb);
        });
    }

    afterStart(cb) {
        process.nextTick(cb);
    }

    stop(force, cb) {
        this.server.close(() => {
            console.info('关闭PomeloKoa', force);
            process.nextTick(cb);
        });
    }
}

PomeloKoa.name = '__PomeloKoa__';

module.exports = function(app, opts) {
    return new PomeloKoa(app, opts);
};